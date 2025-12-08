import express from "express";
import Stripe from "stripe";
import { body, validationResult } from "express-validator";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/auth.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();
let stripeInstance = null;
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe secret key (STRIPE_SECRET_KEY) is missing");
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  }
  return stripeInstance;
};

const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

const buildCalendarInvite = (event, booking) => {
  const uid = `${booking._id}@eventia`;
  const dtStart = new Date(event.startTime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const dtEnd = new Date(event.endTime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventia//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:You booked ${booking.quantity} ticket(s).`,
    `LOCATION:${event.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  return {
    filename: `${event.title || "event"}.ics`,
    content: body,
    contentType: "text/calendar"
  };
};

router.post(
  "/stripe/checkout",
  protect,
  [body("eventId").notEmpty(), body("quantity").isInt({ gt: 0 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      if (!process.env.STRIPE_SECRET_KEY) return res.status(400).json({ message: "Stripe not configured" });

      const { eventId, quantity } = req.body;
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
      if (event.isFree || event.price === 0) return res.status(400).json({ message: "This event is free; no payment needed" });
      if (event.startTime <= new Date()) return res.status(400).json({ message: "Bookings are closed because this event has already started" });

      // Ensure capacity before redirecting to Stripe
      const existing = await Booking.aggregate([
        { $match: { event: event._id, status: { $ne: "cancelled" } } },
        { $group: { _id: "$event", total: { $sum: "$quantity" } } }
      ]);
      const booked = existing[0]?.total || 0;
      const remaining = Math.max(event.capacity - booked, 0);
      if (remaining < quantity) return res.status(400).json({ message: "Not enough availability" });

      const stripe = getStripe();

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            quantity,
            price_data: {
              currency: "usd",
              unit_amount: Math.round(event.price * 100),
              product_data: { name: event.title, description: event.location }
            }
          }
        ],
        success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/events/${eventId}?cancelled=1`,
        metadata: {
          eventId: event._id.toString(),
          quantity: quantity.toString(),
          userId: req.user._id.toString()
        },
        client_reference_id: `${event._id}:${req.user._id}`
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error("Stripe checkout error", err.message);
      res.status(500).json({ message: "Unable to start checkout" });
    }
  }
);

router.get("/stripe/confirm", protect, async (req, res) => {
  const { session_id: sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ message: "session_id is required" });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(400).json({ message: "Stripe not configured" });

  try {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.payment_status !== "paid") return res.status(400).json({ message: "Payment not completed" });

    const { eventId, quantity, userId } = session.metadata || {};
    if (!eventId || !quantity || !userId) return res.status(400).json({ message: "Missing session metadata" });
    if (userId !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

    const existing = await Booking.findOne({ paymentIntentId: session.payment_intent });
    if (existing) return res.json(await existing.populate("event"));

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.startTime <= new Date()) return res.status(400).json({ message: "Bookings are closed because this event has already started" });

    const totalPrice = event.price * Number(quantity);
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      quantity: Number(quantity),
      totalPrice,
      status: "confirmed",
      paymentProvider: "stripe",
      paymentIntentId: session.payment_intent
    });

    try {
      const html = `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <h2 style="margin-bottom:8px;">Booking confirmed</h2>
          <p style="margin:4px 0;">Hi ${req.user.name || "there"},</p>
          <p style="margin:4px 0;">Your booking is confirmed.</p>
          <ul style="padding-left:16px;">
            <li><strong>Event:</strong> ${event.title}</li>
            <li><strong>When:</strong> ${new Date(event.startTime).toLocaleString()} - ${new Date(event.endTime).toLocaleString()}</li>
            <li><strong>Where:</strong> ${event.location}</li>
            <li><strong>Tickets:</strong> ${quantity}</li>
            <li><strong>Total:</strong> ${totalPrice.toFixed(2)}</li>
          </ul>
          <p style="margin:4px 0;">Add it to your calendar with the attached invite.</p>
          <p style="margin:12px 0 0 0;">Thanks for booking with Eventia.</p>
        </div>
      `;
      const invite = buildCalendarInvite(event, booking);
      await sendEmail(
        req.user.email,
        "Booking confirmed",
        `Your booking for ${event.title} is confirmed. Qty: ${quantity}, total: ${totalPrice}`,
        html,
        [invite]
      );
    } catch (err) {
      console.error("Email send failed", err.message);
    }

    res.status(201).json(await booking.populate("event"));
  } catch (err) {
    console.error("Stripe confirm error", err.message);
    res.status(500).json({ message: "Unable to confirm payment" });
  }
});

export default router;
