import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import cron from "node-cron";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";
import Event from "./models/Event.js";
import Booking from "./models/Booking.js";
import { sendEmail } from "./utils/sendEmail.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
  startMaintenanceJobs();
});

const startMaintenanceJobs = () => {
  const run = async () => {
    try {
      await expirePastEvents();
      await sendUpcomingReminders();
    } catch (err) {
      console.error("Maintenance job failed", err.message);
    }
  };
  // run once at boot, then hourly via cron to survive long runtimes
  run();
  cron.schedule("0 * * * *", run);
};

const expirePastEvents = async () => {
  const now = new Date();
  const events = await Event.find({ endTime: { $lt: now }, isExpired: false });
  if (!events.length) return;
  const ids = events.map((e) => e._id);
  await Event.updateMany({ _id: { $in: ids } }, { isExpired: true, isPublished: false });
  console.log(`Expired ${ids.length} events`);
};

const sendUpcomingReminders = async () => {
  const now = new Date();
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const bookings = await Booking.find({
    status: "confirmed",
    reminderSent: false
  }).populate("event").populate("user");

  const due = bookings.filter((b) => b.event && b.event.startTime > now && b.event.startTime <= in24h);
  for (const booking of due) {
    try {
      const event = booking.event;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <h2 style="margin-bottom:8px;">Event reminder</h2>
          <p style="margin:4px 0;">Hi ${booking.user.name || "there"},</p>
          <p style="margin:4px 0;">Your event is coming up soon.</p>
          <ul style="padding-left:16px;">
            <li><strong>Event:</strong> ${event.title}</li>
            <li><strong>When:</strong> ${new Date(event.startTime).toLocaleString()} - ${new Date(event.endTime).toLocaleString()}</li>
            <li><strong>Where:</strong> ${event.location}</li>
            <li><strong>Tickets:</strong> ${booking.quantity}</li>
          </ul>
          <p style="margin:12px 0 0 0;">See you there!</p>
        </div>
      `;
      await sendEmail(
        booking.user.email,
        "Event reminder",
        `Reminder: ${event.title} starts at ${new Date(event.startTime).toLocaleString()}.`,
        html
      );
      booking.reminderSent = true;
      await booking.save();
    } catch (err) {
      console.error("Reminder send failed", err.message);
    }
  }
  if (due.length) console.log(`Sent ${due.length} reminders`);
};
