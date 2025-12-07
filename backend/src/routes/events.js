import express from "express";
import { body, validationResult } from "express-validator";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const events = await Event.find({ isPublished: true }).sort({ startTime: 1 });
  res.json(events);
});

router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

router.get("/:id/availability", async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  const booked = await Booking.aggregate([
    { $match: { event: event._id, status: { $ne: "cancelled" } } },
    { $group: { _id: "$event", total: { $sum: "$quantity" } } }
  ]);
  const totalBooked = booked[0]?.total || 0;
  const remaining = Math.max(event.capacity - totalBooked, 0);
  res.json({ capacity: event.capacity, booked: totalBooked, remaining });
});

router.post(
  "/",
  protect,
  adminOnly,
  [
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("location").notEmpty(),
    body("startTime").isISO8601(),
    body("endTime").isISO8601(),
    body("capacity").isInt({ gt: 0 }),
    body("price").isFloat({ gt: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const event = await Event.create(req.body);
    res.status(201).json(event);
  }
);

router.put(
  "/:id",
  protect,
  adminOnly,
  [
    body("title").optional().notEmpty(),
    body("description").optional().notEmpty(),
    body("location").optional().notEmpty(),
    body("startTime").optional().isISO8601(),
    body("endTime").optional().isISO8601(),
    body("capacity").optional().isInt({ gt: 0 }),
    body("price").optional().isFloat({ gt: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  }
);

router.delete("/:id", protect, adminOnly, async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json({ message: "Event deleted" });
});

export default router;
