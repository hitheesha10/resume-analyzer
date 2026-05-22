import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ========== MODELS ==========
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre("save", async function() {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Compare password method
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: String,
  originalText: String,
  jdText: String,
  atsScore: Number,
  keywordAnalysis: Object,
  suggestions: Object,
  createdAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model("Resume", resumeSchema);

// ========== MULTER SETUP ==========
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ========== AUTH MIDDLEWARE ==========
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "secret");
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ========== HELPER FUNCTIONS ==========
async function parseResume(fileBuffer) {
  try {
    const uint8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(" ") + " ";
    }
    return fullText.replace(/\s+/g, " ").trim();
  } catch (err) {
    console.error("PDF Parse Error:", err);
    throw new Error("Failed to parse PDF");
  }
}

function extractKeywords(text) {
  if (!text) return [];
  const words = text.toLowerCase().match(/\b[a-z0-9]{3,}\b/g) || [];
  const stopWords = new Set(["the","and","for","with","this","that","are","was","were","have","has","had","but","not","you","your","from","they","will","can","all","been","our","their","about","what","which","when","where","who","how","could","would","should"]);
  return words.filter(word => !stopWords.has(word));
}

function calculateATSScore(jdKeywords, resumeKeywords) {
  if (!jdKeywords.length) return { score: 0, totalJDKeywords: 0, matchingKeywords: 0, missingKeywords: [] };
  const uniqueJD = [...new Set(jdKeywords)];
  const resumeSet = new Set(resumeKeywords);
  const matches = uniqueJD.filter(k => resumeSet.has(k));
  const missing = uniqueJD.filter(k => !resumeSet.has(k));
  return {
    score: Math.round((matches.length / uniqueJD.length) * 100),
    totalJDKeywords: uniqueJD.length,
    matchingKeywords: matches.length,
    missingKeywords: missing.slice(0, 20)
  };
}

// ========== ROUTES ==========
app.get("/", (req, res) => {
  res.json({ success: true, message: "ResumeScore API is running", version: "1.0.0" });
});

// Register
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }
    
    const user = await User.create({ name, email, password });
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    
    const isValid = user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upload Resume
app.post("/resume/upload", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    
    const text = await parseResume(req.file.buffer);
    
    if (!text || text.length < 50) {
      return res.status(400).json({ success: false, error: "Could not extract meaningful text" });
    }
    
    res.json({
      success: true,
      data: {
        text: text,
        preview: text.substring(0, 500),
        fileName: req.file.originalname
      }
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Analyze Resume
app.post("/resume/analyze", authMiddleware, async (req, res) => {
  try {
    const { resumeText, jobDescription, fileName } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    const jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);
    const atsResult = calculateATSScore(jdKeywords, resumeKeywords);
    
    const suggestions = {
      compatibility_score: atsResult.score,
      strengths: ["Good technical skills", "Relevant experience identified"],
      weaknesses: ["Add more specific details", "Quantify achievements"],
      missing_keywords: atsResult.missingKeywords,
      optimization_tips: [
        "Add missing keywords to your resume",
        "Use bullet points for better readability",
        "Include quantifiable achievements"
      ],
      overall_assessment: `Your resume matches ${atsResult.matchingKeywords} out of ${atsResult.totalJDKeywords} key skills.`
    };
    
    const result = {
      success: true,
      atsScore: atsResult.score,
      keywordAnalysis: {
        totalKeywords: atsResult.totalJDKeywords,
        matchingKeywords: atsResult.matchingKeywords,
        missingKeywords: atsResult.missingKeywords
      },
      suggestions: suggestions
    };
    
    // Save to database
    if (req.user) {
      await Resume.create({
        userId: req.user.id,
        fileName: fileName || "Uploaded Resume",
        originalText: resumeText.substring(0, 3000),
        jdText: jobDescription.substring(0, 2000),
        atsScore: atsResult.score,
        keywordAnalysis: atsResult,
        suggestions: suggestions
      });
    }
    
    res.json(result);
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get history
app.get("/resume/history", authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB Error:", err.message);
    // Start server even without MongoDB for testing
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Server running without MongoDB on port ${PORT}`);
    });
  });