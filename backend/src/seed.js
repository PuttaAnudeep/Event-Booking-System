import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import Event from "./models/Event.js";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const seed = async () => {
  await connectDB();
  await Event.deleteMany();
  await User.deleteMany();

  const admin = await User.create({
    name: "Event Admin",
    email: "a@gmail.com",
    password: "Password@123",
    role: "admin"
  });

  const testUser = await User.create({
    name: "Test User",
    email: "user@example.com",
    password: "password123",
    role: "user"
  });

  const base = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const events = [
    {
      title: "Sunset Jazz on the Bay",
      description: "An open-air jazz evening with waterfront views and local cuisine pop-ups.",
      category: "concert",
      eventType: "in-person",
      location: "Harbor Amphitheater, SF",
      startTime: new Date(base + 3 * day),
      endTime: new Date(base + 3 * day + 2 * 60 * 60 * 1000),
      capacity: 180,
      price: 65,
      isFree: false
    },
    {
      title: "Product Strategy Masterclass",
      description: "Hands-on workshop covering discovery, roadmap prioritization, and launch metrics.",
      category: "conference",
      eventType: "online",
      location: "Virtual (Zoom)",
      startTime: new Date(base + 5 * day),
      endTime: new Date(base + 5 * day + 3 * 60 * 60 * 1000),
      capacity: 300,
      price: 120,
      isFree: false
    },
    {
      title: "Founders Breakfast Meetup",
      description: "Casual breakfast for early-stage founders to swap learnings and meet investors.",
      category: "conference",
      eventType: "in-person",
      location: "SoMa Collective, SF",
      startTime: new Date(base + 7 * day + 9 * 60 * 60 * 1000),
      endTime: new Date(base + 7 * day + 11 * 60 * 60 * 1000),
      capacity: 60,
      price: 0,
      isFree: true
    },
    {
      title: "AI for Ops Bootcamp",
      description: "Build and deploy AI-driven observability and incident response automations.",
      category: "conference",
      eventType: "hybrid",
      location: "Mission Hub + Virtual",
      startTime: new Date(base + 9 * day),
      endTime: new Date(base + 9 * day + 6 * 60 * 60 * 1000),
      capacity: 220,
      price: 150,
      isFree: false
    },
    {
      title: "Wellness Run & Brunch",
      description: "5K community run followed by a chef-led seasonal brunch and nutrition Q&A.",
      category: "sports",
      eventType: "in-person",
      location: "Crissy Field, SF",
      startTime: new Date(base + 11 * day + 7 * 60 * 60 * 1000),
      endTime: new Date(base + 11 * day + 10 * 60 * 60 * 1000),
      capacity: 120,
      price: 25,
      isFree: false
    },
    {
      title: "Design Systems Lab",
      description: "Practical session on tokens, theming, accessibility, and multi-brand rollouts.",
      category: "conference",
      eventType: "online",
      location: "Virtual (Teams)",
      startTime: new Date(base + 13 * day),
      endTime: new Date(base + 13 * day + 4 * 60 * 60 * 1000),
      capacity: 250,
      price: 90,
      isFree: false
    },
    {
      title: "Indie Film Night",
      description: "Screening of award-winning shorts with director Q&A and networking.",
      category: "other",
      eventType: "in-person",
      location: "Roxie Theater, SF",
      startTime: new Date(base + 15 * day + 18 * 60 * 60 * 1000),
      endTime: new Date(base + 15 * day + 21 * 60 * 60 * 1000),
      capacity: 140,
      price: 30,
      isFree: false
    },
    {
      title: "Remote Team Retreat (Virtual)",
      description: "A playful half-day with guided games, breakout rooms, and facilitation tips for remote teams.",
      category: "other",
      eventType: "online",
      location: "Virtual (Meet)",
      startTime: new Date(base + 17 * day),
      endTime: new Date(base + 17 * day + 3 * 60 * 60 * 1000),
      capacity: 400,
      price: 0,
      isFree: true
    },
    {
      title: "Investor Readiness Sprint",
      description: "Two-day sprint to refine deck, metrics, and diligence data room with mentor feedback.",
      category: "conference",
      eventType: "hybrid",
      location: "Foundry Hub + Virtual",
      startTime: new Date(base + 20 * day),
      endTime: new Date(base + 21 * day),
      capacity: 80,
      price: 350,
      isFree: false
    }
  ];

  const inserted = await Event.insertMany(events);
  admin.managedEvents = inserted.map((e) => e._id);
  await admin.save();

  console.log("Seeded accounts:");
  console.log(" a@gmail.com / Password@123 (admin)");
  console.log(" user@example.com / password123 (user)");
  console.log("Seeded sample events: ", inserted.length);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
