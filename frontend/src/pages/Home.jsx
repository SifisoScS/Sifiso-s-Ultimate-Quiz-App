import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import {
  User,
  BarChart,
  Trophy,
  Clock,
  Award,
  Flag,
  ChevronRight,
  Check,
  X,
  Zap,
  Globe2,
  Bookmark,
  Crown,
  Play,
  Menu,
  X as XIcon,
  Home as HomeIcon,
  Flame,
  BookOpen,
  Microscope,
  Film,
  Dumbbell
} from "lucide-react";

import { 
  fetchQuestions, 
  fetchDailyChallenge, 
  submitToLeaderboard, 
  fetchLeaderboard, 
  fetchUserStats 
} from '../services/quizService';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [userStats, setUserStats] = useState(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState("home"); // "home", "leaderboard", "statistics", "saved"
  const timerRef = useRef(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "ja", name: "日本語" }
  ];

  const quizCategories = [
    { id: "all", name: "All Categories", icon: <Globe2 className="h-5 w-5" /> },
    { id: "Geography", name: "Geography", icon: <Globe2 className="h-5 w-5" /> },
    { id: "Science", name: "Science", icon: <Microscope className="h-5 w-5" /> },
    { id: "History", name: "History", icon: <BookOpen className="h-5 w-5" /> },
    { id: "Entertainment", name: "Entertainment", icon: <Film className="h-5 w-5" /> },
    { id: "Sports", name: "Sports", icon: <Dumbbell className="h-5 w-5" /> },
    { id: "Technology", name: "Technology", icon: <Zap className="h-5 w-5" /> }
  ];

  const difficultyLevels = [
    { id: "all", name: "All Levels" },
    { id: "easy", name: "Easy" },
    { id: "medium", name: "Medium" },
    { id: "hard", name: "Hard" }
  ];

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await fetchLeaderboard(country);
      setLeaderboard(data.leaderboard || []);
      setUserRank(data.userRank || null);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setLeaderboard([]);
    }
  }, [country]);

  const loadDailyChallenge = useCallback(async () => {
    try {
      const challenge = await fetchDailyChallenge();
      setDailyChallenge(challenge);
    } catch (error) {
      console.error("Error loading daily challenge:", error);
      setDailyChallenge(null);
    }
  }, []);

  const loadUserStats = useCallback(async () => {
    try {
      const stats = await fetchUserStats(name);
      setUserStats(stats);
    } catch (error) {
      console.error("Error loading user stats:", error);
      setUserStats(null);
    }
  }, [name]);

  const currentQuestion = questions[currentQuestionIndex] || {};

  const submitScore = useCallback(async () => {
  if (!name) return;
  try {
      await submitToLeaderboard({
        name,
          score, // This will now have the correct score
        country,
        category,
        difficulty,
        timeTaken: (questions.length * 15 - timeLeft) / questions.length
      });
      await loadLeaderboard();
      await loadUserStats();
    } catch (error) {
      console.error("Failed to submit score", error);
    }
  }, [name, score, country, category, difficulty, questions.length, timeLeft, loadLeaderboard, loadUserStats]);

  const handleSubmit = useCallback(() => {
    clearTimeout(timerRef.current);
    setTimerActive(false);

    const isCorrect = selectedAnswer === currentQuestion.answer;
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
    } else {
      setStreak(0);
    }

    setShowExplanation(true);

    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setSelectedAnswer(null);
        setTimeLeft(15);
        setTimerActive(true);
        setShowExplanation(false);
      } else {
        setShowResults(true);
        submitScore();
      }
    }, 2000);
  }, [selectedAnswer, currentQuestion.answer, score, streak, maxStreak, currentQuestionIndex, questions.length, submitScore]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sortedCountries = data
            .map(c => ({
              code: c.cca2,
              name: c.name.common
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setCountries(sortedCountries);
        } else {
          setCountries([]);
        }
      })
      .catch(error => {
        console.error("Error fetching countries:", error);
        setCountries([]);
      });

    loadDailyChallenge();
  }, [loadDailyChallenge]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      handleSubmit();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, timerActive, handleSubmit]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const questions = await fetchQuestions(selectedLanguage, category, difficulty);
      setQuestions(questions);
      setCurrentQuestionIndex(0);
      setShowResults(false);
      setScore(0);
      setSelectedAnswer(null);
      setStreak(0);
      setTimerActive(false);
      setTimeLeft(15);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setCategory("all");
    setDifficulty("all");
    setScore(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setStreak(0);
    setTimeLeft(15);
    setTimerActive(false);
    setShowExplanation(false);
    setQuizStarted(false);
    setActiveView("home");
  };

  const startQuiz = () => {
    if (!name) {
      alert("Please enter your name to start the quiz");
      return;
    }
    setQuizStarted(true);
    setActiveView("quiz");
    loadQuestions();
    setTimerActive(true);
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Navigation handlers
  const handleHomeClick = () => {
    setActiveView("home");
    setSidebarOpen(false);
  };

  const handleLeaderboardClick = async () => {
    setActiveView("leaderboard");
    await loadLeaderboard();
    setSidebarOpen(false);
  };

  const handleStatisticsClick = async () => {
    setActiveView("statistics");
    await loadUserStats();
    setSidebarOpen(false);
  };

  const handleSavedQuizzesClick = () => {
    setActiveView("saved");
    setSidebarOpen(false);
  };

  // Sidebar Navigation Component
  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static`}>
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Globe2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-lg text-white">
                Buzz Quiz
              </h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-700 rounded-lg"
            >
              <XIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <button 
            onClick={handleHomeClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === "home" 
                ? "bg-blue-900/20 text-blue-400 font-medium" 
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </button>
          <button 
            onClick={handleLeaderboardClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === "leaderboard" 
                ? "bg-blue-900/20 text-blue-400 font-medium" 
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            <Trophy className="h-5 w-5" />
            <span>Leaderboard</span>
          </button>
          <button 
            onClick={handleStatisticsClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === "statistics" 
                ? "bg-blue-900/20 text-blue-400 font-medium" 
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            <BarChart className="h-5 w-5" />
            <span>Statistics</span>
          </button>
          <button 
            onClick={handleSavedQuizzesClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === "saved" 
                ? "bg-blue-900/20 text-blue-400 font-medium" 
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            <Bookmark className="h-5 w-5" />
            <span>Saved Quizzes</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <div className="px-4 py-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Render different views based on activeView state
  const renderContent = () => {
    switch (activeView) {
      case "leaderboard":
        return renderLeaderboardView();
      case "statistics":
        return renderStatisticsView();
      case "saved":
        return renderSavedQuizzesView();
      case "quiz":
        return renderQuizView();
      case "results":
        return renderResultsView();
      default:
        return renderHomeView();
    }
  };

  const renderHomeView = () => (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Top Header with Menu */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden sm:flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <Globe2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Global Buzz Quiz
              </h1>
              <p className="text-sm text-gray-400">Challenge Your Knowledge</p>
            </div>
          </div>
        </div>
      </header>

      {/* User Info Section */}
      <div className="mb-6">
        <Card className="bg-gray-800 border border-gray-700 rounded-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Your Country
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowCountrySelector(!showCountrySelector)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white text-left flex items-center justify-between hover:border-blue-500 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      {country ? countries.find(c => c.code === country)?.name || "Select Country" : "Select Country"}
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${showCountrySelector ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showCountrySelector && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20 max-h-64 overflow-hidden flex flex-col">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="px-4 py-2 border-b border-gray-600 bg-gray-700 text-white outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="overflow-y-auto">
                        {filteredCountries.map(c => (
                          <button
                            key={c.code}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCountry(c.code);
                              setShowCountrySelector(false);
                              setCountrySearch("");
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-600 transition-colors ${
                              country === c.code ? "bg-blue-900/20 text-blue-400 font-medium" : "text-gray-300"
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Challenge Section */}
      {dailyChallenge && (
        <div className="mb-6">
          <Card className="bg-blue-600 text-white border-0 rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-5 w-5" />
                    <span className="text-sm font-medium">Today's Challenge</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{dailyChallenge.title}</h3>
                  <p className="mb-4 opacity-90">{dailyChallenge.description}</p>
                  <Button 
                    onClick={startQuiz}
                    className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-6 py-2 rounded-lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Challenge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Categories Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-white">
          Choose Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {quizCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`p-4 rounded-lg transition-all border ${
                category === cat.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:border-blue-500"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {cat.icon}
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Levels Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-white">
          Select Difficulty
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {difficultyLevels.map(level => (
            <button
              key={level.id}
              onClick={() => setDifficulty(level.id)}
              className={`p-4 rounded-lg transition-all border ${
                difficulty === level.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:border-blue-500"
              }`}
            >
              <span className="font-medium">{level.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start Quiz Button */}
      <div className="mb-8 flex justify-center">
        <Button
          onClick={startQuiz}
          disabled={!name}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-12 py-3 rounded-lg font-semibold text-lg flex items-center gap-3 transition-colors"
        >
          <Play className="h-5 w-5" />
          Start Quiz
        </Button>
      </div>

      {/* Stats Preview */}
      {userStats && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-white">
            Your Statistics
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border border-gray-700 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{userStats.totalQuizzes || 0}</div>
                <p className="text-sm text-gray-400">Quizzes Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border border-gray-700 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{userStats.averageScore || 0}%</div>
                <p className="text-sm text-gray-400">Average Score</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border border-gray-700 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{userStats.bestStreak || 0}</div>
                <p className="text-sm text-gray-400">Best Streak</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border border-gray-700 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{userRank || "—"}</div>
                <p className="text-sm text-gray-400">Global Rank</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-700 text-center">
        <p className="text-gray-400 text-sm mb-3">
          © {new Date().getFullYear()} Global Buzz Quiz. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <button className="text-gray-400 hover:text-blue-400">About</button>
          <button className="text-gray-400 hover:text-blue-400">Privacy</button>
          <button className="text-gray-400 hover:text-blue-400">Terms</button>
          <button className="text-gray-400 hover:text-blue-400">Contact</button>
        </div>
      </footer>
    </div>
  );

  const renderQuizView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-600"></div>
          <p className="mt-4 text-lg font-medium">Loading your quiz...</p>
        </div>
      );
    }

    if (!showResults) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Quiz Interface */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Header Bar */}
            <div className="bg-blue-600 text-white p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{name}</div>
                    {country && (
                      <div className="text-sm opacity-90 flex items-center gap-1">
                        <Flag className="h-3 w-3" />
                        {countries.find(c => c.code === country)?.name}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {streak > 2 && (
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <Flame className="h-4 w-4" />
                      <span className="font-bold">{streak}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{timeLeft}s</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {currentQuestionIndex + 1}/{questions.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <CardContent className="p-8">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No questions available. Please try again later.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-900/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                        {currentQuestion.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        currentQuestion.difficulty === 'easy' 
                          ? 'bg-green-900/20 text-green-300'
                          : currentQuestion.difficulty === 'medium'
                          ? 'bg-yellow-900/20 text-yellow-300'
                          : 'bg-red-900/20 text-red-300'
                      }`}>
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold leading-relaxed">{currentQuestion.question}</h2>
                  </div>

                  <div className="space-y-3 mb-6">
                    {currentQuestion.options?.map(option => (
                      <Button
                        key={option}
                        variant="outline"
                        className={`w-full justify-start text-left h-auto py-4 px-6 rounded-lg border-2 text-base transition-all ${
                          selectedAnswer === option
                            ? selectedAnswer === currentQuestion.answer
                              ? "border-green-500 bg-green-900/20 text-green-300"
                              : "border-red-500 bg-red-900/20 text-red-300"
                            : "border-gray-600 hover:border-blue-500"
                        } ${
                          showExplanation && option === currentQuestion.answer
                            ? "border-green-500 bg-green-900/20 text-green-300"
                            : ""
                        }`}
                        onClick={() => !showExplanation && setSelectedAnswer(option)}
                        disabled={showExplanation}
                      >
                        <div className="flex items-center w-full">
                          {showExplanation && (
                            <span className="mr-3">
                              {option === currentQuestion.answer ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : option === selectedAnswer ? (
                                <X className="h-5 w-5 text-red-500" />
                              ) : null}
                            </span>
                          )}
                          <span className="flex-1">{option}</span>
                        </div>
                      </Button>
                    ))}
                  </div>

                  {showExplanation && currentQuestion.explanation && (
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
                      <p className="font-semibold text-blue-300 mb-2">Explanation:</p>
                      <p className="text-blue-400">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Progress
                      value={((currentQuestionIndex + 1) / questions.length) * 100}
                      className="flex-1 h-2"
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedAnswer || showExplanation}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      {showExplanation ? "Next" : "Submit"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </div>
        </div>
      );
    } else {
      return renderResultsView();
    }
  };

  const renderResultsView = () => (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Results Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
          {score === questions.length ? (
            <Crown className="h-10 w-10 text-white" />
          ) : score >= questions.length * 0.8 ? (
            <Trophy className="h-10 w-10 text-white" />
          ) : (
            <Award className="h-10 w-10 text-white" />
          )}
        </div>
        <h2 className="text-3xl font-bold mb-3">
          {score === questions.length
            ? "Perfect Score!"
            : score >= questions.length * 0.8
            ? "Outstanding!"
            : "Well Done!"}
        </h2>
        <p className="text-xl mb-2">
          {name || "Player"}, you scored <span className="font-bold text-blue-400">{score}</span> out of {questions.length}
        </p>
        <p className="text-gray-400 mb-6">
          {maxStreak > 3 && `Best streak: ${maxStreak} answers`}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            onClick={handleRestart} 
            variant="outline" 
            className="px-8 py-3 rounded-lg border-2 font-semibold"
          >
            Play Again
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Share Results
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card className="bg-gray-800 border border-gray-700 rounded-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-blue-600" />
              Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.name === name 
                      ? "bg-blue-900/20 border border-blue-800"
                      : "bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                      index === 1 ? "bg-gray-100 text-gray-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{entry.name}</span>
                      {entry.country && (
                        <span className="text-xs bg-gray-600 px-2 py-1 rounded-full">
                          {countries.find(c => c.code === entry.country)?.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold">{entry.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card className="bg-gray-800 border border-gray-700 rounded-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart className="h-6 w-6 text-blue-600" />
              Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Accuracy</span>
                  <span className="font-semibold">
                    {score} / {questions.length} ({(score / questions.length * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress value={(score / questions.length) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Avg Time Per Question</span>
                  <span className="font-semibold">
                    {((questions.length * 15 - timeLeft) / questions.length).toFixed(1)}s
                  </span>
                </div>
                <Progress
                  value={100 - ((questions.length * 15 - timeLeft) / questions.length / 15) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Best Streak</span>
                  <span className="font-semibold">{maxStreak} answers</span>
                </div>
                <Progress value={(maxStreak / questions.length) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-700 text-center">
        <p className="text-gray-400 text-sm mb-3">
          © {new Date().getFullYear()} Global Buzz Quiz. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <button className="text-gray-400 hover:text-blue-400">About</button>
          <button className="text-gray-400 hover:text-blue-400">Privacy</button>
          <button className="text-gray-400 hover:text-blue-400">Terms</button>
          <button className="text-gray-400 hover:text-blue-400">Contact</button>
        </div>
      </footer>
    </div>
  );

  const renderLeaderboardView = () => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Trophy className="h-8 w-8 text-blue-600" />
          Global Leaderboard
        </h1>
      </div>

      <Card className="bg-gray-800 border border-gray-700 rounded-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  entry.name === name 
                    ? "bg-blue-900/20 border border-blue-800"
                    : "bg-gray-700/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                    index === 0 ? "bg-yellow-100 text-yellow-700" :
                    index === 1 ? "bg-gray-100 text-gray-700" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{entry.name}</div>
                    {entry.country && (
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Flag className="h-3 w-3" />
                        {countries.find(c => c.code === entry.country)?.name}
                        {entry.category && entry.category !== 'all' && (
                          <span className="ml-2 px-2 py-1 bg-gray-600 rounded-full text-xs">
                            {entry.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{entry.score}</div>
                  <div className="text-sm text-gray-400">points</div>
                </div>
              </div>
            ))}
            
            {leaderboard.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No scores yet. Be the first to play!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStatisticsView = () => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart className="h-8 w-8 text-blue-600" />
          Your Statistics
        </h1>
      </div>

      {userStats ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{userStats.totalQuizzes || 0}</div>
              <p className="text-sm text-gray-400">Quizzes Completed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{userStats.averageScore || 0}%</div>
              <p className="text-sm text-gray-400">Average Score</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">{userStats.bestStreak || 0}</div>
              <p className="text-sm text-gray-400">Best Streak</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{userStats.totalQuestions || 0}</div>
              <p className="text-sm text-gray-400">Total Questions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{userStats.correctAnswers || 0}</div>
              <p className="text-sm text-gray-400">Correct Answers</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border border-gray-700 rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">{userStats.accuracy || 0}%</div>
              <p className="text-sm text-gray-400">Accuracy</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-gray-800 border border-gray-700 rounded-lg">
          <CardContent className="p-8 text-center">
            <BarChart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No statistics available yet. Play some quizzes to see your stats!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSavedQuizzesView = () => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-blue-600" />
          Saved Quizzes
        </h1>
      </div>

      <Card className="bg-gray-800 border border-gray-700 rounded-lg">
        <CardContent className="p-8 text-center">
          <Bookmark className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Saved Quizzes Yet</h3>
          <p className="text-gray-400 mb-6">
            This feature is coming soon! You'll be able to save your favorite quizzes and resume them later.
          </p>
          <Button 
            onClick={handleHomeClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Start a New Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}