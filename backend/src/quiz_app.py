# src/quiz_app.py
import streamlit as st
import time
import pandas as pd
from src.utils.file_utils import load_questions_from_csv, load_user_progress, save_user_progress
from src.utils.quiz_logic import shuffle_questions, check_answer
from src.utils.leaderboard_utils import load_leaderboard, update_leaderboard

# Set page config
st.set_page_config(page_title="Sifiso's Ultimate Quiz App", page_icon=":question:", layout="wide")

# Load Bootstrap and Font Awesome
st.markdown("""
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
""", unsafe_allow_html=True)

# Load CSS
def local_css(file_name):
    with open(file_name, "r") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

local_css("app/assets/style.css")

# Cache question loading
@st.cache_data
def cached_load_questions():
    return load_questions_from_csv("app/data/questions.csv")

def main():
    # Initialize session state
    if 'index' not in st.session_state:
        st.session_state.index = 0
    if 'score' not in st.session_state:
        st.session_state.score = 0
    if 'answers' not in st.session_state:
        st.session_state.answers = []
    if 'question_order' not in st.session_state:
        st.session_state.question_order = []
    if 'selected_category' not in st.session_state:
        st.session_state.selected_category = "All"
    if 'selected_difficulty' not in st.session_state:
        st.session_state.selected_difficulty = "All"
    if 'selected_grade_level' not in st.session_state:
        st.session_state.selected_grade_level = "All"
    if 'selected_subject' not in st.session_state:
        st.session_state.selected_subject = "All"
    if 'user_id' not in st.session_state:
        st.session_state.user_id = None
    if 'large_text' not in st.session_state:
        st.session_state.large_text = False
    if 'leaderboard_updated' not in st.session_state:
        st.session_state.leaderboard_updated = False

    # Load questions and progress
    questions = cached_load_questions()
    user_progress = load_user_progress()

    # Welcome message
    st.markdown("""
    <div class="welcome-box">
        <h3>Welcome to Sifiso's Quiz App!</h3>
        <p>Enter your name to start quizzing and climb the leaderboard!</p>
    </div>
    """, unsafe_allow_html=True)

    # Sidebar: Student login and settings
    st.sidebar.markdown("<h2><i class='fas fa-user-graduate'></i> Get Started</h2>", unsafe_allow_html=True)
    user_id = st.sidebar.text_input("Your Name:", key="user_id_input", placeholder="e.g., Alex")
    if user_id:
        st.session_state.user_id = user_id

    # Initialize user progress if new user
    if st.session_state.user_id and st.session_state.user_id not in user_progress:
        user_progress[st.session_state.user_id] = {
            "Math": {"correct": 0, "total": 0},
            "Science": {"correct": 0, "total": 0},
            "Social Studies": {"correct": 0, "total": 0},
            "English": {"correct": 0, "total": 0},
            "badges": []
        }
        try:
            save_user_progress(user_progress)
        except Exception as e:
            st.error(f"Failed to initialize progress: {e}")

    # Ensure existing users have badges key
    if st.session_state.user_id:
        if "badges" not in user_progress.get(st.session_state.user_id, {}):
            user_progress[st.session_state.user_id]["badges"] = []
            try:
                save_user_progress(user_progress)
            except Exception as e:
                st.error(f"Failed to update badges: {e}")

    # Extract unique filters
    categories = sorted({q["category"] for q in questions})
    difficulty_levels = ["All", "Easy", "Medium", "Hard"]
    grade_levels = ["All"] + sorted({q["grade_level"] for q in questions}, key=int)
    subjects = ["All"] + sorted({q["subject"] for q in questions})

    # Sidebar settings
    st.sidebar.markdown("<h2><i class='fas fa-cog'></i> Quiz Settings</h2>", unsafe_allow_html=True)
    new_selected_category = st.sidebar.selectbox("Choose a category", ["All"] + categories)
    new_selected_difficulty = st.sidebar.selectbox("Choose a difficulty level", difficulty_levels)
    new_selected_grade_level = st.sidebar.selectbox("Choose a grade level", grade_levels)
    new_selected_subject = st.sidebar.selectbox("Choose a subject", subjects)
    st.session_state.large_text = st.sidebar.checkbox("Large Text", value=st.session_state.large_text)

    # Apply large text
    if st.session_state.large_text:
        st.markdown("<style>.streamlit-container, .stRadio > label > div > p, .stButton > button { font-size: 20px !important; }</style>", unsafe_allow_html=True)

    # Display progress chart and badges
    if st.session_state.user_id:
        st.sidebar.markdown(f"<h4><i class='fas fa-chart-bar'></i> Progress for {st.session_state.user_id}</h4>", unsafe_allow_html=True)
        user_data = user_progress.get(st.session_state.user_id, {})
        data = {}
        for s in ["Math", "Science", "Social Studies", "English"]:
            subject_data = user_data.get(s, {"correct": 0, "total": 0})
            total = subject_data.get("total", 0)
            correct = subject_data.get("correct", 0)
            data[s] = (correct / total * 100) if total > 0 else 0.0
        if any(data.values()):
            df = pd.Series(data).to_frame(name="Accuracy %")
            st.sidebar.bar_chart(df, color="#FFC107")
        else:
            st.sidebar.markdown("<p class='text-muted'>No progress yet. Answer some questions!</p>", unsafe_allow_html=True)
        badges = user_data.get("badges", [])
        if badges:
            st.sidebar.markdown("<h4><i class='fas fa-medal'></i> Badges</h4>", unsafe_allow_html=True)
            for badge in badges:
                st.sidebar.markdown(f"<span class='badge badge-warning'>{badge}</span>", unsafe_allow_html=True)

    # Reset quiz if filters change
    if (new_selected_category != st.session_state.selected_category or
        new_selected_difficulty != st.session_state.selected_difficulty or
        new_selected_grade_level != st.session_state.selected_grade_level or
        new_selected_subject != st.session_state.selected_subject):
        st.session_state.selected_category = new_selected_category
        st.session_state.selected_difficulty = new_selected_difficulty
        st.session_state.selected_grade_level = new_selected_grade_level
        st.session_state.selected_subject = new_selected_subject
        st.session_state.score = 0
        st.session_state.index = 0
        st.session_state.answers = []
        st.session_state.question_order = []

    # Initialize filtered_questions
    filtered_questions = questions
    if st.session_state.selected_category != "All":
        filtered_questions = [q for q in filtered_questions if q["category"] == st.session_state.selected_category]
    if st.session_state.selected_difficulty != "All":
        filtered_questions = [q for q in filtered_questions if q["difficulty"] == st.session_state.selected_difficulty]
    if st.session_state.selected_grade_level != "All":
        filtered_questions = [q for q in filtered_questions if q["grade_level"] == st.session_state.selected_grade_level]
    if st.session_state.selected_subject != "All":
        filtered_questions = [q for q in filtered_questions if q["subject"] == st.session_state.selected_subject]

    # Main layout
    st.markdown("<h1 class='text-center mb-4'>Sifiso's Ultimate Quiz App</h1>", unsafe_allow_html=True)
    col1, col2 = st.columns([2, 1])

    with col1:
        if not st.session_state.user_id:
            st.info("Please enter your name in the sidebar to start the quiz!")
        else:
            if not filtered_questions:
                st.warning("No questions available for this selection. Try adjusting the filters.")
            else:
                if st.session_state.index < len(filtered_questions):
                    display_question(filtered_questions, user_progress)
                else:
                    display_results(filtered_questions)

    with col2:
        st.markdown("<h3 class='leaderboard-title'><i class='fas fa-trophy'></i> Leaderboard</h3>", unsafe_allow_html=True)
        leaderboard = load_leaderboard()
        if leaderboard:
            leaderboard_with_icons = []
            for i, entry in enumerate(leaderboard):
                if i == 0:
                    entry["position"] = "🥇"
                elif i == 1:
                    entry["position"] = "🥈"
                elif i == 2:
                    entry["position"] = "🥉"
                else:
                    entry["position"] = f"{i + 1}."
                leaderboard_with_icons.append(entry)
            st.dataframe(
                leaderboard_with_icons,
                column_order=["position", "name", "score"],
                column_config={"position": "Position", "name": "Name", "score": "Score"},
                use_container_width=True,
                hide_index=True,
                key=f"leaderboard_{st.session_state.leaderboard_updated}"
            )
        else:
            st.markdown("<p class='text-muted'>No scores yet. Be the first to play!</p>", unsafe_allow_html=True)

    st.sidebar.markdown(
        """
        <div class="text-center mt-4">
            <a href="https://www.linkedin.com/in/sifisoshezi/" target="_blank" class="text-primary">
                Powered by Sifiso
            </a>
        </div>
        """,
        unsafe_allow_html=True,
    )

