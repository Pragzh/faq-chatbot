# 🏦 FinBot — AI Fintech FAQ Chatbot Builder

An AI-powered **fintech customer support chatbot** built using **Node.js, Express, MongoDB, and Groq LLM (LLaMA model)**.  
It simulates a real banking support system that answers customer queries safely using AI + rules, without giving financial advice.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

---


---

## 📌 About The Project

FinBot is a SaaS platform that allows fintech businesses — banks, payment apps, and investment platforms — to instantly create an AI-powered customer support chatbot from their FAQ data.

Instead of spending months building a custom support system, businesses paste their FAQ, get a shareable chat link in seconds, and manage all customer queries from a dedicated admin dashboard.

---

## ✨ Features

### 💬 Chatbot
- AI answers customer questions from business FAQ only
- Quick question chips for common fintech queries
- Typing indicator for better UX
- 👍👎 feedback on every response
- Max 300 character input with live counter
- Sensitive data masking (card numbers → XXXX)
- Personal info detection with safe redirect
- Duplicate unresolved query prevention

### 📊 Admin Dashboard
- Separate dashboard per business via shareLink
- Total chats, 👍 👎 counts, satisfaction rate
- Top 5 most asked questions
- Unresolved queries list with manual reply
- Auto refresh every 30 seconds
- Mark queries as resolved

### 🔐 Fintech Security
- Sensitive number masking (4+ digits → XXXX)
- Personal info detection
- Input validation and sanitization
- Compliance disclaimer on every chat
- No financial advice given by AI
- Fraud queries escalated to human support

### 🏗️ Architecture
- Multi-tenant — each business gets isolated chatbot + dashboard
- Shareable chat link for customers
- Private dashboard link for admin
- Unresolved query escalation system
- Admin reply saved and reused for future same questions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Axios, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| AI | Groq API (Llama 3.3 70B) |
| Deployment | Vercel (Frontend), Render (Backend) |


faq-chatbot/
├── backend/
│   ├── index.js          # All API routes
│   ├── db.js             # MongoDB connection
│   ├── package.json
│   └── .env              # Environment variables (not committed)
│
└── frontend/
└── src/
├── pages/
│   ├── Setup.jsx       # Create chatbot page
│   ├── ChatPage.jsx    # Customer chat UI
│   └── Dashboard.jsx   # Admin dashboard
└── App.jsx

## 🧑‍💻 How to Use This Project

Anyone can run this chatbot locally in a few simple steps:

---

## 1️⃣ Clone the Project

First, download the project to your system:

```bash
git clone https://github.com/Pragzh/faq-chatbot.git
cd faq-chatbot

2️⃣ Setup Backend

Go into backend folder:

cd backend
npm install

3️⃣ Add Environment Variables

Create a .env file inside the backend folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key

👉 You can get:

MongoDB: https://www.mongodb.com/atlas
Groq API key: https://console.groq.com

4️⃣ Start Backend Server
node index.js

If successful, you will see:

Server running on http://localhost:5000
5️⃣ Setup Frontend

Open a new terminal:

cd frontend
npm install
npm start

Frontend will run at:

http://localhost:3000
6️⃣ Use the Chatbot

Now open your browser:

👉 Go to http://localhost:3000

You can:

Create a chatbot instance
Get a shareable link
Send messages
Get AI responses instantly

---

## 📁 Project Structure
