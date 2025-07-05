# backend/app.py
from flask import Flask, jsonify, request
from src.utils.file_utils import load_questions_from_csv, load_user_progress, save_user_progress
from src.utils.leaderboard_utils import load_leaderboard, update_leaderboard

app = Flask(__name__)

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
    user, subject, is_correct = data["user"], data["subject"], data["is_correct"]
    progress = load_user_progress()
    if user not in progress:
        progress[user] = {
            "Math": {"correct": 0, "total": 0},
            "Science": {"correct": 0, "total": 0},
            "Social Studies": {"correct": 0, "total": 0},
            "English": {"correct": 0, "total": 0},
            "badges": [],
        }
    progress[user][subject]["total"] += 1
    if is_correct:
        progress[user][subject]["correct"] += 1
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
    update_leaderboard(data["name"], data["score"], data["country"])
    return jsonify({"status": "success"})

@app.route("/api/global-stats")
def get_global_stats():
    leaderboard = load_leaderboard()
    stats = {}
    for entry in leaderboard:
        country = entry.get("country", "Unknown")
        stats[country] = stats.get(country, 0) + entry["score"]
    return jsonify(stats)

@app.route("/")
def index():
    return "🎉 Sifiso’s Ultimate Quiz App API is running! Go to /api/questions"

@app.route("/api/debug-questions")
def debug_questions():
    questions = load_questions_from_csv("app/data/questions.csv")
    print("Loaded questions:", questions)
    return "Check console"

if __name__ == "__main__":
    app.run(debug=True)