import express from "express";
import Stripe from "stripe";
import { body, validationResult } from "express-validator";
import Event from "../models/Event.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });

router.post(
  "/create-intent",
  protect,
  [body("eventId").notEmpty(), body("quantity").isInt({ gt: 0 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!process.env.STRIPE_SECRET_KEY)
      return res.status(400).json({ message: "Stripe not configured" });

    const { eventId, quantity } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const amount = Math.round(event.price * quantity * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { eventId, quantity, userId: req.user._id.toString() }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  }
);

router.post(
  "/paypal/placeholder",
  protect,
  [body("eventId").notEmpty(), body("quantity").isInt({ gt: 0 })],
  async (req, res) => {
    res.json({ approvalUrl: "https://www.paypal.com/checkoutnow?token=placeholder" });
  }
);

export default router;
