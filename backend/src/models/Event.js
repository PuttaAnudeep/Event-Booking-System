import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["concert", "conference", "sports", "other"], default: "other" },
    location: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
