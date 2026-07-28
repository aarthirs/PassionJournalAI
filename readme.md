# 🧠 Passion Journal AI

An AI-powered journaling application that transforms daily reflections into meaningful insights.

Users can write about what inspired them each day, and Passion Journal AI analyzes the journal using Google Gemini AI to identify passions, mood, a passion score, personalized reflections, and actionable goals. The application also visualizes progress over time with analytics and streak tracking.

---

## ✨ Features

- 🤖 AI-powered journal analysis using Google Gemini AI
- ❤️ Passion detection
- 😊 Mood analysis
- 📊 Passion Score (0–100)
- 💡 Personalized AI Reflection
- 🎯 Daily Goal Suggestions
- 📈 Weekly Trend Visualization
- 🔥 Daily Streak Tracking
- 📚 Previous Journal History
- 💾 Local persistence using Local Storage
- ⚡ Rule-based fallback when AI is unavailable
- 📱 Responsive modern dashboard

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- Axios
- Lucide React

### Backend

- Node.js
- Express.js

### AI

- Google Gemini 2.5 Flash
- @google/genai SDK

---

## 📂 Project Structure

```
PassionJournalAI
│
├── client
│   ├── components
│   ├── pages
│   ├── context
│   ├── hooks
│   ├── services
│   ├── utils
│   └── styles
│
├── server
│   ├── controllers
│   ├── routes
│   ├── services
│   ├── validators
│   └── config
│
└── README.md
```

---

## 🚀 Getting Started

### Clone

```bash
git clone https://github.com/aarthirs/PassionJournalAI.git
```

### Install Frontend

```bash
cd client
npm install
npm run dev
```

### Install Backend

```bash
cd server
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` inside `/server`

```env
PORT=5000
GEMINI_API_KEY=YOUR_API_KEY
```

---

## Future Improvements

- User authentication
- Cloud database
- Monthly & yearly analytics
- AI conversation history
- Export journals as PDF
- Voice journaling

---

## Inspiration

Passion Journal AI was built around one simple idea:

> Every passion begins with one small step.

Instead of writing a journal that gets forgotten, this application helps users understand what they truly care about and motivates them to keep growing.

---

Made with ❤️ using React, Express & Google Gemini AI.
