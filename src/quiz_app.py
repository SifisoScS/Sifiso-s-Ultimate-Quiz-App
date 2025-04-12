# src/quiz_app.py
import streamlit as st
import time
import pandas as pd
from src.utils.file_utils import load_questions_from_csv, load_user_progress, save_user_progress
from src.utils.quiz_logic import shuffle_questions, check_answer
from src.utils.leaderboard_utils import load_leaderboard, update_leaderboard
from src.utils.classroom_utils import create_class_session, add_student_score, load_class_sessions

# Set page config
st.set_page_config(page_title="Sifiso's Ultimate Quiz App", page_icon=":question:", layout="wide")

# Load CSS
def local_css(file_name):
    with open(file_name, "r") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

local_css("app/assets/style.css")

# Cache question loading to reduce delay
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
    if 'teacher_mode' not in st.session_state:
        st.session_state.teacher_mode = False
    if 'session_code' not in st.session_state:
        st.session_state.session_code = None

    # Load questions and progress
    questions = cached_load_questions()
    user_progress = load_user_progress()

    # Sidebar: Mode selection
    st.sidebar.title("Quiz Mode")
    st.session_state.teacher_mode = st.sidebar.checkbox("Teacher Mode", value=st.session_state.teacher_mode)

    # Use forms to batch input submissions
    if st.session_state.teacher_mode:
        with st.sidebar.form(key="teacher_form"):
            st.subheader("Teacher Setup")
            teacher_name = st.text_input("Teacher Name:")
            submit_teacher = st.form_submit_button("Create Session")
            if submit_teacher:
                if teacher_name:
                    code = create_class_session(teacher_name)
                    st.session_state.session_code = code
                    st.success(f"Session created! Code: {code}")
                else:
                    st.error("Please enter a teacher name.")
        session_code_input = st.sidebar.text_input("Enter Session Code:", key="teacher_session_code_input")
        if session_code_input:
            st.session_state.session_code = session_code_input
    else:
        with st.sidebar.form(key="student_form"):
            st.subheader("Student Login")
            user_id = st.text_input("Your Name:", key="user_id_input")
            session_code_input = st.text_input("Join a Class Session (Optional):", key="student_session_code_input")
            submit_student = st.form_submit_button("Submit")
            if submit_student:
                if user_id:
                    st.session_state.user_id = user_id
                if session_code_input:
                    st.session_state.session_code = session_code_input

    # Initialize user progress if new user (student mode only)
    if st.session_state.user_id and st.session_state.user_id not in user_progress and not st.session_state.teacher_mode:
        user_progress[st.session_state.user_id] = {
            "Math": {"correct": 0, "total": 0},
            "Science": {"correct": 0, "total": 0},
            "Social Studies": {"correct": 0, "total": 0},
            "English": {"correct": 0, "total": 0},
            "badges": []
        }
        save_user_progress(user_progress)

    # Ensure existing users have badges key
    if st.session_state.user_id and not st.session_state.teacher_mode:
        if "badges" not in user_progress.get(st.session_state.user_id, {}):
            user_progress[st.session_state.user_id]["badges"] = []
            save_user_progress(user_progress)

    # Extract unique filters
    categories = sorted({q["category"] for q in questions})
    difficulty_levels = ["All", "Easy", "Medium", "Hard"]
    grade_levels = ["All"] + sorted({q["grade_level"] for q in questions}, key=int)
    subjects = ["All"] + sorted({q["subject"] for q in questions})

    # Sidebar settings
    st.sidebar.title("Quiz Settings")
    new_selected_category = st.sidebar.selectbox("Choose a category", ["All"] + categories)
    new_selected_difficulty = st.sidebar.selectbox("Choose a difficulty level", difficulty_levels)
    new_selected_grade_level = st.sidebar.selectbox("Choose a grade level", grade_levels)
    new_selected_subject = st.sidebar.selectbox("Choose a subject", subjects)
    st.session_state.large_text = st.sidebar.checkbox("Large Text", value=st.session_state.large_text)

    # Apply large text
    if st.session_state.large_text:
        st.markdown("<style>.streamlit-container, .stRadio > label > div > p, .stButton > button { font-size: 20px !important; }</style>", unsafe_allow_html=True)

    # Display progress chart and badges (student mode only)
    if st.session_state.user_id and not st.session_state.teacher_mode:
        st.sidebar.subheader(f"Progress for {st.session_state.user_id}")
        user_data = user_progress.get(st.session_state.user_id, {})
        data = {
            s: (user_data.get(s, {}).get("correct", 0) / user_data.get(s, {}).get("total", 1) * 100)
            if user_data.get(s, {}).get("total", 0) > 0 else 0.0
            for s in ["Math", "Science", "Social Studies", "English"]
        }
        st.sidebar.bar_chart(pd.Series(data))
        badges = user_data.get("badges", [])
        if badges:
            st.sidebar.subheader("Badges")
            for badge in badges:
                st.sidebar.write(f"🏅 {badge}")

    # Display class session results (teacher mode)
    if st.session_state.teacher_mode and st.session_state.session_code:
        sessions = load_class_sessions()
        if st.session_state.session_code in sessions:
            st.sidebar.subheader(f"Session: {st.session_state.session_code}")
            students = sessions[st.session_state.session_code]["students"]
            if students:
                st.sidebar.write("Student Scores:")
                for student in students:
                    st.sidebar.write(f"{student['name']}: {student['score']}")
            else:
                st.sidebar.write("No student scores yet.")
        else:
            st.sidebar.warning("Invalid session code.")

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
    st.title("Sifiso's Ultimate Quiz App")
    col1, col2 = st.columns([2, 1])

    with col1:
        if not st.session_state.user_id and not st.session_state.teacher_mode:
            st.info("Please enter your name in the sidebar to start the quiz!")
        elif st.session_state.teacher_mode and not st.session_state.session_code:
            st.info("Please create or enter a session code in the sidebar to proceed.")
        elif st.session_state.teacher_mode:
            st.info("Session active. Select quiz filters in the sidebar to start the quiz.")
        else:
            if not filtered_questions:
                st.warning("No questions available for this selection. Try adjusting the filters.")
            else:
                if st.session_state.index < len(filtered_questions):
                    display_question(filtered_questions, user_progress)
                else:
                    display_results(filtered_questions)

    with col2:
        st.write("### Leaderboard")
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
            )
        else:
            st.write("No scores yet. Be the first to play!")

    st.sidebar.markdown(
        """
        <div style="text-align: center; margin-top: 20px;">
            <a href="https://www.linkedin.com/in/sifisoshezi/" target="_blank">
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
    st.write(f"**Question {st.session_state.index + 1}:** {question_data['question']}")
    st.write(f"**Category:** {question_data['category']} | **Difficulty:** {question_data['difficulty']} | "
            f"**Grade:** {question_data['grade_level']} | **Subject:** {question_data['subject']}")
    user_answer = st.radio("Choose your answer:", question_data['options'])

    # Text-to-speech
    if st.button("Read Aloud"):
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

    message_placeholder = st.empty()
    explanation_placeholder = st.empty()

    if st.button("Submit"):
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
            message_placeholder.success("Correct! 🎉")
        else:
            message_placeholder.error(f"Wrong! The correct answer is {question_data['answer']} 😞")

        with explanation_placeholder.expander("See Explanation"):
            st.write(question_data['explanation'])

        # Update user progress (student mode only)
        if st.session_state.user_id and not st.session_state.teacher_mode:
            subject = question_data['subject']
            user_progress[st.session_state.user_id][subject]["total"] += 1
            if is_correct:
                user_progress[st.session_state.user_id][subject]["correct"] += 1

            # Check for badges
            badges = user_progress[st.session_state.user_id].setdefault("badges", [])
            if user_progress[st.session_state.user_id][subject]["correct"] >= 5 and f"{subject} Star" not in badges:
                badges.append(f"{subject} Star")
                st.success(f"🎉 You earned the {subject} Star badge!")
            if user_progress[st.session_state.user_id][subject]["correct"] >= 10 and f"{subject} Master" not in badges:
                badges.append(f"{subject} Master")
                st.success(f"🎉 You earned the {subject} Master badge!")

            try:
                save_user_progress(user_progress)
            except Exception as e:
                st.error(f"Failed to save progress: {e}")

        time.sleep(2)
        message_placeholder.empty()
        st.session_state.index += 1
        st.rerun()

def display_results(filtered_questions):
    st.write(f"Quiz Completed! Your score: {st.session_state.score}/{len(filtered_questions)}")
    accuracy = st.session_state.score / len(filtered_questions) if len(filtered_questions) > 0 else 0
    if accuracy > 0.8 and st.session_state.selected_difficulty != "Hard":
        next_difficulty = "Medium" if st.session_state.selected_difficulty == "Easy" else "Hard"
        st.info(f"Great job! Your accuracy is {accuracy*100:.1f}%. Try {next_difficulty} difficulty for a challenge.")

    st.write("### Detailed Results:")
    for i, answer in enumerate(st.session_state.answers):
        st.write(f"**Question {i + 1}:** {answer['question']}")
        st.write(f"**Category:** {answer['category']} | **Difficulty:** {answer['difficulty']} | "
                f"**Grade:** {answer['grade_level']} | **Subject:** {answer['subject']}")
        st.write(f"Your Answer: {answer['user_answer']} - {'Correct' if answer['is_correct'] else 'Wrong'}")
        st.write(f"Correct Answer: {answer['correct_answer']}")
        with st.expander("See Explanation"):
            st.write(answer['explanation'])
        st.write("---")

    if st.session_state.score > 0:
        name = st.text_input("Enter your name to save your score:")
        if st.button("Save Score"):
            if name:
                try:
                    if st.session_state.session_code and add_student_score(st.session_state.session_code, name, st.session_state.score):
                        st.success("Score saved to class session! 🎉")
                    else:
                        update_leaderboard(name, st.session_state.score)
                        st.success("Score saved to leaderboard! 🎉")
                except Exception as e:
                    st.error(f"Failed to save score: {e}")
            else:
                st.error("Please enter your name.")

    if st.button("Restart"):
        st.session_state.score = 0
        st.session_state.index = 0
        st.session_state.answers = []
        st.session_state.question_order = []
        st.rerun()

if __name__ == "__main__":
    main()