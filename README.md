# Quiz App

A Streamlit-based quiz app that allows users to test their knowledge across various categories and difficulty levels.

## Features

- **Category Selection:** Choose from a variety of categories to focus on specific topics.
- **Session State Management:** Tracks user progress and ensures a smooth quiz experience.
- **Modular Codebase:** Organized into `src/`, `app/`, and `utils/` folders for scalability.

## Project Structure

```bash
Sifiso-s-Ultimate-Quiz-App/
├── backend/                    # Backend application
│   ├── src/                   # Source code
│   │   ├── utils/            # Utility modules
│   │   │   ├── file_utils.py        # File I/O operations
│   │   │   ├── quiz_logic.py        # Quiz logic and scoring
│   │   │   └── leaderboard_utils.py # Leaderboard management
│   │   ├── quiz_app.py              # Main Streamlit application
│   │   └── quiz_app_enhanced.py     # Enhanced version with additional features
│   ├── app/                  # Application assets and data
│   │   ├── assets/           # Static assets (CSS, images)
│   │   │   └── style.css     # Application styles
│   │   └── data/             # Data files
│   │       ├── questions.csv        # Quiz questions database
│   │       ├── leaderboard.json     # Leaderboard data
│   │       └── user_progress.json   # User progress tracking
│   ├── requirements.txt      # Python dependencies
│   └── run.py               # Application entry point
├── frontend/                # Frontend application (if applicable)
├── venv/                   # Python virtual environment
├── .gitignore              # Git ignore rules
└── README.md               # This file
```bash
