# scripts/generate_questions.py
import csv
import os

def generate_questions():
    questions = [
        # Math (10 questions)
        {
            "question": "What is 8 + 7?",
            "options": "14;15;16;17",
            "answer": "15",
            "category": "Algebra",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Math",
            "explanation": "Adding 8 and 7 gives 15, as 8 units plus 7 units equals 15 units."
        },
        {
            "question": "What is 20 - 9?",
            "options": "10;11;12;13",
            "answer": "11",
            "category": "Algebra",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Math",
            "explanation": "Subtracting 9 from 20 leaves 11, as 20 units minus 9 units equals 11 units."
        },
        {
            "question": "What is 6 × 3?",
            "options": "15;18;21;24",
            "answer": "18",
            "category": "Algebra",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Math",
            "explanation": "Multiplying 6 by 3 means adding 6 three times (6 + 6 + 6), which equals 18."
        },
        {
            "question": "What is 16 ÷ 4?",
            "options": "3;4;5;6",
            "answer": "4",
            "category": "Algebra",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Math",
            "explanation": "Dividing 16 by 4 means finding how many groups of 4 fit into 16, which is 4 groups."
        },
        {
            "question": "Solve for x: x + 4 = 10",
            "options": "x=4;x=5;x=6;x=7",
            "answer": "x=6",
            "category": "Algebra",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "Math",
            "explanation": "To solve x + 4 = 10, subtract 4 from both sides: x = 10 - 4 = 6."
        },
        {
            "question": "What is the perimeter of a rectangle with length 5 and width 3?",
            "options": "15;16;17;18",
            "answer": "16",
            "category": "Geometry",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "Math",
            "explanation": "Perimeter is 2 × (length + width). For length 5 and width 3, it’s 2 × (5 + 3) = 16 units."
        },
        {
            "question": "What is 4 squared?",
            "options": "12;14;16;18",
            "answer": "16",
            "category": "Algebra",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "Math",
            "explanation": "Squaring 4 means 4 × 4, which equals 16."
        },
        {
            "question": "Solve for y: 2y = 12",
            "options": "y=4;y=5;y=6;y=7",
            "answer": "y=6",
            "category": "Algebra",
            "difficulty": "Medium",
            "grade_level": "8",
            "subject": "Math",
            "explanation": "To solve 2y = 12, divide both sides by 2: y = 12 ÷ 2 = 6."
        },
        {
            "question": "What is 25% of 40?",
            "options": "8;10;12;14",
            "answer": "10",
            "category": "Algebra",
            "difficulty": "Medium",
            "grade_level": "8",
            "subject": "Math",
            "explanation": "To find 25% of 40, calculate 0.25 × 40 = 10."
        },
        {
            "question": "Which number is odd?",
            "options": "2;4;7;8",
            "answer": "7",
            "category": "Number Sense",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Math",
            "explanation": "An odd number is not divisible by 2. Among the options, 7 is not divisible by 2, so it’s odd."
        },
        # Science (10 questions)
        {
            "question": "What is H2O?",
            "options": "Water;Salt;Sugar;Oil",
            "answer": "Water",
            "category": "Chemistry",
            "difficulty": "Easy",
            "grade_level": "7",
            "subject": "Science",
            "explanation": "H2O is the chemical formula for water, a molecule with two hydrogen atoms and one oxygen atom."
        },
        {
            "question": "What planet is known as the Red Planet?",
            "options": "Venus;Mars;Jupiter;Saturn",
            "answer": "Mars",
            "category": "Astronomy",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Science",
            "explanation": "Mars is called the Red Planet due to its reddish appearance, caused by iron oxide (rust) on its surface."
        },
        {
            "question": "What gas do humans exhale?",
            "options": "Oxygen;Carbon Dioxide;Nitrogen;Helium",
            "answer": "Carbon Dioxide",
            "category": "Biology",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Science",
            "explanation": "Humans exhale carbon dioxide, a waste product of respiration, while inhaling oxygen."
        },
        {
            "question": "What is the primary source of Earth’s energy?",
            "options": "Moon;Sun;Wind;Water",
            "answer": "Sun",
            "category": "Physics",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "Science",
            "explanation": "The Sun provides most of Earth’s energy, driving processes like photosynthesis and weather."
        },
        {
            "question": "What is the boiling point of water?",
            "options": "0°C;50°C;100°C;150°C",
            "answer": "100°C",
            "category": "Chemistry",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "Science",
            "explanation": "Water boils at 100°C at standard pressure, changing from liquid to gas."
        },
        {
            "question": "Which organ pumps blood?",
            "options": "Brain;Lungs;Heart;Liver",
            "answer": "Heart",
            "category": "Biology",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "Science",
            "explanation": "The heart pumps blood throughout the body, delivering oxygen and nutrients."
        },
        {
            "question": "What is a force?",
            "options": "Push or pull;Color;Sound;Shape",
            "answer": "Push or pull",
            "category": "Physics",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "Science",
            "explanation": "A force is a push or pull that can change an object’s motion or shape."
        },
        {
            "question": "What is the smallest unit of life?",
            "options": "Atom;Cell;Molecule;Organ",
            "answer": "Cell",
            "category": "Biology",
            "difficulty": "Medium",
            "grade_level": "8",
            "subject": "Science",
            "explanation": "The cell is the smallest unit of life, performing all functions necessary for living organisms."
        },
        {
            "question": "What causes tides?",
            "options": "Sun;Wind;Moon;Earth",
            "answer": "Moon",
            "category": "Astronomy",
            "difficulty": "Medium",
            "grade_level": "8",
            "subject": "Science",
            "explanation": "The Moon’s gravity pulls on Earth’s oceans, causing tides."
        },
        {
            "question": "What is a mixture?",
            "options": "Single substance;Two or more substances;Gas only;Liquid only",
            "answer": "Two or more substances",
            "category": "Chemistry",
            "difficulty": "Medium",
            "grade_level": "8",
            "subject": "Science",
            "explanation": "A mixture contains two or more substances that are physically combined but not chemically bonded."
        },
        # English (10 questions)
        {
            "question": "What is a noun?",
            "options": "Action word;Person, place, or thing;Describing word;Connecting word",
            "answer": "Person, place, or thing",
            "category": "Grammar",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "English",
            "explanation": "A noun names a person, place, or thing, like ‘dog,’ ‘school,’ or ‘Mary.’"
        },
        {
            "question": "Which word is a verb?",
            "options": "Big;Run;House;Blue",
            "answer": "Run",
            "category": "Grammar",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "English",
            "explanation": "A verb shows action or a state of being. ‘Run’ is an action word."
        },
        {
            "question": "What punctuation ends a declarative sentence?",
            "options": "Comma;Period;Question mark;Exclamation point",
            "answer": "Period",
            "category": "Punctuation",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "English",
            "explanation": "A period ends a declarative sentence, which states a fact or opinion."
        },
        {
            "question": "What is a synonym for ‘big’?",
            "options": "Small;Large;Tiny;Short",
            "answer": "Large",
            "category": "Vocabulary",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "English",
            "explanation": "A synonym is a word with the same or similar meaning. ‘Large’ means ‘big.’"
        },
        {
            "question": "What is the subject in: ‘The cat sleeps’?",
            "options": "Sleeps;Cat;The;Bed",
            "answer": "Cat",
            "category": "Grammar",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "English",
            "explanation": "The subject is who or what performs the action. ‘Cat’ is the subject, as it sleeps."
        },
        {
            "question": "What is a metaphor?",
            "options": "Comparison using like;Direct comparison;Rhyming words;Repeating sounds",
            "answer": "Direct comparison",
            "category": "Literary Devices",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "English",
            "explanation": "A metaphor compares two things directly, like ‘The world is a stage,’ without using ‘like’ or ‘as.’"
        },
        {
            "question": "Which word is an adjective?",
            "options": "Quickly;Beautiful;Run;House",
            "answer": "Beautiful",
            "category": "Grammar",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "English",
            "explanation": "An adjective describes a noun. ‘Beautiful’ describes something, like a flower."
        },
        {
            "question": "What is the past tense of ‘go’?",
            "options": "Goes;Gone;Went;Going",
            "answer": "Went",
            "category": "Grammar",
            "difficulty": "Medium",
            "grade_level": "7",
            "subject": "English",
            "explanation": "The past tense of ‘go’ is ‘went,’ used for actions that happened before now."
        },
        {
            "question": "What is an antonym for ‘happy’?",
            "options": "Joyful;Sad;Excited;Content",
            "answer": "Sad",
            "category": "Vocabulary",
            "difficulty": "Easy",
            "grade_level": "6",
            "subject": "English",
            "explanation": "An antonym is a word with the opposite meaning. ‘Sad’ is the opposite of ‘happy.’"
        },
        {
            "question": "What is alliteration?",
            "options": "Repeating initial sounds;Comparing two things;Using like or as;Exaggeration",
            "answer": "Repeating initial sounds",
            "category": "Literary Devices",
            "difficulty": "Medium",
            "grade_level": "8",
            "subject": "English",
            "explanation": "Alliteration is the repetition of initial sounds, like ‘Peter Piper picked.’"
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
    # Create scripts directory if it doesn't exist
    os.makedirs("scripts", exist_ok=True)
    generate_questions()