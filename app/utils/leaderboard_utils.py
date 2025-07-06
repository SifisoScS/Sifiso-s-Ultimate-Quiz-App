# src/utils/leaderboard_utils.py
import json
import os

LEADERBOARD_FILE = "app/data/leaderboard.json"

def load_leaderboard(file_path="app/data/leaderboard.json"):
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Ensure data is a list
                if not isinstance(data, list):
                    print(f"Warning: {file_path} is not a list, resetting to []")
                    return []
                return data
        except Exception as e:
            print(f"Error loading leaderboard: {e}")
            return []
    return []

def save_leaderboard(leaderboard, file_path="app/data/leaderboard.json"):
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(leaderboard, f, indent=4)
    except Exception as e:
        print(f"Error saving leaderboard: {e}")
        raise

def update_leaderboard(name, score, file_path="app/data/leaderboard.json"):
    leaderboard = load_leaderboard(file_path)
    # Ensure leaderboard is a list
    if not isinstance(leaderboard, list):
        leaderboard = []
    leaderboard.append({"name": name, "score": score})
    # Sort by score (descending) and keep top 10
    leaderboard = sorted(leaderboard, key=lambda x: x["score"], reverse=True)[:10]
    save_leaderboard(leaderboard, file_path)