// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5000;

const questions = require('./data/questions.json');
const leaderboardPath = './data/leaderboard.json';

app.use(cors());
app.use(express.json()); // Middleware for parsing JSON bodies

// 🔥 Root route
app.get('/', (req, res) => {
  res.send("🎉 Sifiso's Ultimate Quiz API is running!");
});

// GET /api/questions?category=math&difficulty=easy
app.get('/api/questions', (req, res) => {
  const { category, difficulty } = req.query;
  let filtered = questions;

  if (category && category !== 'all') {
    filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }

  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  res.json(filtered);
});

// GET /api/leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const data = fs.readFileSync(leaderboardPath, 'utf8');
    const leaderboard = JSON.parse(data);
    const sorted = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10); // Top 10
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read leaderboard' });
  }
});

// POST /api/leaderboard
app.post('/api/leaderboard', (req, res) => {
  const { name, score } = req.body;
  const entry = { name, score, date: new Date().toISOString() };

  let leaderboard = [];

  try {
    if (fs.existsSync(leaderboardPath)) {
      const data = fs.readFileSync(leaderboardPath, 'utf8');
      leaderboard = JSON.parse(data);
    }

    leaderboard.push(entry);
    fs.writeFileSync(leaderboardPath, JSON.stringify(leaderboard, null, 2));

    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update leaderboard' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
