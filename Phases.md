# Complete Development Phases
## Web-Based Intelligent Plagiarism Detection System
### From Zero to Deployed — Professional Build Plan

---

# OVERVIEW OF ALL PHASES

```
┌─────────────────────────────────────────────────────────────────┐
│                    MASTER BUILD PLAN                            │
├────────┬────────────────────────────────────────┬──────────────┤
│ PHASE  │ WHAT YOU BUILD                         │ DURATION     │
├────────┼────────────────────────────────────────┼──────────────┤
│   0    │ Environment Setup & Project Structure  │ Day 1-2      │
│   1    │ Database Design & Models               │ Day 3-4      │
│   2    │ Authentication Backend                 │ Day 5-7      │
│   3    │ Authentication Frontend (UI)           │ Day 8-10     │
│   4    │ Document Upload Backend                │ Day 11-13    │
│   5    │ Document Upload Frontend (UI)          │ Day 14-16    │
│   6    │ Detection Engine Backend               │ Day 17-23    │
│   7    │ Results & Report Backend               │ Day 24-26    │
│   8    │ Results & Report Frontend (UI)         │ Day 27-30    │
│   9    │ Student Dashboard Frontend             │ Day 31-33    │
│  10    │ Lecturer Dashboard (Back + Front)      │ Day 34-38    │
│  11    │ Admin Dashboard (Back + Front)         │ Day 39-43    │
│  12    │ UI Polish, Animations & Responsive     │ Day 44-47    │
│  13    │ Testing & Bug Fixing                   │ Day 48-52    │
│  14    │ Deployment                             │ Day 53-55    │
│  15    │ Documentation & Final Review           │ Day 56-60    │
└────────┴────────────────────────────────────────┴──────────────┘
```

---

# PHASE 0: ENVIRONMENT SETUP & PROJECT STRUCTURE
## Day 1-2

---

## What This Phase Is About

```
Before writing a single line of code, you set up
your workspace professionally. This is what real
developers do in companies before any project starts.
```

---

## 0.1 Install All Required Software

```
SOFTWARE TO INSTALL ON YOUR WINDOWS MACHINE:

1. Python 3.11
   → Download from python.org
   → Check "Add Python to PATH" during install
   → Verify: open CMD → type: python --version

2. Node.js (LTS version)
   → Download from nodejs.org
   → Comes with npm automatically
   → Verify: npm --version

3. Git
   → Download from git-scm.com
   → Verify: git --version

4. VS Code
   → Download from code.visualstudio.com
   → This is your code editor

5. MongoDB Compass (GUI for database)
   → Download from mongodb.com/compass
   → For viewing your database visually

6. Postman
   → Download from postman.com
   → For testing your API before connecting frontend
```

---

## 0.2 VS Code Extensions to Install

```
INSTALL THESE EXTENSIONS IN VS CODE:

FOR PYTHON (Backend):
├── Python (by Microsoft)
├── Pylance
├── Python Indent
└── REST Client

FOR JAVASCRIPT/REACT (Frontend):
├── ES7+ React/Redux/React-Native snippets
├── Prettier - Code formatter
├── ESLint
├── Auto Rename Tag
└── Bracket Pair Color DLW

FOR GENERAL:
├── GitLens
├── Thunder Client (like Postman inside VS Code)
├── Tailwind CSS IntelliSense
└── Material Icon Theme (makes folder icons pretty)
```

---

## 0.3 Create Online Accounts

```
CREATE THESE FREE ACCOUNTS (if you don't have them):

1. github.com          → Store and version your code
2. mongodb.com         → Free cloud database
3. vercel.com          → Deploy your React frontend
4. render.com          → Deploy your Python backend
5. cloudinary.com      → Store uploaded files
6. console.cloud.google.com → Google Search API
```

---

## 0.4 Professional Folder Structure

```
THIS IS HOW YOUR PROJECT WILL BE ORGANIZED:

plagiarism-detector/               ← ROOT FOLDER
│
├── backend/                       ← ALL PYTHON CODE
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                ← App entry point
│   │   │
│   │   ├── core/
│   │   │   ├── config.py          ← Environment variables
│   │   │   ├── security.py        ← JWT, password hashing
│   │   │   └── dependencies.py    ← Shared dependencies
│   │   │
│   │   ├── database/
│   │   │   └── connection.py      ← MongoDB connection
│   │   │
│   │   ├── models/
│   │   │   ├── user.py            ← User data model
│   │   │   ├── document.py        ← Document data model
│   │   │   └── result.py          ← Detection result model
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py            ← Login/Register routes
│   │   │   ├── documents.py       ← Upload/manage docs
│   │   │   ├── detection.py       ← Run plagiarism check
│   │   │   ├── reports.py         ← Get/download reports
│   │   │   ├── lecturer.py        ← Lecturer routes
│   │   │   └── admin.py           ← Admin routes
│   │   │
│   │   ├── services/
│   │   │   ├── text_extractor.py  ← PDF/DOCX text reading
│   │   │   ├── preprocessor.py    ← Text cleaning
│   │   │   ├── similarity/
│   │   │   │   ├── cosine.py      ← Cosine similarity
│   │   │   │   ├── jaccard.py     ← Jaccard similarity
│   │   │   │   ├── bert.py        ← BERT semantic check
│   │   │   │   └── fingerprint.py ← Document fingerprint
│   │   │   ├── web_checker.py     ← Internet source check
│   │   │   ├── score_engine.py    ← Combine all scores
│   │   │   └── report_builder.py  ← Generate PDF report
│   │   │
│   │   └── utils/
│   │       ├── file_handler.py    ← File upload helpers
│   │       └── helpers.py         ← General utilities
│   │
│   ├── tests/                     ← All backend tests
│   │   ├── test_auth.py
│   │   ├── test_detection.py
│   │   └── test_documents.py
│   │
│   ├── .env                       ← Secret keys (NEVER share)
│   ├── .env.example               ← Template for .env
│   ├── requirements.txt           ← All Python dependencies
│   └── README.md
│
├── frontend/                      ← ALL REACT CODE
│   │
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── main.jsx               ← React entry point
│   │   ├── App.jsx                ← Main app component
│   │   │
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    ← Home/Welcome page
│   │   │   ├── LoginPage.jsx      ← Login page
│   │   │   ├── RegisterPage.jsx   ← Register page
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── UploadPage.jsx
│   │   │   │   ├── HistoryPage.jsx
│   │   │   │   └── ReportPage.jsx
│   │   │   ├── lecturer/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── SubmissionsPage.jsx
│   │   │   │   └── ReportPage.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── UsersPage.jsx
│   │   │       └── SettingsPage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ProgressBar.jsx
│   │   │   ├── upload/
│   │   │   │   ├── DropZone.jsx
│   │   │   │   └── FilePreview.jsx
│   │   │   ├── report/
│   │   │   │   ├── SimilarityGauge.jsx
│   │   │   │   ├── HighlightedText.jsx
│   │   │   │   ├── SourceList.jsx
│   │   │   │   └── ScoreBreakdown.jsx
│   │   │   └── charts/
│   │   │       ├── SimilarityChart.jsx
│   │   │       └── StatsChart.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx    ← Global auth state
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js         ← Auth custom hook
│   │   │   └── useDocument.js     ← Document custom hook
│   │   │
│   │   ├── services/
│   │   │   ├── api.js             ← Axios base config
│   │   │   ├── authService.js     ← Auth API calls
│   │   │   ├── documentService.js ← Document API calls
│   │   │   └── reportService.js   ← Report API calls
│   │   │
│   │   ├── utils/
│   │   │   └── helpers.js         ← Utility functions
│   │   │
│   │   └── styles/
│   │       └── index.css          ← Global styles
│   │
│   ├── .env                       ← Frontend env variables
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore                     ← Files Git should ignore
└── README.md                      ← Project documentation
```

---

## 0.5 GitHub Setup

```
STEPS:
1. Create a new repository on GitHub
   → Name: plagiarism-detection-system
   → Set to PUBLIC (required for free Vercel/Render)
   → Add README

2. Clone to your machine:
   git clone [your-repo-url]

3. Create branch structure:
   main        ← Production (live site)
   develop     ← Development branch
   feature/*   ← Individual features

PROFESSIONAL GIT WORKFLOW:
Every feature → new branch → pull request → merge to develop
When ready → merge develop to main → auto deploys
```

---

## Phase 0 Completion Checklist

