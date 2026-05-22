import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test routes
app.post("/auth/register", async (req, res) => {
  console.log("Received registration request:", req.body);
  res.json({ message: "Test successful", data: req.body });
});

app.get("/", (req, res) => res.send("API Running"));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
  }
};

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});