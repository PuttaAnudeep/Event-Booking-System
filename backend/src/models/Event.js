import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["concert", "conference", "sports", "workshop", "webinar", "meetup", "festival", "other"],
      default: "other"
    },
    eventType: { type: String, enum: ["in-person", "online", "hybrid", "other"], default: "in-person" },
    location: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true },
    isFree: { type: Boolean, default: false },
    imageUrl: { type: String },
    isPublished: { type: Boolean, default: true },
    isExpired: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