def display_question(filtered_questions, user_progress):
    if not filtered_questions:
        st.warning("No questions available. Please adjust the filters.")
        return
    if st.session_state.index >= len(filtered_questions):
        return
    if not st.session_state.question_order:
        st.session_state.question_order = shuffle_questions(list(range(len(filtered_questions))))
    question_data = filtered_questions[st.session_state.question_order[st.session_state.index]]
    st.markdown(f"""
    <div class="card question-card">
        <div class="card-body">
            <h5 class="card-title">Question {st.session_state.index + 1}</h5>
            <p class="card-text">{question_data['question']}</p>
            <p class="text-muted">
                <strong>Category:</strong> {question_data['category']} | 
                <strong>Difficulty:</strong> {question_data['difficulty']} | 
                <strong>Grade:</strong> {question_data['grade_level']} | 
                <strong>Subject:</strong> {question_data['subject']}
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    user_answer = st.radio("Choose your answer:", question_data['options'], key=f"answer_{st.session_state.index}")

    # Text-to-speech
    st.markdown("<button class='btn btn-info btn-sm read-aloud-btn'><i class='fas fa-volume-up'></i> Read Aloud</button>", unsafe_allow_html=True)
    if st.session_state.get(f"read_aloud_{st.session_state.index}", False):
        try:
            from gtts import gTTS
            import os
            tts = gTTS(text=question_data['question'], lang='en')
            tts_file = "question.mp3"
            tts.save(tts_file)
            st.audio(tts_file)
            os.remove(tts_file)
        except Exception as e:
            st.error(f"Failed to read aloud: {e}")
    if st.button("Trigger Read Aloud", key=f"read_aloud_trigger_{st.session_state.index}"):
        st.session_state[f"read_aloud_{st.session_state.index}"] = True
        st.rerun()

    message_placeholder = st.empty()
    explanation_placeholder = st.empty()

    if st.button("Submit", type="primary", key=f"submit_{st.session_state.index}"):
        is_correct = check_answer(user_answer, question_data['answer'])
        st.session_state.answers.append({
            "question": question_data['question'],
            "user_answer": user_answer,
            "correct_answer": question_data['answer'],
            "is_correct": is_correct,
            "category": question_data['category'],
            "difficulty": question_data['difficulty'],
            "grade_level": question_data['grade_level'],
            "subject": question_data['subject'],
            "explanation": question_data['explanation']
        })
        if is_correct:
            st.session_state.score += 1
            message_placeholder.markdown("<div class='alert alert-success animate__animated animate__pulse'>Correct! 🎉</div>", unsafe_allow_html=True)
        else:
            message_placeholder.markdown(f"<div class='alert alert-danger'>Wrong! The correct answer is {question_data['answer']} 😞</div>", unsafe_allow_html=True)

        with explanation_placeholder.expander("See Explanation"):
            st.markdown(f"<p>{question_data['explanation']}</p>", unsafe_allow_html=True)

        # Update user progress
        if st.session_state.user_id:
            subject = question_data['subject']
            user_progress[st.session_state.user_id][subject]["total"] += 1
            if is_correct:
                user_progress[st.session_state.user_id][subject]["correct"] += 1

            # Check for badges
            badges = user_progress[st.session_state.user_id].setdefault("badges", [])
            if user_progress[st.session_state.user_id][subject]["correct"] >= 5 and f"{subject} Star" not in badges:
                badges.append(f"{subject} Star")
                st.markdown(f"<div class='alert alert-warning animate__animated animate__bounceIn'>🎉 You earned the {subject} Star badge!</div>", unsafe_allow_html=True)
            if user_progress[st.session_state.user_id][subject]["correct"] >= 10 and f"{subject} Master" not in badges:
                badges.append(f"{subject} Master")
                st.markdown(f"<div class='alert alert-warning animate__animated animate__bounceIn'>🎉 You earned the {subject} Master badge!</div>", unsafe_allow_html=True)

            try:
                save_user_progress(user_progress)
            except Exception as e:
                st.error(f"Failed to save progress: {e}")

        time.sleep(2)
        message_placeholder.empty()
        st.session_state.index += 1
        st.rerun()

def display_results(filtered_questions):
    st.markdown(f"""
    <div class="card result-card">
        <div class="card-body">
            <h4 class="card-title">Quiz Completed!</h4>
            <p class="card-text">Your score: <strong>{st.session_state.score}/{len(filtered_questions)}</strong></p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    accuracy = st.session_state.score / len(filtered_questions) if len(filtered_questions) > 0 else 0
    if accuracy > 0.8 and st.session_state.selected_difficulty != "Hard":
        next_difficulty = "Medium" if st.session_state.selected_difficulty == "Easy" else "Hard"
        st.markdown(f"""
        <div class='alert alert-info'>
            Great job! Your accuracy is {accuracy*100:.1f}%. Try {next_difficulty} difficulty for a challenge.
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<h4>Detailed Results:</h4>", unsafe_allow_html=True)
    for i, answer in enumerate(st.session_state.answers):
        st.markdown(f"""
        <div class="card mb-3">
            <div class="card-body">
                <h6>Question {i + 1}: {answer['question']}</h6>
                <p class="text-muted">
                    <strong>Category:</strong> {answer['category']} | 
                    <strong>Difficulty:</strong> {answer['difficulty']} | 
                    <strong>Grade:</strong> {answer['grade_level']} | 
                    <strong>Subject:</strong> {answer['subject']}
                </p>
                <p>Your Answer: {answer['user_answer']} - <strong>{'Correct' if answer['is_correct'] else 'Wrong'}</strong></p>
                <p>Correct Answer: {answer['correct_answer']}</p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        with st.expander("See Explanation"):
            st.markdown(f"<p>{answer['explanation']}</p>", unsafe_allow_html=True)

    if st.session_state.score > 0:
        name = st.text_input("Enter your name to save your score:", placeholder="e.g., Alex")
        # Use markdown for green button styling
        st.markdown('<button class="btn save-score-btn">Save Score</button>', unsafe_allow_html=True)
        if st.button("Save Score", type="primary", key="save_score"):
            if name:
                try:
                    update_leaderboard(name, st.session_state.score)
                    st.session_state.leaderboard_updated = not st.session_state.leaderboard_updated
                    st.markdown("<div class='alert alert-success animate__animated animate__pulse'>Score saved to leaderboard! 🎉</div>", unsafe_allow_html=True)
                except Exception as e:
                    st.error(f"Failed to save score: {e}")
            else:
                st.error("Please enter your name.")

    if st.button("Restart", type="secondary"):
        st.session_state.score = 0
        st.session_state.index = 0
        st.session_state.answers = []
        st.session_state.question_order = []
        st.session_state.leaderboard_updated = not st.session_state.leaderboard_updated
        st.rerun()

if __name__ == "__main__":
    main()