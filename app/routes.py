from flask import Blueprint, render_template, jsonify, request
from app.utils.file_utils import load_questions_from_csv
import json
import os

main = Blueprint('main', __name__)

# Serve your interactive quiz page
@main.route("/")
def home():
    return render_template("home.html")

# Provide questions as JSON to your frontend JS
@main.route("/api/questions")
def get_questions():
    questions = load_questions_from_csv('app/data/questions.csv')
    return jsonify(questions)

# (Optional) Leaderboard API
@main.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    filepath = 'app/data/leaderboard.json'
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = []
    return jsonify(data)

# (Optional) Submit score
@main.route("/api/submit", methods=["POST"])
def submit_score():
    new_score = request.json
    filepath = 'app/data/leaderboard.json'
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            leaderboard = json.load(f)
    else:
        leaderboard = []
    leaderboard.append(new_score)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(leaderboard, f, indent=4)
    return jsonify({"message": "Score submitted successfully."})