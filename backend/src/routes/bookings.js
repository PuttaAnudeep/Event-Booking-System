import express from "express";
import { body, validationResult } from "express-validator";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

const computeAvailability = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) return null;
  const bookingAgg = await Booking.aggregate([
    { $match: { event: event._id, status: { $ne: "cancelled" } } },
    { $group: { _id: "$event", total: { $sum: "$quantity" } } }
  ]);
  const booked = bookingAgg[0]?.total || 0;
  const remaining = Math.max(event.capacity - booked, 0);
  return { event, booked, remaining };
};

router.post(
  "/",
  protect,
  [body("eventId").notEmpty(), body("quantity").isInt({ gt: 0 })],
  async (req, res) => {
    try {
      if (req.user.role === "admin") return res.status(403).json({ message: "Admins cannot book events" });
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { eventId, quantity, paymentProvider = "stripe", paymentIntentId } = req.body;
      const availability = await computeAvailability(eventId);
      if (!availability) return res.status(404).json({ message: "Event not found" });
      if (availability.remaining < quantity)
        return res.status(400).json({ message: "Not enough availability" });

      const isFree = availability.event.isFree || availability.event.price === 0;
      if (!isFree) {
        return res.status(400).json({ message: "Use Stripe checkout for paid events" });
      }

      const totalPrice = availability.event.price * quantity;
      const booking = await Booking.create({
        user: req.user._id,
        event: eventId,
        quantity,
        totalPrice,
        status: "confirmed",
        paymentProvider: isFree ? "free" : paymentProvider,
        paymentIntentId: isFree ? undefined : paymentIntentId
      });

      try {
        await sendEmail(
          req.user.email,
          "Booking confirmed",
          `Your booking for ${availability.event.title} is confirmed. Qty: ${quantity}, total: ${totalPrice}`
        );
      } catch (err) {
        console.error("Email send failed", err.message);
      }

      res.status(201).json(await booking.populate("event"));
    } catch (err) {
      console.error("Booking creation failed", err.message);
      res.status(500).json({ message: "Unable to create booking" });
    }
  }
);

router.get("/me", protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("event")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

router.get("/", protect, adminOnly, async (_req, res) => {
  const bookings = await Booking.find({}).populate("event user").sort({ createdAt: -1 });
  res.json(bookings);
});

router.patch("/:id/cancel", protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("event");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (String(booking.user) !== String(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ message: "Not allowed" });
  booking.status = "cancelled";
  await booking.save();
  res.json(booking);
});

export default router;
