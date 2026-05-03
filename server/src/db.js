import "dotenv/config";
import mongoose from "mongoose";
import { students } from "./data.js";
import { Student } from "./models/Student.js";

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_performance_analyzer";

export async function connectDatabase() {
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

export async function seedStudentsIfEmpty() {
  const count = await Student.countDocuments();
  if (count === 0) {
    await Student.insertMany(students);
    console.log("Seeded sample students in MongoDB.");
  }
}
