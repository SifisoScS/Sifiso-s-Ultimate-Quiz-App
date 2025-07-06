# src/utils/file_utils.py
import csv
import json
import os

def load_questions_from_csv(file_path):
    questions = []
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            row['options'] = row['options'].split(';')
            questions.append(row)
    return questions

def load_user_progress(file_path="app/data/user_progress.json"):
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Ensure all users have badges key
                for user in data.values():
                    if "badges" not in user:
                        user["badges"] = []
                return data
        except Exception as e:
            print(f"Error loading user progress: {e}")
            return {}
    return {}

def save_user_progress(progress, file_path="app/data/user_progress.json"):
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(progress, f, indent=4)
    except Exception as e:
        print(f"Error saving user progress: {e}")
        raise
    
def save_question_to_csv(question, file_path="app/data/questions.csv"):
    import csv
    with open(file_path, mode='a', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(question)
    