# 📄 Resume-Worthy README.md for ResumeScore

Here's a professional README file that showcases your project effectively for your resume/portfolio.

## 📌 Overview

**ResumeScore** is a full-stack web application that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS). Using AI-powered analysis, it provides real-time feedback, keyword matching, and actionable recommendations to improve resume compatibility.

> 🚀 **Live Demo:** [View Live Application]((https://ats-resume-score.netlify.app/))

### 🎥 Project Showcase

[![Project Demo](https://img.shields.io/badge/Watch-Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](your-demo-link)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered Analysis** | Uses Google Gemini AI to analyze resumes against job descriptions |
| 📊 **ATS Compatibility Score** | Calculates keyword match percentage with weighted scoring |
| 📄 **PDF Resume Parsing** | Extracts text from uploaded PDF resumes |
| 💡 **Smart Suggestions** | Provides optimization tips and missing keywords |
| 🌓 **Dark/Light Mode** | User preference theming for comfortable viewing |
| 📱 **Responsive Design** | Fully responsive UI that works on all devices |
| 🔐 **JWT Authentication** | Secure user authentication and session management |
| 📈 **Analysis History** | Stores and displays previous resume analyses |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **Vite** | Build Tool |
| **React Router v6** | Client-side Routing |
| **Axios** | HTTP Client |
| **Framer Motion** | Animations |
| **React Toastify** | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express.js** | Web Framework |
| **MongoDB Atlas** | Database |
| **Mongoose** | ODM |
| **JWT** | Authentication |
| **bcryptjs** | Password Hashing |
| **Multer** | File Upload |
| **pdf-parse** | PDF Parsing |

### AI & APIs
| Technology | Purpose |
|------------|---------|
| **Google Gemini AI** | Resume Analysis |
| **REST API** | Communication |

### Deployment
| Platform | Service |
|----------|---------|
| **Railway** | Backend Hosting |
| **Netlify** | Frontend Hosting |
| **MongoDB Atlas** | Database Hosting |

---

## 📁 Project Structure

```
resume-ats-analyzer/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/         # React Components
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Contact.jsx
│   │   ├── context/            # React Context (Auth, Theme)
│   │   ├── utils/              # API Configuration
│   │   └── App.jsx
│   └── package.json
│
├── server/                      # Node.js Backend
│   ├── models/                 # MongoDB Models
│   │   ├── User.js
│   │   └── Resume.js
│   ├── controllers/            # Business Logic
│   │   ├── authController.js
│   │   └── resumeController.js
│   ├── routes/                 # API Routes
│   │   ├── authRoutes.js
│   │   └── resumeRoutes.js
│   ├── middleware/             # Custom Middleware
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── errorMiddleware.js
│   ├── services/               # Business Services
│   │   ├── atsService.js
│   │   ├── keywordService.js
│   │   └── pdfService.js
│   └── server.js
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas Account (free tier)
- Google Gemini API Key

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/hitheesha10/resume-analyzer.git
cd resume-ats-analyzer

# Install backend dependencies
cd server
npm install

# Create .env file
cp .env.example .env

# Update .env with your credentials
# MONGODB_URI, JWT_SECRET, GEMINI_API_KEY

# Start backend server
npm run dev
```

### Frontend Setup

```bash
# Open new terminal
cd client

# Install frontend dependencies
npm install

# Create .env.production
echo "VITE_API_URL=http://localhost:5000" > .env.production

# Start frontend development server
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend (.env.production)
```env
VITE_API_URL=(https://resumescore-api-production.up.railway.app/)
```

---

## 📡 API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |

### Resume Routes (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resume/upload` | Upload and parse PDF resume |
| POST | `/resume/analyze` | Analyze resume against job description |
| GET | `/resume/history` | Get user's analysis history |
| GET | `/resume/:id` | Get specific analysis |
| DELETE | `/resume/:id` | Delete analysis |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

---

## 🎯 Sample API Request

### Register User

```bash
curl -X POST https://your-api.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"123456"}'
```

### Analyze Resume

```bash
curl -X POST https://your-api.up.railway.app/resume/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Experienced React developer with 5 years...",
    "jobDescription": "Looking for a React developer with...",
    "fileName": "resume.pdf"
  }'
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "atsScore": 78,
    "keywordAnalysis": {
      "totalKeywords": 15,
      "matchingKeywords": 12,
      "matchPercentage": 80,
      "missingKeywords": ["AWS", "Docker"]
    },
    "suggestions": {
      "strengths": ["Good React knowledge", "Relevant experience"],
      "optimizationTips": ["Add AWS experience", "Include Docker"],
      "overallAssessment": "Good match! Add missing keywords..."
    }
  }
}
```

---

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd server
npm test

# Frontend tests
cd client
npm test

# Build for production
npm run build
```

---

## 🚢 Deployment

### Backend (Railway)

1. Push code to GitHub
2. Connect repository to Railway
3. Add environment variables
4. Set Root Directory to `server`
5. Deploy

### Frontend (Netlify)

1. Build project: `npm run build`
2. Deploy `dist` folder to Netlify
3. Or connect GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String,
  createdAt: Date
}
```

### Resume Model
```javascript
{
  userId: ObjectId (ref: User),
  fileName: String,
  originalText: String,
  jdText: String,
  atsScore: Number,
  keywordAnalysis: Object,
  suggestions: Object,
  createdAt: Date
}
```

---

## 🔒 Security Features

- 🔐 **JWT Authentication** with expiration
- 🧂 **Password Hashing** using bcryptjs
- 🛡️ **Helmet.js** for security headers
- 🌐 **CORS** configuration
- ⏱️ **Rate Limiting** (optional)
- 📝 **Input Validation** (optional)

---

## 📈 Performance Optimizations

- ⚡ **Vite** for fast builds and HMR
- 📦 **Code Splitting** with React.lazy
- 🖼️ **Lazy Loading** for images
- 🗄️ **MongoDB Indexes** for faster queries
- 🔄 **Axios Interceptors** for token management

---

## 🎨 Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary Dark Blue | `#1a365d` | Headings, Buttons |
| Secondary Blue | `#2b6cb0` | Accents, Links |
| Light Blue | `#ebf8ff` | Backgrounds |
| White | `#ffffff` | Cards, Modals |
| Text Dark | `#2d3748` | Body Text |

---

## 📚 Future Enhancements

- [ ] Bulk resume upload and analysis
- [ ] Resume template suggestions
- [ ] Export analysis as PDF report
- [ ] Email notifications
- [ ] Social authentication (Google, LinkedIn)
- [ ] Resume version comparison
- [ ] Industry-specific keyword databases
- [ ] API rate limiting with Redis

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/hitheesha10)
- LinkedIn: [Your Name](https://linkedin.com/in/hitheesha-somu)
---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Gemini AI for analysis capabilities
- MongoDB Atlas for free database hosting
- Railway for backend deployment
- Netlify for frontend hosting

---

## 📞 Contact

For questions or feedback, please reach out:
- Email: your.email@example.com
- Project Link: [https://github.com/hitheesha10/resume-analyzer](https://github.com/hitheesha10/resume-analyzer)

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

**Built with ❤️ by Hitheesha**
```

## 📋 What to Replace

| Placeholder | Replace With |
|-------------|--------------|
| `Hitheesha10` | Your GitHub username |
| `(https://ats-resume-score.netlify.app/)` | Your Netlify deployment URL |
| `https://resumescore-api-production.up.railway.app/` | Your Railway deployment URL |
| `Hitheesha` | Your actual name |
| `hitheesha10@gmail.com` | Your email address 

