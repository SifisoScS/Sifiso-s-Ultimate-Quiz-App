# Quiz App

A Streamlit-based quiz app that allows users to test their knowledge across various categories and difficulty levels.

## Features

- **Educational Content**: Questions tagged by subject (e.g., Math, Science) and grade level (e.g., Grade 6-10).
- **Explanatory Feedback**: Detailed explanations for each answer to promote learning.
- **Customizable Quizzes**: Filter by category, difficulty, grade level, and subject.
- **Leaderboard**: Track top scores with a fun, emoji-based ranking.
- **Responsive Design**: Clean UI with sidebar settings and styled components.

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/sifiso-quiz-app.git
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the app:

   ```bash
   python run.py
   ```

## Data Structure

- app/data/questions.csv: Stores questions with columns question, options, answer, category, difficulty, grade_level, subject, explanation.
- app/data/leaderboard.json: Stores leaderboard data.
- app/data/user_progress.json: (Future) Tracks user learning progress

## Contributing

Contributions are welcome! Please submit pull requests or open issues for bugs/features.

Powered By
Sifiso Shezi