```
✅ Python installed and working
✅ Node.js installed and working
✅ Git installed and working
✅ VS Code set up with extensions
✅ All online accounts created
✅ GitHub repo created
✅ Folder structure created
✅ VS Code opened at root folder
```

---

---

# PHASE 1: DATABASE DESIGN & MODELS
## Day 3-4

---

## What This Phase Is About

```
Design EXACTLY what data gets stored in your database.
No code yet in this phase description — just understanding
what each collection holds and why.
```

---

## 1.1 MongoDB Atlas Setup

```
STEPS:
1. Log into mongodb.com
2. Create a FREE cluster (M0 - Free Forever)
3. Create database user (username + password)
4. Whitelist IP address (allow from anywhere for dev)
5. Get your connection string (MongoDB URI)
6. Save it safely → goes in your .env file

YOUR DATABASE NAME: plagiarism_db
```

---

## 1.2 Collections (Tables) You Will Create

### Collection 1: USERS
```
PURPOSE: Store everyone who uses the system

FIELDS:
┌─────────────────┬────────────┬──────────────────────────────┐
│ FIELD           │ TYPE       │ PURPOSE                      │
├─────────────────┼────────────┼──────────────────────────────┤
│ _id             │ ObjectId   │ Unique identifier            │
│ full_name       │ String     │ User's full name             │
│ email           │ String     │ Login email (must be unique) │
│ password        │ String     │ Hashed password              │
│ role            │ String     │ "student/lecturer/admin"     │
│ student_id      │ String     │ For students only            │
│ department      │ String     │ User's department            │
│ institution     │ String     │ School name                  │
│ is_active       │ Boolean    │ Account enabled or disabled  │
│ is_verified     │ Boolean    │ Email verified or not        │
│ profile_image   │ String     │ URL to profile picture       │
│ created_at      │ DateTime   │ When account was created     │
│ last_login      │ DateTime   │ Last login time              │
└─────────────────┴────────────┴──────────────────────────────┘
```

### Collection 2: DOCUMENTS
```
PURPOSE: Store every uploaded academic document

FIELDS:
┌───────────────────┬────────────┬──────────────────────────────┐
│ FIELD             │ TYPE       │ PURPOSE                      │
├───────────────────┼────────────┼──────────────────────────────┤
│ _id               │ ObjectId   │ Unique identifier            │
│ user_id           │ ObjectId   │ Who uploaded it              │
│ title             │ String     │ Document title               │
│ filename          │ String     │ Original file name           │
│ file_url          │ String     │ Where file is stored         │
│ file_type         │ String     │ "pdf / docx / txt"           │
│ file_size         │ Number     │ Size in bytes                │
│ word_count        │ Number     │ Total words in document      │
│ extracted_text    │ String     │ Raw extracted text           │
│ clean_text        │ String     │ Preprocessed clean text      │
│ fingerprint       │ Array      │ Document fingerprint hashes  │
│ course            │ String     │ Course it was submitted for  │
│ academic_year     │ String     │ e.g. "2024/2025"             │
│ status            │ String     │ "pending/processing/done"    │
│ submitted_at      │ DateTime   │ Upload timestamp             │
│ processed_at      │ DateTime   │ When detection completed     │
└───────────────────┴────────────┴──────────────────────────────┘
```

### Collection 3: DETECTION RESULTS
```
PURPOSE: Store the plagiarism detection output

FIELDS:
┌───────────────────────┬──────────┬──────────────────────────────┐
│ FIELD                 │ TYPE     │ PURPOSE                      │
├───────────────────────┼──────────┼──────────────────────────────┤
│ _id                   │ ObjectId │ Unique identifier            │
│ document_id           │ ObjectId │ Links to document            │
│ user_id               │ ObjectId │ Links to user                │
│ overall_score         │ Float    │ Final % e.g. 67.4            │
│ risk_level            │ String   │ "low / medium / high"        │
│ web_similarity_score  │ Float    │ Score from internet sources  │
│ internal_score        │ Float    │ Score from institution DB    │
│ semantic_score        │ Float    │ BERT paraphrase score        │
│ exact_match_score     │ Float    │ Word-for-word match score    │
│ matched_sources       │ Array    │ List of matched sources      │
│ highlighted_segments  │ Array    │ Flagged text segments        │
│ original_percentage   │ Float    │ 100 - overall_score          │
│ report_url            │ String   │ Link to generated PDF report │
│ detection_time        │ Float    │ Seconds taken to process     │
│ created_at            │ DateTime │ When detection ran           │
└───────────────────────┴──────────┴──────────────────────────────┘

MATCHED SOURCES STRUCTURE (nested inside results):
Each source contains:
├── url          → "https://wikipedia.org/..."
├── title        → "Machine Learning - Wikipedia"
├── similarity   → 87.3 (percentage matched)
├── matched_text → The exact sentence that matched
└── source_type  → "web / internal / database"

HIGHLIGHTED SEGMENTS STRUCTURE:
Each segment contains:
├── text         → The flagged sentence/paragraph
├── start_index  → Where it starts in document
├── end_index    → Where it ends
├── similarity   → How similar it is
└── source_url   → Where it was found
```

### Collection 4: NOTIFICATIONS
```
PURPOSE: System notifications for users

FIELDS:
┌─────────────────┬────────────┬──────────────────────────────┐
│ FIELD           │ TYPE       │ PURPOSE                      │
├─────────────────┼────────────┼──────────────────────────────┤
│ _id             │ ObjectId   │ Unique identifier            │
│ user_id         │ ObjectId   │ Who receives notification    │
│ title           │ String     │ Notification title           │
│ message         │ String     │ Full notification message    │
│ type            │ String     │ "success/warning/info"       │
│ is_read         │ Boolean    │ Has user seen this           │
│ related_doc_id  │ ObjectId   │ Links to document if any     │
│ created_at      │ DateTime   │ When notification was sent   │
└─────────────────┴────────────┴──────────────────────────────┘
```

### Collection 5: SYSTEM SETTINGS
```
PURPOSE: Admin-configurable system settings

FIELDS:
┌──────────────────────────┬──────────┬────────────────────────┐
│ FIELD                    │ TYPE     │ PURPOSE                │
├──────────────────────────┼──────────┼────────────────────────┤
│ _id                      │ ObjectId │ Unique identifier      │
│ institution_name         │ String   │ School name            │
│ low_risk_threshold       │ Number   │ Default: 25%           │
│ medium_risk_threshold    │ Number   │ Default: 50%           │
│ high_risk_threshold      │ Number   │ Default: 75%           │
│ max_file_size_mb         │ Number   │ Default: 10MB          │
│ allowed_file_types       │ Array    │ ["pdf","docx","txt"]   │
│ web_check_enabled        │ Boolean  │ Toggle web checking    │
│ internal_check_enabled   │ Boolean  │ Toggle internal check  │
│ semantic_check_enabled   │ Boolean  │ Toggle BERT check      │
│ updated_at               │ DateTime │ Last settings update   │
└──────────────────────────┴──────────┴────────────────────────┘
```

---

## 1.3 Database Relationships

```
┌──────────┐         ┌───────────────┐        ┌──────────────────┐
│  USERS   │◄───────►│   DOCUMENTS   │◄──────►│ DETECTION_RESULTS│
│          │  1:Many │               │  1:1   │                  │
│ _id      │         │ user_id       │        │ document_id      │
│ name     │         │ title         │        │ overall_score    │
│ email    │         │ file_url      │        │ matched_sources  │
│ role     │         │ status        │        │ highlighted_text │
└──────────┘         └───────────────┘        └──────────────────┘
     │                                                  
     │ 1:Many                                           
     ▼                                                  
┌──────────────┐                                        
│NOTIFICATIONS │                                        
│              │                                        
│ user_id      │                                        
│ message      │                                        
│ is_read      │                                        
└──────────────┘                                        
```

---

## Phase 1 Completion Checklist

```
✅ MongoDB Atlas account created
✅ Free cluster created
✅ Database user created
✅ Connection string saved in .env
✅ All collections designed and understood
✅ Relationships understood
✅ Test connection working
```

---

---

# PHASE 2: AUTHENTICATION BACKEND
## Day 5-7

---

## What This Phase Is About

```
Build all the backend API logic for:
- User Registration
- User Login
- JWT Token generation
- Protected routes
- Password hashing
- Get current user profile

After this phase: You can test all auth endpoints
in Postman. No frontend yet.
```

---

