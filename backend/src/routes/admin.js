import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Set managed events for an admin user
router.put("/admins/:id/managed-events", protect, adminOnly, async (req, res) => {
  const { eventIds } = req.body;
  if (!Array.isArray(eventIds)) return res.status(400).json({ message: "eventIds must be an array" });
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "admin") return res.status(404).json({ message: "Admin not found" });
  user.managedEvents = eventIds;
  await user.save();
  res.json({ managedEvents: user.managedEvents });
});

export default router;
