# 🏙️ CivicAI — Smart City Issue Reporting Platform

An AI-powered civic issue reporting system. Upload a photo of a civic problem → AI generates a description → duplicate detection runs → priority is classified → issue appears on a map.

**100% free to run. No paid API key required.**

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 Image Upload | Drag-and-drop upload with GPS auto-capture |
| 🤖 AI Description | Free HuggingFace BLIP vision model OR built-in smart mock |
| 🔁 Duplicate Detection | String similarity + Haversine distance — no duplicates |
| ⚡ Priority Classification | Keyword-based High / Medium / Low scoring |
| 🗺️ Map View | Leaflet.js map with Red/Orange/Green markers |
| 🔥 Heatmap | Density heatmap toggle showing complaint hotspots |
| ⚙️ Admin Dashboard | Search, filter, and update issue status |

---

## 🆓 Free AI Options

The project ships with **two modes** — no paid API key ever needed:

### Option A — Built-in Smart Mock (zero setup)
Works out of the box with no configuration. Generates realistic civic descriptions based on image filenames and a curated description bank. Perfect for demos and hackathons.

### Option B — HuggingFace BLIP Vision (free, 2-minute setup)
Uses the `Salesforce/blip-image-captioning-large` model for real image analysis.

**Get your free HuggingFace token:**
1. Sign up at **https://huggingface.co/join** (no credit card)
2. Go to **https://huggingface.co/settings/tokens**
3. Click **New token → Role: Read → Create**
4. Copy it into `server/.env` as `HUGGINGFACE_API_KEY=hf_xxxxx`

Free tier includes ~30,000 API characters/month, resets monthly.

---

## 🗂️ Folder Structure

```
civicai/
├── client/                        # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── UploadPage.jsx     # Image upload + GPS form
│       │   ├── MapPage.jsx        # Leaflet map + heatmap
│       │   └── AdminPage.jsx      # Admin dashboard
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Spinner.jsx
│       │   ├── PriorityBadge.jsx
│       │   └── StatusBadge.jsx
│       └── utils/api.js           # All API calls
│
└── server/                        # Node.js + Express backend
    ├── models/Issue.js            # Mongoose schema
    ├── routes/issueRoutes.js      # Routes + Multer upload
    ├── controllers/issueController.js
    └── utils/
        ├── aiDescriptionGenerator.js  # HuggingFace + smart mock
        ├── duplicateDetector.js       # Similarity + distance
        ├── priorityClassifier.js      # Keyword scoring
        └── seedData.js                # 20 sample issues
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicai
CLIENT_URL=http://localhost:5173

# Optional — leave blank for smart mock mode
# Get free token at: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=
```

### 3. Seed sample data (optional)

```bash
cd server && npm run seed
```

### 4. Start both servers

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

### 5. Open in browser

| URL | Page |
|---|---|
| http://localhost:5173/report | Report an issue |
| http://localhost:5173/map | Map view |
| http://localhost:5173/admin | Admin dashboard |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/issues` | Upload image + location |
| `GET` | `/api/issues` | Fetch all (supports `?search=&priority=&status=`) |
| `PUT` | `/api/issues/:id` | Update status |
| `GET` | `/api/issues/heatmap` | Coordinate data for heatmap |
| `GET` | `/api/health` | Server health check |

---

## 🤖 AI Pipeline

```
User uploads image
       ↓
Multer saves to /uploads
       ↓
generateDescription(imagePath)
  ├── HuggingFace BLIP (if token set) → real vision caption
  └── Smart mock fallback             → keyword-based description
       ↓
checkDuplicate(description, lat, lng)
  → string-similarity + Haversine distance
       ↓
classifyPriority(description)
  → keyword scoring: High / Medium / Low
       ↓
Save to MongoDB
```

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, React-Leaflet, Axios

**Backend:** Node.js, Express, Multer, Mongoose, string-similarity

**Database:** MongoDB

**AI (free):** HuggingFace BLIP or built-in smart mock — no Anthropic/OpenAI key needed