## 2.1 What You Will Build (Backend Only)

### API Endpoints to Build

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTH API ENDPOINTS                         │
├────────┬──────────────────────┬────────────────────────────┤
│ METHOD │ ENDPOINT             │ WHAT IT DOES               │
├────────┼──────────────────────┼────────────────────────────┤
│ POST   │ /api/auth/register   │ Create new user account    │
│ POST   │ /api/auth/login      │ Login and get JWT token    │
│ GET    │ /api/auth/me         │ Get logged-in user profile │
│ PUT    │ /api/auth/profile    │ Update profile info        │
│ POST   │ /api/auth/logout     │ Logout user                │
│ POST   │ /api/auth/refresh    │ Refresh expired token      │
└────────┴──────────────────────┴────────────────────────────┘
```

### How Each Endpoint Works

```
POST /api/auth/register
─────────────────────────────────────────────────────
INPUT (user sends):
{
  "full_name": "John Doe",
  "email": "john@school.edu",
  "password": "securepassword",
  "role": "student",
  "student_id": "HND/2024/001",
  "department": "Computer Science"
}

WHAT HAPPENS INSIDE:
1. Validate all fields are present
2. Check email doesn't already exist
3. Hash the password (never store plain text)
4. Save user to MongoDB
5. Send welcome notification

OUTPUT (system returns):
{
  "success": true,
  "message": "Account created successfully",
  "user": { name, email, role }
}
─────────────────────────────────────────────────────

POST /api/auth/login
─────────────────────────────────────────────────────
INPUT:
{
  "email": "john@school.edu",
  "password": "securepassword"
}

WHAT HAPPENS INSIDE:
1. Find user by email in database
2. Compare password with hashed version
3. If correct → generate JWT token
4. Update last_login timestamp
5. Return token and user info

OUTPUT:
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@school.edu",
    "role": "student"
  }
}
─────────────────────────────────────────────────────
```

---

## 2.2 Security Things to Implement

```
PASSWORD SECURITY:
→ Use bcrypt to hash passwords
→ Never store plain text passwords
→ Salt rounds: 12 (secure enough, not too slow)

JWT TOKEN:
→ Token expires in 24 hours
→ Contains: user_id, email, role
→ Signed with secret key stored in .env
→ Frontend must send token with every request

PROTECTED ROUTES:
→ Any route that needs login checks for valid JWT
→ Role checking (student cant access admin routes)
→ Return 401 if no token
→ Return 403 if wrong role
```

---

## 2.3 Testing in Postman

```
After building, test ALL endpoints in Postman:

TEST 1: Register a student → expect 201 success
TEST 2: Register same email again → expect 400 error
TEST 3: Login with correct details → expect token
TEST 4: Login with wrong password → expect 401
TEST 5: Access /me with token → expect user profile
TEST 6: Access /me without token → expect 401
TEST 7: Register lecturer account → expect success
TEST 8: Register admin account → expect success
```

---

## Phase 2 Completion Checklist

```
✅ All auth routes created and working
✅ Password hashing working
✅ JWT generation working
✅ Protected routes working
✅ Role-based middleware working
✅ All tested in Postman
✅ Error handling in place
```

---

---

# PHASE 3: AUTHENTICATION FRONTEND (UI)
## Day 8-10

---

## What This Phase Is About

```
Build the visual pages users see for:
- Landing/Welcome page
- Login page
- Register page
- Connect them to the backend you just built

After this phase: You can actually open the browser,
register an account, and login. It is real and working.
```

---

## 3.1 Landing Page Design

```
WHAT THE LANDING PAGE LOOKS LIKE:

┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
│  [Logo] PlagiaGuard          [Login]  [Get Started]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         HERO SECTION                                    │
│                                                         │
│    🔍 Intelligent Plagiarism Detection                  │
│    For Academic Documents                               │
│                                                         │
│    "Protect academic integrity with AI-powered         │
│     plagiarism detection. Fast, accurate, free."       │
│                                                         │
│    [Check My Document]    [Learn More]                 │
│                                                         │
│    [Animated graphic of document being scanned]        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FEATURES SECTION (3 cards)                            │
│                                                         │
│  🤖 AI Detection    🌐 Web Matching    📊 Detailed     │
│  Detects even       Matches against    Reports with    │
│  paraphrased        millions of web    visual          │
│  content            sources            breakdown       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  HOW IT WORKS (Step by step)                           │
│                                                         │
│  [1 Upload] → [2 Analyze] → [3 Get Report]            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  STATISTICS BAR                                         │
│  Documents Checked: 1,240  |  Average Accuracy: 98%   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
│  © 2025 PlagiaGuard | HND Final Year Project          │
└─────────────────────────────────────────────────────────┘

