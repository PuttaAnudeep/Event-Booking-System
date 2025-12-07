import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Event from "./models/Event.js";
import User from "./models/User.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  await Event.deleteMany();
  await User.deleteMany();

  const admin = await User.create({
    name: "Admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin"
  });

  const testUser = await User.create({
    name: "Test User",
    email: "user@example.com",
    password: "password123",
    role: "user"
  });

  const events = [
    {
      title: "City Lights Concert",
      description: "Outdoor live music.",
      category: "concert",
      location: "Central Park",
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      capacity: 250,
      price: 75,
      imageUrl: "https://picsum.photos/seed/concert/600/400"
    },
    {
      title: "Tech Future Conference",
      description: "Talks on AI, cloud, and dev tools.",
      category: "conference",
      location: "Convention Center",
      startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      capacity: 500,
      price: 199,
      imageUrl: "https://picsum.photos/seed/conference/600/400"
    }
  ];

  await Event.insertMany(events);
  console.log("Seeded accounts:");
  console.log(" admin@example.com / password123 (admin)");
  console.log(" user@example.com / password123 (user)");
  console.log("Seeded sample events");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
