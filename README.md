# BRSR Section A Generator & Auditor

This project consists of two parts that must be run simultaneously:
1.  **Frontend**: A Next.js application (Port 3000) for the UI, Drag-and-Drop, and Gemini Rate-Limit Handling.
2.  **Backend**: An Express.js server (Port 5000) for CA Verification and PDF Generation.

## Prerequisites
*   Node.js 18+ installed.
*   A Google Gemini API Key.

## Setup & Run Instructions

You need to open **two terminal windows**.

### Terminal 1: Frontend (Next.js)
```bash
cd nextjs-brsr-generator
# Install dependencies (if not already done)
npm install
# Start the dev server
npm run dev
```
> Access the App at: http://localhost:3000

---

### Terminal 2: Backend (Express)
```bash
cd express-backend
# Install dependencies (if not already done)
npm install
# Configure API Key
# Create a .env file in 'express-backend' with: GEMINI_API_KEY=your_key_here
# Start the server
npm start
```
> The API will run at: http://localhost:5000

## Environment Variables

### Frontend (`nextjs-brsr-generator/.env.local`)
```
GEMINI_API_KEY=your_key (Optional, supports BYOK in UI)
NEXT_PUBLIC_API_URL=http://localhost:5000 (If using backend integration)
```

### Backend (`express-backend/.env`)
```
PORT=5000
GEMINI_API_KEY=your_key_here (Required for backend-driven audit)
```
# autonousbackend
