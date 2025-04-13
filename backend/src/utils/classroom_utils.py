# src/utils/classroom_utils.py
import json
import os
import random
import string

def generate_session_code():
    """Generate a random 6-digit code."""
    return ''.join(random.choices(string.digits, k=6))

def load_class_sessions(file_path="app/data/class_sessions.json"):
    """Load class sessions from JSON."""
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data if isinstance(data, dict) else {}
        except Exception as e:
            print(f"Error loading class sessions: {e}")
            return {}
    return {}

def save_class_sessions(sessions, file_path="app/data/class_sessions.json"):
    """Save class sessions to JSON."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(sessions, f, indent=4)
    except Exception as e:
        print(f"Error saving class sessions: {e}")
        raise

def create_class_session(teacher_name, file_path="app/data/class_sessions.json"):
    """Create a new session and return its code."""
    sessions = load_class_sessions(file_path)
    code = generate_session_code()
    while code in sessions:
        code = generate_session_code()
    sessions[code] = {"teacher": teacher_name, "students": []}
    save_class_sessions(sessions, file_path)
    return code

def add_student_score(session_code, student_name, score, file_path="app/data/class_sessions.json"):
    """Add a student's score to a session."""
    sessions = load_class_sessions(file_path)
    if session_code in sessions:
        sessions[session_code]["students"].append({"name": student_name, "score": score})
        save_class_sessions(sessions, file_path)
        return True
    return False