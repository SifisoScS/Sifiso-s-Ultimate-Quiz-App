import streamlit as st
import pandas as pd
from app.utils.file_utils import save_question_to_csv 

st.set_page_config(page_title="Global Buzz Question Generator", page_icon="🌍")

def main():
    st.title("Global Buzz Quiz - Admin Question Generator")
    st.write("Add new questions to the global quiz question bank.")

    with st.form("question_form"):
        question = st.text_area("Question", placeholder="Enter your question here...")

        options = []
        for i in range(4):
            option = st.text_input(f"Option {i+1}", key=f"option_{i}")
            options.append(option)

        answer = st.selectbox(
            "Correct Answer",
            options,
            index=0,
            disabled=not all(options)
        )

        category = st.selectbox(
            "Category",
            ["General", "Geography", "Science", "History", "Sports", "Entertainment"]
        )

        difficulty = st.selectbox("Difficulty", ["Easy", "Medium", "Hard"])

        explanation = st.text_area("Explanation", placeholder="Explain why the answer is correct...")

        submit = st.form_submit_button("Save Question")

    if submit:
        if not question or not all(options) or not answer or not explanation:
            st.error("Please fill in all required fields.")
        elif answer not in options:
            st.error("The correct answer must be one of the options.")
        else:
            question_data = {
                "question": question.strip(),
                "options": ";".join([opt.strip() for opt in options]),
                "answer": answer.strip(),
                "category": category,
                "difficulty": difficulty,
                "grade_level": "",   # leave empty
                "subject": "",       # leave empty
                "explanation": explanation.strip()
            }
            try:
                save_question_to_csv("app/data/questions.csv", question_data)
                st.success("Question saved successfully! 🎉")
            except Exception as e:
                st.error(f"Error saving question: {e}")

    if st.checkbox("Show Current Questions"):
        try:
            questions = pd.read_csv("app/data/questions.csv")
            st.dataframe(questions)
        except FileNotFoundError:
            st.warning("No questions found yet.")

if __name__ == "__main__":
    main()