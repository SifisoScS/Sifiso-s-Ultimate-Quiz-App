import streamlit as st
import pandas as pd
from src.utils.file_utils import save_question_to_csv

st.set_page_config(page_title="Sifiso's Question Generator", page_icon=":pencil2:")

def main():
    st.title("Question Generator for Sifiso's Quiz App")
    st.write("Add new questions to the quiz app's question bank.")

    # 👉 Form starts here
    with st.form("question_form"):
        question = st.text_area("Question", placeholder="Enter the question here...")

        options = []
        for i in range(4):
            option = st.text_input(f"Option {i+1}", key=f"option_{i}")
            options.append(option)

        answer = st.selectbox(
            "Correct Answer",
            options,
            index=0,
            disabled=not all(options)  # disable until all options filled
        )

        category = st.text_input("Category", value="General")
        difficulty = st.selectbox("Difficulty", ["Easy", "Medium", "Hard"])
        subject = st.text_input("Subject", value="General")
        grade_level = st.selectbox("Grade Level", [str(i) for i in range(1, 13)] + ["Other"])
        explanation = st.text_area("Explanation", placeholder="Explain why the answer is correct...")

        submit = st.form_submit_button("Save Question")

    # 👉 Process form submission
    if submit:
        if not question or not all(options) or not answer or not explanation:
            st.error("Please fill in all required fields.")
        elif answer not in options:
            st.error("The correct answer must be one of the options.")
        else:
            question_data = {
                "question": question,
                "options": ",".join(options),
                "answer": answer,
                "category": category,
                "difficulty": difficulty,
                "subject": subject,
                "grade_level": grade_level,
                "explanation": explanation
            }
            try:
                save_question_to_csv("app/data/questions.csv", question_data)
                st.success("Question saved successfully! 🎉")
            except Exception as e:
                st.error(f"Error saving question: {e}")

    # 👉 Optional: show current questions
    if st.checkbox("Show Current Questions"):
        try:
            questions = pd.read_csv("app/data/questions.csv")
            st.dataframe(questions)
        except FileNotFoundError:
            st.warning("No questions found yet.")

if __name__ == "__main__":
    main()