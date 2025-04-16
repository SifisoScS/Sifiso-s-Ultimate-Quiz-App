// src/services/quizService.js

/**
 * Fetches quiz questions from the API
 * @param {string} lang - Language code (e.g., 'en', 'es')
 * @param {string} category - Question category
 * @param {string} difficulty - Question difficulty
 * @returns {Promise<Array>} - Array of question objects
 */
export const fetchQuestions = async (lang = 'en', category = 'all', difficulty = 'all') => {
    try {
      let url = `http://localhost:5000/api/questions?lang=${lang}`;
      if (category !== 'all') url += `&category=${category}`;
      if (difficulty !== 'all') url += `&difficulty=${difficulty}`;
  
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Return fallback questions if API fails
      return getFallbackQuestions();
    }
  };
  
  /**
   * Provides fallback questions when API is unavailable
   * @returns {Array} - Array of fallback question objects
   */
  const getFallbackQuestions = () => {
    return [
      {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        answer: "Paris",
        category: "Geography",
        difficulty: "easy",
        explanation: "Paris has been the capital of France since the 12th century."
      },
      {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answer: "Mars",
        category: "Science",
        difficulty: "easy",
        explanation: "Mars appears red due to iron oxide (rust) on its surface."
      },
      {
        id: 3,
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        answer: "Leonardo da Vinci",
        category: "Art",
        difficulty: "medium",
        explanation: "Leonardo da Vinci painted the Mona Lisa between 1503 and 1506."
      }
    ];
  };
  
  /**
   * Fetches daily challenge questions
   * @returns {Promise<Object>} - Daily challenge object
   */
  export const fetchDailyChallenge = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/daily-challenge');
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
      return {
        date: new Date().toISOString(),
        description: "Daily challenge is currently unavailable. Try again later.",
        questions: getFallbackQuestions()
      };
    }
  };
  
  /**
   * Submits score to leaderboard
   * @param {Object} scoreData - Score data to submit
   * @returns {Promise<Object>} - Submission result
   */
  export const submitToLeaderboard = async (scoreData) => {
    try {
      const response = await fetch('http://localhost:5000/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scoreData)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to submit score', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Fetches leaderboard data
   * @param {string} country - Country code to filter by
   * @returns {Promise<Object>} - Leaderboard data
   */
  export const fetchLeaderboard = async (country = '') => {
    try {
      const url = country 
        ? `http://localhost:5000/api/leaderboard?country=${country}`
        : 'http://localhost:5000/api/leaderboard';
        
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return { leaderboard: [], userRank: null };
    }
  };
  
  /**
   * Fetches user statistics
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} - User statistics
   */
  export const fetchUserStats = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-stats?userId=${userId}`);
      const data = await response.json();
      localStorage.setItem("quizUserStats", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  };