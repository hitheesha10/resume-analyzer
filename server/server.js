import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ATS Resume Analyzer API",
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
      resume: "/resume"
    }
  });
});

app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);
// Global error handlers for production
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    // IMPORTANT: Listen on '0.0.0.0' for Render
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB Error:", err.message);
    // Still start server even without MongoDB for testing
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Server running without MongoDB on port ${PORT}`);
    });
  });