COLOR SCHEME:
Primary: Deep Blue (#1e3a5f)
Accent: Electric Blue (#3b82f6)
Success: Green (#10b981)
Warning: Amber (#f59e0b)
Danger: Red (#ef4444)
Background: Light Gray (#f8fafc)
White: #ffffff
```

---

## 3.2 Login Page Design

```
┌─────────────────────────────────────────────────────────┐
│  LEFT SIDE (40%)          │  RIGHT SIDE (60%)           │
│                           │                             │
│  Beautiful gradient       │  ┌─────────────────────┐   │
│  background with          │  │   Welcome Back 👋   │   │
│  illustration             │  │                     │   │
│                           │  │ Email               │   │
│  "Ensuring Academic       │  │ [________________]  │   │
│   Integrity Since 2025"   │  │                     │   │
│                           │  │ Password            │   │
│  [Feature bullet points]  │  │ [________________]  │   │
│                           │  │                     │   │
│                           │  │ Role                │   │
│                           │  │ [Student ▼]         │   │
│                           │  │                     │   │
│                           │  │ [ ] Remember me     │   │
│                           │  │                     │   │
│                           │  │ [  Login  ]         │   │
│                           │  │                     │   │
│                           │  │ Don't have account? │   │
│                           │  │ Register here       │   │
│                           │  └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘

FEATURES:
→ Form validation (red border if wrong)
→ Show/hide password toggle
→ Loading spinner when logging in
→ Error toast if login fails
→ Success redirect to correct dashboard
   Student → /student/dashboard
   Lecturer → /lecturer/dashboard
   Admin → /admin/dashboard
```

---

## 3.3 Register Page Design

```
┌─────────────────────────────────────────────────────────┐
│                  Create Your Account                    │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ Full Name           │  │ Email Address           │  │
│  │ [_________________] │  │ [_____________________] │  │
│  └─────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ Password            │  │ Confirm Password        │  │
│  │ [_________________] │  │ [_____________________] │  │
│  └─────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ Role                │  │ Department              │  │
│  │ [Student ▼]         │  │ [Computer Science ▼]    │  │
│  └─────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  [If student selected → show Student ID field]         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Student ID (optional)                           │   │
│  │ [___________________________________________]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Password Strength Indicator Bar]                     │
│  Strength: ████████░░ Strong                           │
│                                                         │
│  [  Create Account  ]                                  │
│                                                         │
│  Already have account? Login                           │
└─────────────────────────────────────────────────────────┘

VALIDATION TO SHOW:
→ Password must be 8+ characters
→ Passwords must match
→ Email must be valid format
→ All required fields must be filled
→ Real-time feedback as user types
```

---

## 3.4 What Gets Connected to Backend

```
LOGIN PAGE connects to:
→ POST /api/auth/login
→ Saves JWT token to localStorage
→ Saves user info to React Context (global state)
→ Redirects based on role

REGISTER PAGE connects to:
→ POST /api/auth/register
→ Shows success message
→ Redirects to login

ALL PAGES check:
→ Is user logged in?
→ If yes and tries to go to /login → redirect to dashboard
→ If no token and tries to access dashboard → redirect to login
```

---

## Phase 3 Completion Checklist

```
✅ Landing page built and beautiful
✅ Login page built and connected to backend
✅ Register page built and connected to backend
✅ JWT token saved and working
✅ Role-based redirect working
✅ Form validation working
✅ Error messages showing
✅ Loading states working
✅ Responsive on mobile
```

---

---

# PHASE 4: DOCUMENT UPLOAD BACKEND
## Day 11-13

---

## What This Phase Is About

```
Build the backend that:
- Accepts file uploads
- Validates files
- Extracts text from PDF, DOCX, TXT
- Preprocesses the text
- Stores everything in database
- Returns the processed document info

This is NOT the detection yet. Just the upload and
text extraction pipeline.
```

---

## 4.1 API Endpoints to Build

```
┌─────────────────────────────────────────────────────────────┐
│               DOCUMENT API ENDPOINTS                        │
├────────┬────────────────────────────┬───────────────────────┤
│ METHOD │ ENDPOINT                   │ WHAT IT DOES          │
├────────┼────────────────────────────┼───────────────────────┤
│ POST   │ /api/documents/upload      │ Upload new document   │
│ GET    │ /api/documents/            │ Get user's documents  │
│ GET    │ /api/documents/{id}        │ Get single document   │
│ DELETE │ /api/documents/{id}        │ Delete a document     │
│ GET    │ /api/documents/{id}/text   │ Get extracted text    │
└────────┴────────────────────────────┴───────────────────────┘
```

---

## 4.2 Upload Pipeline (Step by Step)

```
STEP 1: FILE ARRIVES AT API
────────────────────────────────────────────────────
→ User sends file via form data
→ Check user is logged in (JWT required)
→ Check file type is allowed (PDF, DOCX, TXT)
→ Check file size is under limit (10MB)
→ If checks fail → return error immediately

STEP 2: STORE THE FILE
────────────────────────────────────────────────────
→ Upload file to Cloudinary
→ Get back a secure URL
→ This URL is where the file lives permanently

STEP 3: EXTRACT TEXT
────────────────────────────────────────────────────
PDF files:
→ Use PyMuPDF (fitz)
→ Read each page
→ Join all pages into one string

DOCX files:
→ Use python-docx
→ Read each paragraph
→ Join all paragraphs

TXT files:
→ Directly read file content

Result: Raw extracted text as a string

STEP 4: TEXT PREPROCESSING
────────────────────────────────────────────────────
Take the raw text and clean it:

1. Remove extra whitespace and newlines
2. Remove special characters
3. Convert to lowercase
4. Tokenize (split into sentences and words)
5. Remove stop words (the, is, and, etc.)
6. Lemmatize (running → run, studies → study)
7. Count words

Result: Clean text ready for detection

STEP 5: CREATE FINGERPRINT
────────────────────────────────────────────────────
→ Create document fingerprint (unique hash)
→ Used for fast comparison with database
→ Store hashes as array

STEP 6: SAVE TO DATABASE
────────────────────────────────────────────────────
Save document record:
→ user_id, title, filename
→ file_url (Cloudinary URL)
→ extracted_text
→ clean_text
→ fingerprint
→ word_count
→ status: "ready" (ready for detection)
→ submitted_at: current time

STEP 7: RETURN RESPONSE
────────────────────────────────────────────────────
Return to frontend:
{
  "success": true,
  "document_id": "abc123",
  "word_count": 3420,
  "message": "Document uploaded successfully",
  "status": "ready"
}
```

---

## 4.3 Postman Testing

```
TEST 1: Upload a PDF file → expect text extracted
TEST 2: Upload a DOCX file → expect text extracted
TEST 3: Upload a TXT file → expect text extracted
TEST 4: Upload a wrong type (jpg) → expect error
TEST 5: Upload a file over 10MB → expect error
TEST 6: Upload without logging in → expect 401
TEST 7: Get list of documents → expect array
TEST 8: Delete a document → expect success
```

---

## Phase 4 Completion Checklist

```
✅ File upload endpoint working
✅ PDF text extraction working
✅ DOCX text extraction working
✅ TXT text extraction working
✅ Text preprocessing working
✅ Fingerprinting working
✅ Saved to MongoDB correctly
✅ Cloudinary file storage working
✅ All tested in Postman
```

---

---

# PHASE 5: DOCUMENT UPLOAD FRONTEND (UI)
## Day 14-16

---

## What This Phase Is About

```
Build the beautiful upload interface that students use.
Connect it to the backend you built in Phase 4.
```

---

## 5.1 Upload Page Design

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR  [Logo]  [Dashboard] [History] [Profile]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Submit Document for Plagiarism Check                  │
│  ─────────────────────────────────────                 │
│                                                         │
│  Document Details                                       │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ Document Title      │  │ Course/Subject          │  │
│  │ [_________________] │  │ [_____________________] │  │
│  └─────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ Academic Year       │  │ Submission Type         │  │
│  │ [2024/2025 ▼]       │  │ [Assignment ▼]          │  │
│  └─────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  Upload Your Document                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │         📄                                        │  │
│  │                                                   │  │
│  │    Drag and drop your file here                  │  │
│  │    or click to browse                            │  │
│  │                                                   │  │
│  │    Supported: PDF, DOCX, TXT                     │  │
│  │    Maximum size: 10MB                            │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [After file selected → show preview]                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  📄 my_thesis.pdf                     2.3 MB  ✕  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Detection Options                                      │
│  ✅ Check web sources                                   │
│  ✅ Check institution database                          │
│  ✅ AI semantic analysis                                │
│                                                         │
│  [  Submit for Analysis  ]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5.2 Processing State Design

```
AFTER SUBMIT → Show processing screen:

┌─────────────────────────────────────────────────────────┐
│                                                         │
│                 Analyzing Your Document                 │
│                                                         │
│                 📄 my_thesis.pdf                        │
│                                                         │
│  [████████████████░░░░░░░░░░░░░░] 52%                  │
│                                                         │
│  ✅ Text extracted successfully                         │
│  ✅ Preprocessing complete                              │
│  🔄 Checking internal database...                       │
│  ⏳ Checking web sources...                             │
│  ⏳ Running AI semantic analysis...                     │
│                                                         │
│  Estimated time remaining: ~45 seconds                 │
│                                                         │
│  Please do not close this page                         │
│                                                         │
└─────────────────────────────────────────────────────────┘

→ Progress updates every 3 seconds via API polling
→ When done → automatically redirect to results page
```

---

## Phase 5 Completion Checklist

```
✅ Upload form built and beautiful
✅ Drag and drop working
✅ File validation on frontend
✅ File preview working
✅ Connected to backend upload API
✅ Processing screen built
✅ Progress polling working
✅ Redirect to results on completion
```

---

---

# PHASE 6: DETECTION ENGINE BACKEND
## Day 17-23 (Longest Phase — This Is the Core)

---

## What This Phase Is About

```
This is the brain of the entire system.
Build all the algorithms that actually detect plagiarism.
This phase has 5 sub-phases inside it.
```

---

## 6.1 Sub-Phase 6A: TF-IDF + Cosine Similarity

```
WHAT YOU BUILD:
→ A service that takes two pieces of text
→ Converts them to TF-IDF vectors
→ Calculates cosine similarity between them
→ Returns a similarity score (0.0 to 1.0)

WHEN THIS RUNS:
→ Compare submitted doc against every doc in your DB
→ Return which documents are most similar and by how much

EXPECTED OUTPUT:
{
  "algorithm": "cosine_tfidf",
  "score": 0.73,
  "comparison_document_id": "doc_xyz",
  "matched_portions": ["sentence 1", "sentence 2"]
}
```

---

## 6.2 Sub-Phase 6B: Jaccard Similarity

```
WHAT YOU BUILD:
→ A service that compares word sets between documents
→ Fast and lightweight
→ Good for catching direct word copying

WHEN THIS RUNS:
→ Pre-screening before heavier algorithms
→ Quick initial check

EXPECTED OUTPUT:
{
  "algorithm": "jaccard",
  "score": 0.45,
  "common_words": 234,
  "unique_words_total": 521
}
```

---

## 6.3 Sub-Phase 6C: BERT Semantic Similarity

```
WHAT YOU BUILD:
→ Load the pre-trained MiniLM model
→ Encode submitted document sentences into vectors
→ Encode comparison text into vectors
→ Compare vectors to find semantic similarity
→ THIS catches paraphrased content

WHAT MAKES THIS SPECIAL:

EXAMPLE:
Sentence A: "Deep learning has revolutionized computer vision"
Sentence B: "Neural networks have transformed how machines see"

→ Jaccard/Cosine: LOW similarity (different words)
→ BERT: HIGH similarity (same meaning!)

EXPECTED OUTPUT:
{
  "algorithm": "bert_semantic",
  "score": 0.89,
  "paraphrase_detected": true,
  "matched_sentence_pairs": [
    {
      "submitted": "Deep learning has...",
      "matched": "Neural networks have...",
      "similarity": 0.89
    }
  ]
}

NOTE ON PERFORMANCE:
→ This is the heaviest algorithm
→ Run it LAST after others
→ On your 8GB RAM: fine, just takes 5-15 seconds
```

---

## 6.4 Sub-Phase 6D: Web Source Checker

```
WHAT YOU BUILD:
→ Extract the most important sentences from document
→ Send them as search queries to Bing/Google API
→ Get back top 10 URLs per query
→ Scrape text content from each URL
→ Compare scraped text with submitted document
→ Return matching URLs and similarity scores

THE PIPELINE:
                                      
Submitted Text                        
    │                                 
    ▼                                 
Extract Key Sentences (top 10)        
    │                                 
    ▼                                 
For each sentence:                    
    Send to Bing Search API           
    │                                 
    ▼                                 
Get list of URLs from search results  
    │                                 
    ▼                                 
Scrape each URL with BeautifulSoup    
    │                                 
    ▼                                 
Compare scraped text with document    
using Cosine Similarity               
    │                                 
    ▼                                 
If similarity > 40% → flag as match   
    │                                 
    ▼                                 
Return: URL + score + matched text    

EXPECTED OUTPUT:
{
  "web_sources_checked": 47,
  "matches_found": 3,
  "sources": [
    {
      "url": "https://wikipedia.org/...",
      "title": "Artificial Intelligence",
      "similarity_score": 87.3,
      "matched_text": "Machine learning is..."
    }
  ]
}
```

---

## 6.5 Sub-Phase 6E: Score Aggregation Engine

```
WHAT YOU BUILD:
→ Take scores from all 4 algorithms
→ Apply weights to each
→ Calculate the final combined score
→ Determine risk level
→ Identify and highlight plagiarized segments
→ Save all results to database

WEIGHTING FORMULA:
─────────────────────────────────────────────────────
Final Score = 
  (Cosine/TF-IDF Score  × 0.25) +
  (Jaccard Score        × 0.15) +
  (BERT Semantic Score  × 0.35) +
  (Web Source Score     × 0.25)
= Final Percentage (0% to 100%)
─────────────────────────────────────────────────────

RISK LEVEL ASSIGNMENT:
0% - 25%  → 🟢 LOW RISK (Mostly original)
26% - 50% → 🟡 MEDIUM RISK (Some concerns)
51% - 75% → 🟠 HIGH RISK (Significant plagiarism)
76% - 100%→ 🔴 CRITICAL (Severe plagiarism)

TEXT HIGHLIGHTING LOGIC:
→ Go through document sentence by sentence
→ For each sentence check similarity to any source
→ If > 40% → mark as plagiarized
→ If 20-40% → mark as suspicious
→ If < 20% → mark as original
→ Store start/end positions of each marked segment

SAVE FINAL RESULT:
→ Save to detection_results collection
→ Update document status to "completed"
→ Create notification for user
→ Trigger report generation
```

---

## 6.6 Detection API Endpoint

```
┌─────────────────────────────────────────────────────────┐
│             DETECTION API ENDPOINTS                     │
├────────┬───────────────────────────┬────────────────────┤
│ METHOD │ ENDPOINT                  │ WHAT IT DOES       │
├────────┼───────────────────────────┼────────────────────┤
│ POST   │ /api/detection/run/{id}   │ Start detection    │
│ GET    │ /api/detection/status/{id}│ Check progress     │
│ GET    │ /api/detection/result/{id}│ Get full results   │
└────────┴───────────────────────────┴────────────────────┘
```

---

## Phase 6 Completion Checklist

```
✅ TF-IDF Cosine similarity working
✅ Jaccard similarity working
✅ BERT semantic model loaded and working
✅ Web source checker working
✅ Score aggregation working
✅ Risk level assignment working
✅ Text highlighting positions calculated
✅ Results saved to database correctly
✅ Detection API endpoints working
✅ Tested with real academic documents
```

---

---

# PHASE 7: RESULTS & REPORT BACKEND
## Day 24-26

---

## What This Phase Is About

```
Build the backend that:
- Fetches detection results
- Formats them for display
- Generates a downloadable PDF report
- Stores report URL
```

---

## 7.1 API Endpoints to Build

```
┌─────────────────────────────────────────────────────────────┐
│               REPORT API ENDPOINTS                          │
├────────┬──────────────────────────────┬─────────────────────┤
│ METHOD │ ENDPOINT                     │ WHAT IT DOES        │
├────────┼──────────────────────────────┼─────────────────────┤
│ GET    │ /api/reports/{doc_id}        │ Get report data     │
│ GET    │ /api/reports/{doc_id}/pdf    │ Download PDF report │
│ GET    │ /api/reports/history         │ Get all user reports│
└────────┴──────────────────────────────┴─────────────────────┘
```

---

## 7.2 PDF Report Content

```
THE GENERATED PDF WILL CONTAIN:

PAGE 1: COVER PAGE
────────────────────────────────────────────────────────
[Institution Logo]
PLAGIARISM DETECTION REPORT

Document: "Analysis of Machine Learning in Healthcare"
Student: John Doe (HND/2024/001)
Course: Database Management Systems
Submitted: January 15, 2025
Checked: January 15, 2025

OVERALL SIMILARITY: 67%
RISK LEVEL: 🔴 HIGH RISK
────────────────────────────────────────────────────────

PAGE 2: SCORE BREAKDOWN
────────────────────────────────────────────────────────
[Circular gauge showing 67%]

Similarity Breakdown:
├── Web Sources:          42% ████████████░░░░░
├── Internal Database:    18% █████░░░░░░░░░░░░
├── Semantic/Paraphrase:  7%  ██░░░░░░░░░░░░░░░
└── Original Content:     33% ████████░░░░░░░░░

Matched Sources: 5 sources found
────────────────────────────────────────────────────────

PAGE 3: SOURCE LIST
────────────────────────────────────────────────────────
MATCHED INTERNET SOURCES:

#1 Wikipedia - Artificial Intelligence
   URL: https://wikipedia.org/wiki/AI
   Similarity: 87% | Matched: Introduction section

#2 ResearchGate Article
   URL: https://researchgate.net/...
   Similarity: 64% | Matched: Literature review
   
#3 Internal Document: student_jane_2023.pdf
   Uploaded by: Jane Smith
   Similarity: 45% | Matched: Methodology section
────────────────────────────────────────────────────────

PAGE 4+: HIGHLIGHTED DOCUMENT
────────────────────────────────────────────────────────
[Full document text with color highlighting]

Original text shown normally in black.
[RED HIGHLIGHTED TEXT IS PLAGIARIZED FROM WIKIPEDIA]
Some original transition text here.
[YELLOW HIGHLIGHTED TEXT IS SUSPICIOUS PARAPHRASE]
More original text continues normally here.
────────────────────────────────────────────────────────
```

---

## Phase 7 Completion Checklist

```
✅ Report data API endpoint working
✅ PDF generation working (ReportLab)
✅ PDF includes all sections
✅ Highlighted segments in PDF
✅ Source list in PDF
✅ PDF download endpoint working
✅ Report history endpoint working
```

---

---

# PHASE 8: RESULTS & REPORT FRONTEND (UI)
## Day 27-30

---

## What This Phase Is About

```
Build the most important visual page of the system.
This is what students see after detection completes.
Make it clear, beautiful, and informative.
```

---

## 8.1 Results Page Design

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                    [Download PDF]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HEADER                                                 │
│  Analysis Complete for: "ML in Healthcare"             │
│  Checked: January 15, 2025 | Time taken: 52 seconds    │
│                                                         │
├─────────┬─────────────────────────────────────────────┤
│ SCORE   │         BREAKDOWN CARDS                      │
│ PANEL   │                                              │
│         │  ┌──────────┐┌──────────┐┌──────────────┐   │
│  ┌───┐  │  │🌐 Web    ││📚 Internal││🤖 Semantic   │   │
│  │ 67│  │  │Sources   ││Database  ││Analysis     │   │
│  │ % │  │  │          ││          ││             │   │
│  └───┘  │  │  42%     ││  18%     ││   7%        │   │
│         │  └──────────┘└──────────┘└──────────────┘   │
│🔴 HIGH  │                                              │
│  RISK   │  [Bar chart showing score breakdown]        │
│         │                                              │
├─────────┴─────────────────────────────────────────────┤
│                                                         │
│  MATCHED SOURCES                                        │
│  ─────────────                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ #1 🌐 Wikipedia - Artificial Intelligence       │   │
│  │     87% match | Introduction section           │   │
│  │     https://wikipedia.org/wiki/AI   [View]    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ #2 🌐 ResearchGate - ML Survey Paper            │   │
│  │     64% match | Literature Review section      │   │
│  │     https://researchgate.net/...    [View]    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ #3 📄 Internal: Jane_Smith_2023.pdf             │   │
│  │     45% match | Methodology section            │   │
│  │                                     [View]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DOCUMENT ANALYSIS (Highlighted View)                  │
│  ─────────────────────────────────────                 │
│                                                         │
│  LEGEND: [🔴 Plagiarized] [🟡 Suspicious] [⚪ Original]│
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │ 1. Introduction                                 │   │
│  │                                                 │   │
│  │ This paper explores the application of         │   │
│  │ █████████████████████████████████████████      │   │
│  │ machine learning in modern healthcare           │   │
│  │ █████████████████████████████████████████      │   │
│  │ systems. The use of artificial intelligence     │   │
│  │ █████████████████████████████████████████      │   │
│  │ [Source: Wikipedia (87%)]                       │   │
│  │                                                 │   │
│  │ The potential benefits include improved         │   │
│  │ diagnosis accuracy and reduced costs for        │   │
│  │ healthcare providers in developing nations.     │   │
│  │ [Original content - no match found]            │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [  Download Full PDF Report  ]  [Submit New Document] │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 8.2 Interactive Features on Results Page

```
HOVER ON HIGHLIGHTED TEXT:
→ Tooltip appears showing:
   "Matched: wikipedia.org (87% similarity)"
   "View original source →"

CLICK ON SOURCE IN LIST:
→ Scrolls document to the matched section
→ Highlights that specific section brighter

FILTER PANEL:
→ Show only: [Web Matches] [Internal Matches] [Paraphrases]
→ Toggle to show only original content

SCORE GAUGE:
→ Animated circular progress bar
→ Color changes based on risk level
→ Smooth animation on page load
```

---

## Phase 8 Completion Checklist

```
✅ Results page fully built
✅ Score gauge animating correctly
✅ Breakdown cards showing correct data
✅ Source list displaying all matches
✅ Highlighted document view working
✅ Hover tooltips working
✅ PDF download button working
✅ All connected to backend APIs
✅ Beautiful and responsive
```

---

---

# PHASE 9: STUDENT DASHBOARD FRONTEND
## Day 31-33

---

## What This Phase Is About

```
Build the student's main home screen.
This is what they see every time they log in.
```

---

## 9.1 Student Dashboard Design

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR          │  MAIN CONTENT AREA                   │
│                  │                                      │
│ 👤 John Doe      │  Welcome back, John! 👋              │
│ HND/2024/001     │  ───────────────────────────────     │
│                  │                                      │
│ ─────────────    │  STATS CARDS (top row)               │
│ 🏠 Dashboard     │  ┌────────┐┌────────┐┌────────────┐  │
│ 📤 Upload Doc    │  │ Total  ││ Avg    ││ Last Check │  │
│ 📋 My History    │  │ Docs   ││ Score  ││            │  │
│ 📊 My Reports    │  │        ││        ││            │  │
│ 👤 Profile       │  │   12   ││  34%   ││  2 days ago│  │
│ 🔔 Notifications │  └────────┘└────────┘└────────────┘  │
│    (3)           │                                      │
│                  │  RECENT SUBMISSIONS                   │
│ ─────────────    │  ┌──────────────────────────────┐    │
│ 🚪 Logout        │  │ Document Name     Score Status│    │
│                  │  ├──────────────────────────────┤    │
│                  │  │ ML_Healthcare.pdf  67%  🔴   │    │
│                  │  │ Assignment_2.docx  23%  🟢   │    │
│                  │  │ Research_paper.pdf 45%  🟡   │    │
│                  │  │             [View All →]      │    │
│                  │  └──────────────────────────────┘    │
│                  │                                      │
│                  │  QUICK UPLOAD                         │
│                  │  ┌──────────────────────────────┐    │
│                  │  │  📤 Check a new document     │    │
│                  │  │  [Upload Document →]          │    │
│                  │  └──────────────────────────────┘    │
│                  │                                      │
│                  │  SCORE TREND (line chart)            │
│                  │  [Chart showing scores over time]   │
│                  │                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 9.2 History Page Design

```
┌─────────────────────────────────────────────────────────┐
│  My Submission History                                  │
│                                                         │
│  [Search...] [Filter by: All ▼] [Date: Newest ▼]       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📄 ML in Healthcare.pdf                         │   │
│  │ Course: Database Systems | Jan 15, 2025         │   │
│  │ 3,420 words | Processed in 52s                  │   │
│  │                                                 │   │
│  │ [████████████████░░░░░] 67%    🔴 HIGH RISK    │   │
│  │                                                 │   │
│  │              [View Report] [Download] [Delete]  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 📄 Assignment_2.docx                            │   │
│  │ Course: Web Technology | Jan 10, 2025           │   │
│  │ 1,200 words | Processed in 23s                  │   │
│  │                                                 │   │
│  │ [██████░░░░░░░░░░░░░░░] 23%    🟢 LOW RISK     │   │
│  │                                                 │   │
│  │              [View Report] [Download] [Delete]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Showing 1-10 of 12 submissions                        │
│  [← Previous]  [1] [2]  [Next →]                      │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 9 Completion Checklist

```
✅ Student dashboard built with sidebar
✅ Stats cards showing real data
✅ Recent submissions list working
✅ History page with pagination
✅ Search and filter working
✅ Score bars animating
✅ Notifications badge working
✅ All navigation between pages working
```

---

---

# PHASE 10: LECTURER DASHBOARD (BACKEND + FRONTEND)
## Day 34-38

---

## What This Phase Is About

```
Build everything for lecturers:
- Backend routes for lecturer access
- Lecturer dashboard UI
- Ability to view and monitor student submissions
- Set thresholds and flag submissions
```

---

## 10.1 Lecturer Backend API Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│              LECTURER API ENDPOINTS                         │
├────────┬──────────────────────────────────┬─────────────────┤
│ METHOD │ ENDPOINT                         │ WHAT IT DOES    │
├────────┼──────────────────────────────────┼─────────────────┤
│ GET    │ /api/lecturer/submissions        │ All submissions  │
│ GET    │ /api/lecturer/submissions/{id}   │ Single detail    │
│ POST   │ /api/lecturer/flag/{id}          │ Flag submission  │
│ PUT    │ /api/lecturer/threshold          │ Set % threshold  │
│ GET    │ /api/lecturer/statistics         │ Class analytics  │
│ GET    │ /api/lecturer/high-risk          │ High risk list   │
└────────┴──────────────────────────────────┴─────────────────┘
```

---

## 10.2 Lecturer Dashboard Design

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR           │  LECTURER MAIN DASHBOARD            │
│                   │                                     │
│ 👨‍🏫 Dr. Smith      │  Overview Statistics               │
│ Lecturer          │                                     │
│                   │  ┌──────┐┌──────┐┌──────┐┌──────┐  │
│ 🏠 Dashboard      │  │Total ││High  ││Avg   ││ This │  │
│ 📋 All Submissions│  │Docs  ││Risk  ││Score ││ Week │  │
│ 🔴 High Risk      │  │      ││      ││      ││      │  │
│ 📊 Analytics      │  │ 156  ││  23  ││ 41%  ││  12  │  │
│ ⚙️ Settings        │  └──────┘└──────┘└──────┘└──────┘  │
│                   │                                     │
│                   │  Risk Distribution Chart            │
│                   │  [Pie chart: Low/Medium/High/Crit]  │
│                   │                                     │
│                   │  Recent High-Risk Submissions        │
│                   │  ┌────────────────────────────────┐ │
│                   │  │Student      Document    Score  │ │
│                   │  │John Doe     ML Paper    87% 🔴 │ │
│                   │  │Jane Smith   Assignment  72% 🔴 │ │
│                   │  │Bob Jones    Research    65% 🟠 │ │
│                   │  │         [View All High Risk →] │ │
│                   │  └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 10.3 All Submissions View for Lecturer

```
┌─────────────────────────────────────────────────────────┐
│  All Student Submissions                                │
│                                                         │
│  [Search student...] [Course ▼] [Risk Level ▼] [Date ▼]│
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Student    │ Document        │ Score │ Risk │Action │ │
│  ├────────────┼─────────────────┼───────┼──────┼───────┤ │
│  │ John Doe   │ ML Healthcare   │  67%  │  🔴  │[View] │ │
│  │ Jane Smith │ Assignment 2    │  23%  │  🟢  │[View] │ │
│  │ Bob Jones  │ Research Paper  │  45%  │  🟡  │[View] │ │
│  │ Alice K.   │ Final Project   │  88%  │  🔴  │[View] │ │
│  └────────────┴─────────────────┴───────┴──────┴───────┘ │
│                                                         │
│  [When View is clicked → opens full report for student]│
│                                                         │
│  FLAG SUBMISSION FEATURE:                               │
│  Lecturer can add a note and flag for investigation    │
│  Flagged submissions appear with ⚠️ icon               │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 10 Completion Checklist

```
✅ Lecturer backend routes working
✅ Access control (only lecturers can access)
✅ Lecturer dashboard built
✅ All submissions table working
✅ High risk filtering working
✅ Flag submission feature working
✅ Analytics charts working
✅ Threshold settings working
```

---

---

# PHASE 11: ADMIN DASHBOARD (BACKEND + FRONTEND)
## Day 39-43

---

## What This Phase Is About

```
Build complete admin control panel:
- Manage all users
- View system statistics
- Configure system settings
- Access everything
```

---

## 11.1 Admin Backend API Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│                ADMIN API ENDPOINTS                          │
├────────┬────────────────────────────────┬───────────────────┤
│ METHOD │ ENDPOINT                       │ WHAT IT DOES      │
├────────┼────────────────────────────────┼───────────────────┤
│ GET    │ /api/admin/users               │ All users         │
│ POST   │ /api/admin/users               │ Create user       │
│ PUT    │ /api/admin/users/{id}          │ Update user       │
│ DELETE │ /api/admin/users/{id}          │ Delete user       │
│ PUT    │ /api/admin/users/{id}/toggle   │ Enable/disable    │
│ GET    │ /api/admin/documents           │ All documents     │
│ GET    │ /api/admin/statistics          │ System analytics  │
│ PUT    │ /api/admin/settings            │ System settings   │
│ GET    │ /api/admin/settings            │ Get settings      │
└────────┴────────────────────────────────┴───────────────────┘
```

---

## 11.2 Admin Dashboard Design

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR           │  ADMIN CONTROL PANEL                │
│                   │                                     │
│ 🛡️ Admin Panel    │  System Overview                    │
│                   │                                     │
│ 🏠 Dashboard      │  ┌──────┐┌──────┐┌──────┐┌──────┐  │
│ 👥 Users          │  │Total ││Total ││Total ││Avg   │  │
│ 📄 Documents      │  │Users ││Docs  ││Check ││Score │  │
│ 📊 Analytics      │  │      ││      ││today ││      │  │
│ ⚙️ Settings        │  │  245 ││ 891  ││  34  ││ 42%  │  │
│                   │  └──────┘└──────┘└──────┘└──────┘  │
│                   │                                     │
│                   │  [User Growth Chart - Line graph]   │
│                   │  [Documents by Month - Bar chart]   │
│                   │                                     │
│                   │  Recent Activity Log                │
│                   │  ┌────────────────────────────────┐ │
│                   │  │ 14:23 John uploaded document   │ │
│                   │  │ 14:20 Jane registered account  │ │
│                   │  │ 14:15 Detection completed      │ │
│                   │  └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 11.3 User Management Page

```
┌─────────────────────────────────────────────────────────┐
│  User Management                      [+ Add User]      │
│                                                         │
│  [Search users...] [Role: All ▼] [Status: All ▼]       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Name      │ Email      │ Role     │Status│Actions │  │
│  ├───────────┼────────────┼──────────┼──────┼────────┤  │
│  │ John Doe  │john@...    │Student   │  ✅  │[⚙️][🗑️] │  │
│  │ Dr. Smith │smith@...   │Lecturer  │  ✅  │[⚙️][🗑️] │  │
│  │ Jane K.   │jane@...    │Student   │  ❌  │[⚙️][🗑️] │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Click ⚙️ → Edit modal opens:                          │
│  ┌────────────────────────────────┐                    │
│  │ Edit User                   ✕ │                    │
│  │ Name: [John Doe          ]   │                    │
│  │ Email: [john@school.edu  ]   │                    │
│  │ Role: [Student ▼]            │                    │
│  │ Status: [Active ▼]           │                    │
│  │         [Cancel] [Save]      │                    │
│  └────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## 11.4 System Settings Page

```
┌─────────────────────────────────────────────────────────┐
│  System Settings                                        │
│                                                         │
│  Institution Details                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Institution Name: [___________________________] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Risk Thresholds                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Low Risk:      0% ─────────────── 25%  [25]    │   │
│  │ Medium Risk:   26% ─────────────── 50% [50]    │   │
│  │ High Risk:     51% ─────────────── 75% [75]    │   │
│  │ Critical:      76% ─────────────── 100%        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Detection Options                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅ Enable Web Source Checking                   │   │
│  │ ✅ Enable Internal Database Checking            │   │
│  │ ✅ Enable AI Semantic Analysis                  │   │
│  │ Max file size: [10] MB                          │   │
│  │ Allowed types: ✅PDF ✅DOCX ✅TXT              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [  Save Settings  ]                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 11 Completion Checklist

```
✅ Admin backend routes working
✅ Super admin access control working
✅ Admin dashboard with stats
✅ User management CRUD working
✅ User enable/disable working
✅ System settings save and load working
✅ Analytics charts working
✅ Activity log showing
```

---

---

# PHASE 12: UI POLISH, ANIMATIONS & RESPONSIVE DESIGN
## Day 44-47

---

## What This Phase Is About

```
This phase takes your working system and makes it
look PROFESSIONAL and IMPRESSIVE for your presentation.
Everything that makes the UI beautiful goes here.
```

---

## 12.1 Animations to Add

```
PAGE TRANSITIONS:
→ Smooth fade in when navigating between pages
→ Slide animations for sidebar

LOADING STATES:
→ Skeleton loaders instead of blank screens
   (Gray animated boxes while content loads)
→ Spinner for buttons when submitting

DATA VISUALIZATIONS:
→ Score gauge animates from 0 to final score
→ Bar charts grow from bottom on load
→ Number counters (0 → 156 users, animated)

MICRO-INTERACTIONS:
→ Buttons have hover effects and press effect
→ Cards lift slightly on hover (shadow deepens)
→ Smooth color transitions on risk badges
→ File drop zone highlights when dragging file over it

NOTIFICATIONS:
→ Toast notifications slide in from top right
→ Auto dismiss after 4 seconds
→ Success (green), Error (red), Warning (yellow)
```

---

## 12.2 Responsive Design Rules

```
BREAKPOINTS:
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px

MOBILE CHANGES:
→ Sidebar becomes bottom navigation bar
→ Cards stack vertically
→ Tables become cards (each row becomes a card)
→ Fonts slightly smaller

TABLET CHANGES:
→ Sidebar collapses to icons only
→ 2-column card layout
→ Touch-friendly button sizes

DESKTOP:
→ Full sidebar always visible
→ 3-4 column layouts
→ Hover effects active
```

---

## 12.3 Final UI Component Checklist

```
EVERY BUTTON must have:
→ Hover state (slightly darker)
→ Active/click state (pressed look)
→ Loading state (spinner when processing)
→ Disabled state (grayed out)

EVERY FORM must have:
→ Placeholder text
→ Focus highlight (blue border)
→ Error state (red border + error message)
→ Success state (green checkmark)

EVERY TABLE must have:
→ Hover row highlight
→ Sorted column indicator
→ Pagination
→ Empty state (no data message)

EVERY CARD must have:
→ Consistent padding
→ Shadow
→ Hover lift effect
→ Proper border radius
```

---

## Phase 12 Completion Checklist

```
✅ All pages look consistent
✅ Color scheme applied everywhere
✅ Animations smooth and not excessive
✅ Responsive on mobile (tested)
✅ Responsive on tablet (tested)
✅ All buttons have states
✅ All forms have validation styling
✅ Loading skeletons working
✅ Toast notifications working
```

---

---

# PHASE 13: TESTING
## Day 48-52

---

## What This Phase Is About

```
Before deployment, test EVERYTHING properly.
Find bugs and fix them before your examiner does.
```

---

## 13.1 Backend Testing

```
TEST EVERY API ENDPOINT IN POSTMAN:

AUTH TESTS:
□ Register with valid data → 201 success
□ Register with duplicate email → 400 error
□ Register with missing fields → 422 error
□ Login with correct credentials → 200 + token
□ Login with wrong password → 401
□ Access protected route with token → 200
□ Access protected route without token → 401
□ Access admin route as student → 403

DOCUMENT TESTS:
□ Upload PDF → text extracted correctly
□ Upload DOCX → text extracted correctly
□ Upload TXT → text extracted correctly
□ Upload invalid file type → 400 error
□ Upload oversized file → 413 error
□ Get user documents → returns only user's docs
□ Delete document → removed from DB and storage

DETECTION TESTS:
□ Run detection on short document
□ Run detection on long document (3000+ words)
□ Verify scores between 0 and 100
□ Verify sources are real URLs
□ Verify highlighted segments are correct
□ Test with clearly plagiarized content → high score
□ Test with original content → low score
```

---

## 13.2 Frontend Testing

```
TEST IN BROWSER:

AUTH FLOW:
□ Register → verify account created
□ Login → verify redirect to correct dashboard
□ Logout → verify redirected to login
□ Refresh page → still logged in
□ Access dashboard URL without login → redirect to login

UPLOAD FLOW:
□ Drag and drop a PDF → preview shows
□ Click to browse → file picker opens
□ Submit without file → error shows
□ Submit with file → processing screen shows
□ Wait for completion → redirect to results
□ Results page shows correct score

REPORT VIEWING:
□ Score gauge shows and animates
□ Source list shows all sources
□ Highlighted text visible
□ Download PDF → PDF opens with correct content

CROSS-BROWSER TESTING:
□ Chrome → works
□ Firefox → works  
□ Edge → works
□ Mobile Chrome → works
```

---

## 13.3 User Acceptance Testing

```
GIVE THE SYSTEM TO SOMEONE ELSE TO TEST:

Ask a friend or classmate to:
1. Register an account without your help
2. Upload a document they know has plagiarism
3. Read the results
4. Download the PDF report
5. Tell you anything that was confusing

Fix everything they found confusing.
This is very important for your presentation.
```

---

## Phase 13 Completion Checklist

```
✅ All API endpoints tested and passing
✅ All frontend flows tested
✅ Detection accuracy verified
✅ Cross-browser testing done
✅ Mobile testing done
✅ User acceptance testing done
✅ All bugs fixed
✅ No console errors in browser
```

---

---

# PHASE 14: DEPLOYMENT
## Day 53-55

---

## What This Phase Is About

```
Make your system live on the internet.
Anyone with the link can access it.
Completely free.
```

---

## 14.1 Deployment Order

```
DEPLOY IN THIS EXACT ORDER:

1. DATABASE FIRST (MongoDB Atlas)
   → Already set up from Phase 1
   → Just confirm it's accessible
   → Get the production connection string

2. BACKEND SECOND (Render.com)
   → Push final backend code to GitHub
   → Connect GitHub repo to Render
   → Set all environment variables
   → Deploy
   → Get the backend URL: https://yourapp.onrender.com

3. FRONTEND LAST (Vercel)
   → Update frontend .env with backend URL
   → Push final frontend code to GitHub
   → Connect GitHub repo to Vercel
   → Deploy
   → Get the frontend URL: https://yourapp.vercel.app
```

---

## 14.2 Environment Variables to Set

```
BACKEND (.env on Render):
─────────────────────────────────────────
MONGODB_URI = mongodb+srv://...
JWT_SECRET = your_super_secret_key_here
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
GOOGLE_API_KEY = your_google_key
BING_API_KEY = your_bing_key
ALLOWED_ORIGINS = https://yourapp.vercel.app
─────────────────────────────────────────

FRONTEND (.env on Vercel):
─────────────────────────────────────────
VITE_API_URL = https://yourapp.onrender.com
─────────────────────────────────────────
```

---

## 14.3 Keep Backend Awake (Free Tier Issue)

```
PROBLEM: Render free tier sleeps after 15 min

SOLUTION: Use UptimeRobot (free)
1. Create account at uptimerobot.com
2. Add your backend URL as a monitor
3. Set to ping every 10 minutes
4. Backend stays awake 24/7

FREE FOREVER.
```

---

## 14.4 Post-Deployment Testing

```
TEST ON LIVE SITE:
□ Register a new account on live URL
□ Login successfully
□ Upload a document
□ Detection runs correctly
□ Results display correctly
□ PDF download works
□ Test on mobile phone
□ Share URL with a friend to test
```

---

## Phase 14 Completion Checklist

```
✅ MongoDB Atlas accessible from Render
✅ Backend deployed on Render
✅ Backend URL working and responding
✅ Frontend deployed on Vercel
✅ Frontend connecting to backend correctly
✅ Environment variables set correctly
✅ UptimeRobot configured
✅ Full flow tested on live site
✅ Mobile tested on live site
```

---

---

# PHASE 15: DOCUMENTATION & FINAL REVIEW
## Day 56-60

---

## What This Phase Is About

```
Write your project documentation.
Prepare for your presentation.
Final review of everything.
```

---

## 15.1 Documentation to Write

```
1. README.md (GitHub)
   → What the project does
   → How to install locally
   → How to use the system
   → Tech stack used
   → Screenshots

2. Project Report (for submission)
   Chapter 1: Introduction
   Chapter 2: Literature Review
   Chapter 3: System Analysis
   Chapter 4: System Design
   Chapter 5: Implementation
   Chapter 6: Testing
   Chapter 7: Conclusion & Recommendations
   References
   Appendix (screenshots)

3. User Manual
   → How students use the system
   → How lecturers use the system
   → How admin uses the system
```

---

## 15.2 Presentation Preparation

```
DEMO SCRIPT FOR PRESENTATION:

1. Show the live website URL
2. Register a new account live (student)
3. Login and show dashboard
4. Upload a document that has obvious plagiarism
   (prepare this document beforehand)
5. Show the processing screen
6. Show the results - talk through each section
7. Download the PDF report
8. Login as lecturer - show submissions table
9. Login as admin - show user management
10. Answer examiner questions confidently

PREPARE ANSWERS FOR THESE LIKELY QUESTIONS:
→ "How accurate is your system?"
→ "Did you train the AI model?"
→ "How does BERT work?"
→ "How do you handle large documents?"
→ "What is the cost to run this system?"
→ "How is this different from Turnitin?"
→ "What would you improve with more time?"
```

---

## Phase 15 Completion Checklist

```
✅ README.md written
✅ Project report written
✅ User manual written
✅ All screenshots taken
✅ Demo script practiced
✅ Examiner questions prepared
✅ Live site working
✅ Backup plan ready (screenshots if internet fails)
```

---

---

# COMPLETE TIMELINE SUMMARY

```
┌────────┬─────────────────────────────────────┬──────────────┐
│ PHASE  │ WHAT YOU BUILD                      │ DAYS         │
├────────┼─────────────────────────────────────┼──────────────┤
│   0    │ Setup & Project Structure           │ Day 1-2      │
│   1    │ Database Design                     │ Day 3-4      │
│   2    │ Auth Backend                        │ Day 5-7      │
│   3    │ Auth Frontend (Landing,Login,Reg)   │ Day 8-10     │
│   4    │ Document Upload Backend             │ Day 11-13    │
│   5    │ Document Upload Frontend            │ Day 14-16    │
│   6    │ Detection Engine Backend (CORE)     │ Day 17-23    │
│   7    │ Report Generation Backend           │ Day 24-26    │
│   8    │ Results & Report Frontend           │ Day 27-30    │
│   9    │ Student Dashboard Frontend          │ Day 31-33    │
│  10    │ Lecturer (Backend + Frontend)       │ Day 34-38    │
│  11    │ Admin (Backend + Frontend)          │ Day 39-43    │
│  12    │ UI Polish & Responsive Design       │ Day 44-47    │
│  13    │ Testing & Bug Fixing                │ Day 48-52    │
│  14    │ Deployment                          │ Day 53-55    │
│  15    │ Documentation & Presentation        │ Day 56-60    │
├────────┼─────────────────────────────────────┼──────────────┤
│ TOTAL  │ Complete System                     │ 60 Days      │
└────────┴─────────────────────────────────────┴──────────────┘
```

---

> **You now have a complete professional build plan.**
> Every phase builds on the previous one.
> Backend always comes before frontend so you have
> real data to display.
> Say the word when you are ready to start Phase 0.