# app/routes.py
from flask import Blueprint, jsonify, request
import csv
import json
import os

main = Blueprint('main', __name__)

def load_questions_from_csv(file_path='data/questions.csv'):
    """Load questions from CSV file"""
    questions = []
    try:
        # Try different possible paths
        possible_paths = [
            file_path,
            f'app/{file_path}',
            f'../{file_path}',
            'data/questions.csv',
            'app/data/questions.csv'
        ]
        
        actual_path = None
        for path in possible_paths:
            if os.path.exists(path):
                actual_path = path
                break
        
        if not actual_path:
            print("Questions CSV file not found in any location")
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

# Health check endpoint
@main.route("/")
def home():
    return "🎉 Sifiso's Ultimate Quiz API is running!"

@main.route("/api/health")
def health_check():
    return jsonify({"status": "healthy", "message": "Quiz API is running!"})

# Provide questions as JSON to your frontend
@main.route("/api/questions")
def get_questions():
    category = request.args.get('category', 'all')
    difficulty = request.args.get('difficulty', 'all')
    
    questions = load_questions_from_csv()
    
    # Filter questions based on query parameters
    filtered_questions = []
    for q in questions:
        if category != 'all' and q.get('category', '').lower() != category.lower():
            continue
        if difficulty != 'all' and q.get('difficulty', '').lower() != difficulty.lower():
            continue
        filtered_questions.append(q)
    
    print(f"Returning {len(filtered_questions)} questions (category: {category}, difficulty: {difficulty})")
    return jsonify(filtered_questions)

# Leaderboard API
@main.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    filepath = 'data/leaderboard.json'
    try:
        # Try different possible paths
        possible_paths = [
            filepath,
            f'app/{filepath}',
            f'../{filepath}'
        ]
        
        actual_path = None
        for path in possible_paths:
            if os.path.exists(path):
                actual_path = path
                break
        
        if actual_path:
            with open(actual_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            # Create empty leaderboard file
            data = []
            with open('data/leaderboard.json', 'w') as f:
                json.dump(data, f)
                
        return jsonify(data)
    except Exception as e:
        print(f"Error loading leaderboard: {e}")
        return jsonify([])

# Submit score
@main.route("/api/submit", methods=["POST"])
def submit_score():
    try:
        new_score = request.json
        filepath = 'data/leaderboard.json'
        
        # Load existing leaderboard
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                leaderboard = json.load(f)
        else:
            leaderboard = []
        
        # Add new score
        leaderboard.append({
            'name': new_score.get('name', 'Anonymous'),
            'score': new_score.get('score', 0),
            'country': new_score.get('country', ''),
            'category': new_score.get('category', 'all'),
            'date': new_score.get('date', '')
        })
        
        # Sort by score (descending) and keep top 10
        leaderboard.sort(key=lambda x: x.get('score', 0), reverse=True)
        leaderboard = leaderboard[:10]
        
        # Save back to file
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(leaderboard, f, indent=4)
            
        return jsonify({"success": True, "message": "Score submitted successfully."})
    
    except Exception as e:
        print(f"Error submitting score: {e}")
        return jsonify({"success": False, "error": str(e)}), 500