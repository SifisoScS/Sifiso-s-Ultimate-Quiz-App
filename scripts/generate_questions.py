# scripts/generate_questions.py
import csv
import os

def generate_questions():
    questions = [
        # Social Studies (10 questions)
        {
            "question": "Who was the first President of the United States?",
            "options": "Abraham Lincoln;George Washington;Thomas Jefferson;John Adams",
            "answer": "George Washington",
            "category": "History",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Social Studies",
            "explanation": "George Washington was the first U.S. President, serving from 1789 to 1797."
        },
        {
            "question": "What is the capital of France?",
            "options": "Paris;London;Berlin;Rome",
            "answer": "Paris",
            "category": "Geography",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Social Studies",
            "explanation": "Paris is the capital city of France, known for landmarks like the Eiffel Tower."
        },
        {
            "question": "What document begins with 'We the People'?",
            "options": "Declaration of Independence;Constitution;Bill of Rights;Emancipation Proclamation",
            "answer": "Constitution",
            "category": "Civics",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "Social Studies",
            "explanation": "The U.S. Constitution starts with 'We the People,' outlining the government’s framework."
        },
        {
            "question": "Which continent is the largest by land area?",
            "options": "Africa;Asia;Australia;Europe",
            "answer": "Asia",
            "category": "Geography",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Social Studies",
            "explanation": "Asia is the largest continent, covering about 30% of Earth’s land area."
        },
        {
            "question": "What was the main cause of the American Civil War?",
            "options": "Taxation;Slavery;Trade disputes;Territorial expansion",
            "answer": "Slavery",
            "category": "History",
            "difficulty": "Medium",
            "grade_level": "8",
            "subject": "Social Studies",
            "explanation": "Slavery was the primary issue, as disagreements over its expansion led to conflict."
        },
        {
            "question": "What is democracy?",
            "options": "Rule by one person;Rule by a few;Rule by the people;Rule by military",
            "answer": "Rule by the people",
            "category": "Civics",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "Social Studies",
            "explanation": "Democracy is a system where the people have the power to vote and make decisions."
        },
        {
            "question": "Which river is the longest in the world?",
            "options": "Amazon;Nile;Yangtze;Mississippi",
            "answer": "Nile",
            "category": "Geography",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "Social Studies",
            "explanation": "The Nile River in Africa is the longest, stretching about 6,650 kilometers."
        },
        {
            "question": "Who wrote the Declaration of Independence?",
            "options": "Benjamin Franklin;John Adams;Thomas Jefferson;James Madison",
            "answer": "Thomas Jefferson",
            "category": "History",
            "difficulty": "Medium",
            "grade_level": "8",
            "subject": "Social Studies",
            "explanation": "Thomas Jefferson was the primary author of the Declaration in 1776."
        },
        {
            "question": "What is the purpose of the United Nations?",
            "options": "Promote peace;Control trade;Manage elections;Enforce laws",
            "answer": "Promote peace",
            "category": "Civics",
            "difficulty": "Medium",
            "grade_level": "8",
            "subject": "Social Studies",
            "explanation": "The United Nations aims to promote peace and cooperation among countries."
        },
        {
            "question": "Which ancient civilization built the pyramids?",
            "options": "Romans;Greeks;Egyptians;Maya",
            "answer": "Egyptians",
            "category": "History",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Social Studies",
            "explanation": "The ancient Egyptians built the pyramids, such as those at Giza, as tombs."
        }
    ]

    # Append to existing CSV
    csv_path = "app/data/questions.csv"
    with open(csv_path, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["question", "options", "answer", "category", "difficulty", "grade_level", "subject", "explanation"])
        for question in questions:
            writer.writerow(question)

    print(f"Added {len(questions)} questions to {csv_path}")

if __name__ == "__main__":
    os.makedirs("scripts", exist_ok=True)
    generate_questions()