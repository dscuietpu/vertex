# 🏙️ CivicAI — Intelligent Urban Grievance Platform

**CivicAI** is an AI-powered smart city platform designed to bridge the gap between citizens and authorities. By combining real-time GPS tracking, vision AI, and automated grievance clustering, CivicAI transforms how urban infrastructure issues are reported, managed, and resolved.

---

## 🌟 Our Vision

To build a **smarter, more responsive city** by creating a completely frictionless reporting channel. We believe that maintaining urban infrastructure shouldn't require citizens to navigate complex bureaucracy or manually classify problems. With CivicAI, a single photograph is all it takes for the system to automatically analyze the problem, determine its severity, pinpoint the exact location, and route it to the appropriate authority. 

---

## ✨ Key Features

### 👥 Role-Based Portals
- **Citizen Dashboard:** A dedicated space for users to track their reported issues, track resolution timelines, and view updates. Each citizen is assigned a unique `CIV-XXXXXXXX` identification number upon registration.
- **Authority (GOV) Dashboard:** A comprehensive, secure admin portal for municipal workers to filter, track, and update the status of civic issues across the city.

### 🤖 AI-Powered Analysis (Groq LLaMA 4 Vision)
- The platform automatically processes uploaded images via highly capable Vision language models.
- **Spam Filtering:** Automatically determines if an image is a valid civic issue and rejects irrelevant, harmless, or meme submissions.
- **Smart Categorization:** Generates precise descriptions and automatically categorizes the grievance (e.g., Road & Traffic, Sanitation, Electricity).
- **Auto-Prioritization:** AI assigns a severity score (High, Medium, Low) based on public safety risk (loss of life, infrastructural damage, public nuisance).

### 📍 Location Intelligence
- **Frictionless GPS Capture:** Location is pulled directly from the device to ensure absolute accuracy—no typing addresses required.
- **Reverse Geocoding:** Raw coordinates are seamlessly translated into human-readable locations (e.g., "Market Road, Sector 25 West") using OpenStreetMap Nominatim with caching to preserve bandwidth.

### 🔁 Smart Duplicate Clustering
- Prevents database littering by utilizing string-similarity combined with mathematical Haversine distance calculations.
- If multiple citizens report the same issue, the system groups them together as linked duplicates, keeping the UI clean while incrementing the report count to alert authorities of widespread problems.

### 🗺️ Visual Dashboards
- **Interactive Map:** A real-time Leaflet.js map plotting all active issues using color-coded markers based on priority.
- **Heatmaps:** Identifies hotspots of complaints, helping authorities view density data and plan broader infrastructural maintenance.

### ☁️ Cloud Infrastructure
- Seamless, fast multimedia handling with **Cloudinary** for secure, persistent image hosting and delivery.

---

## 🚀 Tech Stack

**Frontend:**
- React 18 & Vite
- Tailwind CSS (Modern, premium interface design)
- React Router v6
- Leaflet.js / React-Leaflet
- Lucide React Icons

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Role-based schema, Geo-location structures)
- Cloudinary & Multer (Storage handling)
- JWT Auth & Bcrypt (Security and session management)
- Groq API (Inference for LLaMA 4 Vision models)

---


