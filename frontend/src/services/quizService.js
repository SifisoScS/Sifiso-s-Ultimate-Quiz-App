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
    // Return fallback questions with the same filters
    return getFallbackQuestions(category, difficulty);
  }
};

// Our comprehensive question database
const questionsDatabase = {
  Geography: {
    easy: [
      {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        answer: "Paris",
        explanation: "Paris has been the capital of France since the 12th century."
      },
      {
        id: 2,
        question: "Which river is the longest in the world?",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        answer: "Nile",
        explanation: "The Nile is approximately 6,650 km long."
      }
    ],
    medium: [
      {
        id: 3,
        question: "Which country has the most time zones?",
        options: ["Russia", "USA", "France", "China"],
        answer: "France",
        explanation: "France has 12 time zones due to its overseas territories."
      }
    ],
    hard: [
      {
        id: 4,
        question: "What is the smallest country in the world by land area?",
        options: ["Monaco", "Nauru", "Vatican City", "San Marino"],
        answer: "Vatican City",
        explanation: "Vatican City is only 0.44 km² in size."
      }
    ]
  },
  Science: {
    easy: [
      {
        id: 5,
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "NaCl", "O2"],
        answer: "H2O",
        explanation: "Water is composed of two hydrogen atoms and one oxygen atom."
      }
    ],
    medium: [
      {
        id: 6,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answer: "Mars",
        explanation: "Mars appears red due to iron oxide on its surface."
      }
    ],
    hard: [
      {
        id: 7,
        question: "What is the hardest natural substance on Earth?",
        options: ["Gold", "Iron", "Diamond", "Quartz"],
        answer: "Diamond",
        explanation: "Diamond scores 10 on the Mohs scale of mineral hardness."
      }
    ]
  },
  History: {
    easy: [
      {
        id: 8,
        question: "In which year did World War II end?",
        options: ["1943", "1945", "1950", "1939"],
        answer: "1945",
        explanation: "World War II ended on September 2, 1945."
      }
    ],
    medium: [
      {
        id: 9,
        question: "Who was the first president of the United States?",
        options: ["Thomas Jefferson", "John Adams", "George Washington", "Abraham Lincoln"],
        answer: "George Washington",
        explanation: "George Washington served from 1789 to 1797."
      }
    ],
    hard: [
      {
        id: 10,
        question: "Which ancient civilization built the Machu Picchu complex?",
        options: ["Aztec", "Maya", "Inca", "Olmec"],
        answer: "Inca",
        explanation: "Machu Picchu was built by the Inca Empire in the 15th century."
      }
    ]
  },
  Sports: {
    easy: [
      {
        id: 11,
        question: "How many players are on a soccer team during a match?",
        options: ["9", "10", "11", "12"],
        answer: "11",
        explanation: "A standard soccer team has 11 players including the goalkeeper."
      }
    ],
    medium: [
      {
        id: 12,
        question: "Which country has won the most FIFA World Cups?",
        options: ["Germany", "Brazil", "Italy", "Argentina"],
        answer: "Brazil",
        explanation: "Brazil has won 5 World Cups (as of 2023)."
      }
    ],
    hard: [
      {
        id: 13,
        question: "Who is the only boxer to remain undefeated throughout his career?",
        options: ["Muhammad Ali", "Rocky Marciano", "Mike Tyson", "Floyd Mayweather"],
        answer: "Rocky Marciano",
        explanation: "Rocky Marciano retired with a 49-0 record."
      }
    ]
  },
  Entertainment: {
    easy: [
      {
        id: 14,
        question: "Who played Jack Dawson in Titanic?",
        options: ["Brad Pitt", "Leonardo DiCaprio", "Tom Cruise", "Johnny Depp"],
        answer: "Leonardo DiCaprio",
        explanation: "Leonardo DiCaprio starred alongside Kate Winslet in Titanic (1997)."
      }
    ],
    medium: [
      {
        id: 15,
        question: "Which TV show features the characters Ross, Rachel, and Chandler?",
        options: ["The Office", "Friends", "How I Met Your Mother", "Seinfeld"],
        answer: "Friends",
        explanation: "Friends aired from 1994 to 2004."
      }
    ],
    hard: [
      {
        id: 16,
        question: "Who directed the movie 'Inception'?",
        options: ["Steven Spielberg", "Christopher Nolan", "Quentin Tarantino", "Martin Scorsese"],
        answer: "Christopher Nolan",
        explanation: "Christopher Nolan also directed The Dark Knight trilogy."
      }
    ]
  }
};

/**
 * Provides fallback questions when API is unavailable
 * @param {string} category - Selected category filter
 * @param {string} difficulty - Selected difficulty filter
 * @returns {Array} - Array of filtered question objects
 */
const getFallbackQuestions = (category = 'all', difficulty = 'all') => {
  // First try to get filtered questions
  const filtered = getAllQuestions().filter(q => {
    const categoryMatch = category === 'all' || q.category === category;
    const difficultyMatch = difficulty === 'all' || q.difficulty === difficulty;
    return categoryMatch && difficultyMatch;
  });

  // If we found matching questions, return them (limited to 10)
  if (filtered.length > 0) {
    return filtered.slice(0, 10);
  }

  // If no matches, return some default questions
  console.warn('No questions match filters. Returning default questions.');
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
      explanation: "Mars appears red due to iron oxide on its surface."
    }
  ];
};

/**
 * Helper function to flatten questions database into a single array
 * @returns {Array} - All questions as a flat array
 */
const getAllQuestions = () => {
  const allQuestions = [];
  for (const category in questionsDatabase) {
    for (const difficulty in questionsDatabase[category]) {
      questionsDatabase[category][difficulty].forEach(q => {
        allQuestions.push({
          ...q,
          category,
          difficulty
        });
      });
    }
  }
  return allQuestions;
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