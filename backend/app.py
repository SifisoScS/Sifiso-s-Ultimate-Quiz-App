# backend/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import csv
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

def load_questions_from_csv(file_path="app/data/questions.csv"):
    """Load questions from CSV file"""
    questions = []
    try:
        # Try different possible paths
        possible_paths = [
            file_path,
            f"../{file_path}",
            f"../../{file_path}",
            "data/questions.csv",
            "../data/questions.csv"
        ]
        
        actual_path = None
        for path in possible_paths:
            if os.path.exists(path):
                actual_path = path
                break
        
        if not actual_path:
            print(f"Questions CSV not found. Tried: {possible_paths}")
            return []
            
        print(f"Loading questions from: {actual_path}")
        
        with open(actual_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Convert options string to list
                if 'options' in row and row['options']:
                    row['options'] = row['options'].split(';')
                questions.append(row)
        return questions
    except Exception as e:
        print(f"Error loading questions: {e}")
        return []

def load_user_progress(file_path="app/data/user_progress.json"):
    """Load user progress from JSON file"""
    try:
        possible_paths = [
            file_path,
            f"../{file_path}",
            f"../../{file_path}",
            "data/user_progress.json",
            "../data/user_progress.json"
        ]
        
        actual_path = None
        for path in possible_paths:
            if os.path.exists(path):
                actual_path = path
                break
        
        if actual_path:
            with open(actual_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Ensure all users have badges key
                for user in data.values():
                    if "badges" not in user:
                        user["badges"] = []
                return data
        else:
            # Create empty progress file
            empty_progress = {}
            try:
                with open('data/user_progress.json', 'w') as f:
                    json.dump(empty_progress, f)
            except:
                pass
            return empty_progress
    except Exception as e:
        print(f"Error loading user progress: {e}")
        return {}

def save_user_progress(progress, file_path="app/data/user_progress.json"):
    """Save user progress to JSON file"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(progress, f, indent=4)
    except Exception as e:
        print(f"Error saving user progress: {e}")

def load_leaderboard(file_path="app/data/leaderboard.json"):
    """Load leaderboard from JSON file"""
    try:
        possible_paths = [
            file_path,
            f"../{file_path}",
            f"../../{file_path}",
            "data/leaderboard.json",
            "../data/leaderboard.json"
        ]
        
        actual_path = None
        for path in possible_paths:
            if os.path.exists(path):
                actual_path = path
                break
        
        if actual_path:
            with open(actual_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Ensure data is a list
                if not isinstance(data, list):
                    print(f"Warning: {file_path} is not a list, resetting to []")
                    return []
                return data
        else:
            # Create empty leaderboard file
            empty_leaderboard = []
            try:
                with open('data/leaderboard.json', 'w') as f:
                    json.dump(empty_leaderboard, f)
            except:
                pass
            return empty_leaderboard
    except Exception as e:
        print(f"Error loading leaderboard: {e}")
        return []

def update_leaderboard(name, score, country="", file_path="app/data/leaderboard.json"):
    """Update leaderboard with new score"""
    try:
        leaderboard = load_leaderboard(file_path)
        # Ensure leaderboard is a list
        if not isinstance(leaderboard, list):
            leaderboard = []
        
        # Add new entry
        leaderboard.append({
            "name": name,
            "score": score,
            "country": country,
            "date": "2024-01-01"  # You can add actual date logic
        })
        
        # Sort by score (descending) and keep top 10
        leaderboard = sorted(leaderboard, key=lambda x: x["score"], reverse=True)[:10]
        
        # Save back
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(leaderboard, f, indent=4)
    except Exception as e:
        print(f"Error updating leaderboard: {e}")

# API Routes
@app.route("/")
def home():
    return "🎉 Sifiso's Ultimate Quiz API is running!"

@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy", "message": "Quiz API is running!"})

@app.route("/api/questions")
def get_questions():
    questions = load_questions_from_csv("app/data/questions.csv")
    return jsonify(questions)

@app.route("/api/progress/<user>")
def get_progress(user):
    progress = load_user_progress()
    return jsonify(progress.get(user, {}))

@app.route("/api/progress", methods=["POST"])
def update_progress():
    data = request.json
    user = data.get("user", "")
    subject = data.get("subject", "General")
    is_correct = data.get("is_correct", False)
    
    progress = load_user_progress()
    if user not in progress:
        progress[user] = {
            "Math": {"correct": 0, "total": 0},
            "Science": {"correct": 0, "total": 0},
            "Social Studies": {"correct": 0, "total": 0},
            "English": {"correct": 0, "total": 0},
            "Geography": {"correct": 0, "total": 0},
            "History": {"correct": 0, "total": 0},
            "Sports": {"correct": 0, "total": 0},
            "Entertainment": {"correct": 0, "total": 0},
            "Technology": {"correct": 0, "total": 0},
            "badges": [],
        }
    
    # Update the specific subject
    if subject in progress[user]:
        progress[user][subject]["total"] += 1
        if is_correct:
            progress[user][subject]["correct"] += 1
            
            # Award badges
            if progress[user][subject]["correct"] >= 5 and f"{subject} Star" not in progress[user]["badges"]:
                progress[user]["badges"].append(f"{subject} Star")
            if progress[user][subject]["correct"] >= 10 and f"{subject} Master" not in progress[user]["badges"]:
                progress[user]["badges"].append(f"{subject} Master")
    
    save_user_progress(progress)
    return jsonify({"status": "success"})

@app.route("/api/leaderboard")
def get_leaderboard():
    return jsonify(load_leaderboard())

@app.route("/api/leaderboard", methods=["POST"])
def post_leaderboard():
    data = request.json
    name = data.get("name", "Anonymous")
    score = data.get("score", 0)
    country = data.get("country", "")
    
    update_leaderboard(name, score, country)
    return jsonify({"status": "success"})

@app.route("/api/global-stats")
def get_global_stats():
    leaderboard = load_leaderboard()
    stats = {}
    for entry in leaderboard:
        country = entry.get("country", "Unknown")
        stats[country] = stats.get(country, 0) + entry["score"]
    return jsonify(stats)

# Additional endpoints for React frontend compatibility
@app.route("/api/daily-challenge")
def get_daily_challenge():
    """Mock daily challenge endpoint"""
    questions = load_questions_from_csv("app/data/questions.csv")
    daily_questions = questions[:3] if len(questions) >= 3 else questions
    
    return jsonify({
        "title": "Daily Challenge",
        "description": "Test your knowledge with today's challenge!",
        "questions": daily_questions,
        "date": "2024-01-01"
    })

@app.route("/api/user-stats")
def get_user_stats():
    """Get user statistics"""
    user_id = request.args.get('userId', 'default')
    progress = load_user_progress()
    user_data = progress.get(user_id, {})
    
    # Calculate stats from progress
    total_quizzes = 0
    total_correct = 0
    total_questions = 0
    
    for subject, data in user_data.items():
        if subject != "badges" and isinstance(data, dict):
            total_quizzes += data.get("total", 0)
            total_correct += data.get("correct", 0)
            total_questions += data.get("total", 0)
    
    average_score = (total_correct / total_questions * 100) if total_questions > 0 else 0
    
    return jsonify({
        "totalQuizzes": total_quizzes,
        "averageScore": round(average_score, 1),
        "bestStreak": 5,  # You can implement streak tracking
        "totalQuestions": total_questions,
        "correctAnswers": total_correct,
        "accuracy": round(average_score, 1),
        "favoriteCategory": "Geography"  # You can calculate this
    })

if __name__ == "__main__":
    print("🚀 Starting Sifiso's Ultimate Quiz API...")
    print("📊 API will be available at: http://localhost:5000")
    print("🔍 Health check: http://localhost:5000/api/health")
    print("❓ Questions API: http://localhost:5000/api/questions")
    app.run(debug=True, port=5000)