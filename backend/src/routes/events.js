import express from "express";
import { body, validationResult } from "express-validator";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Only allow admins to act on events they explicitly manage
const adminCanAccessEvent = (user, eventId) => {
  const managed = user?.managedEvents || [];
  if (!managed.length) return false;
  return managed.some((id) => String(id) === String(eventId));
};

router.get("/", async (_req, res) => {
  try {
    const events = await Event.find({ isPublished: true }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    console.error("List events failed", err.message);
    res.status(500).json({ message: "Unable to load events" });
  }
});

router.get("/manage", protect, adminOnly, async (req, res) => {
  try {
    if (!req.user.managedEvents?.length) return res.json([]);
    const events = await Event.find({ _id: { $in: req.user.managedEvents } }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    console.error("Manage events failed", err.message);
    res.status(500).json({ message: "Unable to load managed events" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("Get event failed", err.message);
    res.status(500).json({ message: "Unable to load event" });
  }
});

router.get("/:id/availability", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const booked = await Booking.aggregate([
      { $match: { event: event._id, status: { $ne: "cancelled" } } },
      { $group: { _id: "$event", total: { $sum: "$quantity" } } }
    ]);
    const totalBooked = booked[0]?.total || 0;
    const remaining = Math.max(event.capacity - totalBooked, 0);
    res.json({ capacity: event.capacity, booked: totalBooked, remaining });
  } catch (err) {
    console.error("Availability failed", err.message);
    res.status(500).json({ message: "Unable to load availability" });
  }
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
    body("price").isFloat({ min: 0 }),
    body("isFree").optional().isBoolean(),
    body("eventType").optional().isIn(["in-person", "online", "hybrid", "other"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      if (req.body.isFree) req.body.price = 0;
      const event = await Event.create(req.body);
      if (req.user.role === "admin") {
        const already = req.user.managedEvents?.some((id) => String(id) === String(event._id));
        if (!already) {
          req.user.managedEvents = [...(req.user.managedEvents || []), event._id];
          await req.user.save();
        }
      }
      res.status(201).json(event);
    } catch (err) {
      console.error("Create event failed", err.message);
      res.status(500).json({ message: "Unable to create event" });
    }
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
    body("price").optional().isFloat({ min: 0 }),
    body("isFree").optional().isBoolean(),
    body("eventType").optional().isIn(["in-person", "online", "hybrid", "other"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      if (req.body.isFree) req.body.price = 0;
      if (!adminCanAccessEvent(req.user, req.params.id)) return res.status(403).json({ message: "Not allowed for this event" });
      const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.json(event);
    } catch (err) {
      console.error("Update event failed", err.message);
      res.status(500).json({ message: "Unable to update event" });
    }
  }
);

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!adminCanAccessEvent(req.user, req.params.id)) return res.status(403).json({ message: "Not allowed for this event" });
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Delete event failed", err.message);
    res.status(500).json({ message: "Unable to delete event" });
  }
});

export default router;
