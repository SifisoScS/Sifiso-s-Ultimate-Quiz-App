import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import {
  Globe,
  Target,
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
  Sparkles,
  Globe2,
  Bookmark,
  Crown,
  TrendingUp,
  Star,
  Play,
  Shield,
  Lightbulb
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
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "ja", name: "日本語" }
  ];

  const features = [
    {
      icon: <Globe2 className="h-8 w-8" />,
      title: "Global Competition",
      description: "Compete with players worldwide in real-time"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Track Progress",
      description: "Monitor your stats and improvement over time"
    },
    {
      icon: <Crown className="h-8 w-8" />,
      title: "Daily Challenges",
      description: "New challenges every day to test your skills"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Multiple Categories",
      description: "From science to entertainment, we have it all"
    }
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
      if (stats) {
        localStorage.setItem("quizUserStats", JSON.stringify(stats));
      }
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
        score,
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
          console.error("Countries data is not an array:", data);
          setCountries([]);
        }
      })
      .catch(error => {
        console.error("Error fetching countries:", error);
        setCountries([]);
      });

    const savedStats = localStorage.getItem("quizUserStats");
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }

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
  };

  const startQuiz = () => {
    if (!name) {
      alert("Please enter your name to start the quiz");
      return;
    }
    setQuizStarted(true);
    loadQuestions();
    setTimerActive(true);
  };

  return (
    <main className={`min-h-screen transition-colors duration-300 ${selectedTheme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"}`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-12">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-2">
                <Globe2 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Global Buzz Quiz
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Challenge Your Mind, Conquer the World</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[130px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent searchable>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="w-[130px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <Sparkles className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {!quizStarted ? (
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <section className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="h-4 w-4 fill-current" />
                Join 50,000+ players worldwide
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Test Your Knowledge
                <br />
                <span className="text-4xl md:text-5xl">Against The World</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                Dive into an exciting quiz experience with real-time global competition, 
                daily challenges, and detailed analytics to track your progress.
              </p>
            </section>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Main Quiz Card */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75"></div>
                  <Card className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold">Start Your Quiz Journey</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Your Name
                          </label>
                          <Input
                            placeholder="Enter your name to begin..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 transition-all duration-300 rounded-xl py-3 px-4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Your Country
                          </label>
                          <Select value={country} onValueChange={setCountry} searchable>
                            <SelectTrigger className="w-full bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-xl py-3 px-4">
                              <Flag className="mr-2 h-4 w-4" />
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map(c => (
                                <SelectItem key={c.code} value={c.code}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Category
                            </label>
                            <Select value={category} onValueChange={setCategory}>
                              <SelectTrigger className="bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-xl py-3 px-4">
                                <Bookmark className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="All Categories" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Geography">Geography</SelectItem>
                                <SelectItem value="Science">Science</SelectItem>
                                <SelectItem value="History">History</SelectItem>
                                <SelectItem value="Sports">Sports</SelectItem>
                                <SelectItem value="Entertainment">Entertainment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Difficulty
                            </label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                              <SelectTrigger className="bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-xl py-3 px-4">
                                <Target className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="All Difficulties" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Difficulties</SelectItem>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button 
                          onClick={startQuiz} 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <Play className="mr-2 h-5 w-5" />
                          Start Quiz Challenge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar Cards */}
              <div className="space-y-6">
                {/* Daily Challenge */}
                {dailyChallenge && (
                  <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-2xl rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="h-6 w-6" />
                        <h3 className="text-lg font-bold">Daily Challenge</h3>
                      </div>
                      <p className="text-sm opacity-90 mb-4">{dailyChallenge.description}</p>
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="bg-white/20 px-2 py-1 rounded">
                          {dailyChallenge.category || "Mixed"}
                        </span>
                        <span className="bg-white/20 px-2 py-1 rounded">
                          {dailyChallenge.difficulty || "All Levels"}
                        </span>
                      </div>
                      <Button 
                        variant="secondary" 
                        className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                        onClick={() => {
                          setCategory(dailyChallenge.category || "all");
                          setDifficulty(dailyChallenge.difficulty || "all");
                          startQuiz();
                        }}
                      >
                        Join Challenge
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* User Stats */}
                {userStats && (
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <User className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-bold">Your Stats</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                          <div className="text-xl font-bold text-blue-600">{userStats.totalQuizzes}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Quizzes</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                          <div className="text-xl font-bold text-green-600">{userStats.highScore}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">High Score</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
                          <div className="text-xl font-bold text-purple-600">{userStats.rank}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Global Rank</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Features */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Why Play With Us?
                    </h3>
                    <div className="space-y-3">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            {React.cloneElement(feature.icon, { className: "h-4 w-4 text-blue-600" })}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{feature.title}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{feature.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
              <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-purple-500 opacity-75" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <p className="mt-4 text-lg font-semibold">Loading your quiz...</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Getting everything ready for your challenge</p>
          </div>
        ) : !showResults ? (
          <div className="max-w-4xl mx-auto">
            {/* Quiz Interface */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border-0 overflow-hidden">
              {/* Header Bar */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
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
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                        <span className="font-bold">Streak: {streak}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono font-bold">{timeLeft}s</span>
                    </div>
                    <div className="text-lg font-bold">
                      {currentQuestionIndex + 1}/{questions.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <CardContent className="p-8">
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No questions available. Please try again later.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                            {currentQuestion.category}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentQuestion.difficulty === 'easy' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              : currentQuestion.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          }`}>
                            {currentQuestion.difficulty}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold leading-relaxed">{currentQuestion.question}</h2>
                      </div>
                      {currentQuestion.points && (
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                          {currentQuestion.points} pts
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 mb-6">
                      {currentQuestion.options?.map(option => (
                        <Button
                          key={option}
                          variant="outline"
                          className={`w-full justify-start text-left h-auto py-4 px-6 rounded-xl border-2 text-lg transition-all duration-300 ${
                            selectedAnswer === option
                              ? selectedAnswer === currentQuestion.answer
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                                : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                              : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700"
                          } ${
                            showExplanation && option === currentQuestion.answer
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                              : ""
                          }`}
                          onClick={() => !showExplanation && setSelectedAnswer(option)}
                          disabled={showExplanation}
                        >
                          <div className="flex items-center w-full">
                            {showExplanation && (
                              <span className="mr-4">
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
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                        <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Explanation:</p>
                        <p className="text-blue-700 dark:text-blue-400">{currentQuestion.explanation}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <Progress
                        value={((currentQuestionIndex + 1) / questions.length) * 100}
                        className="flex-1 h-3 rounded-full"
                      />
                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedAnswer || showExplanation}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        {showExplanation ? "Next Question" : "Submit Answer"}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Results Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-2xl">
                {score === questions.length ? (
                  <Crown className="h-12 w-12 text-white" />
                ) : score >= questions.length * 0.8 ? (
                  <Trophy className="h-12 w-12 text-white" />
                ) : (
                  <Award className="h-12 w-12 text-white" />
                )}
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                {score === questions.length
                  ? "Perfect Score! 🎉"
                  : score >= questions.length * 0.8
                  ? "Outstanding! 👏"
                  : "Well Played! 🎯"}
              </h2>
              <p className="text-xl mb-2">
                {name || "Player"}, you scored <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">{score}</span> out of{" "}
                {questions.length}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {maxStreak > 3 && `🔥 Amazing ${maxStreak}-answer streak!`}
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={handleRestart} 
                  variant="outline" 
                  className="px-8 py-3 rounded-xl border-2 font-semibold hover:scale-105 transition-transform duration-300"
                >
                  Play Again
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Share Results
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Leaderboard */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Global Leaderboard
                  </h3>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                          entry.name === name 
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-200 dark:border-blue-800"
                            : "bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0 ? "bg-yellow-100 text-yellow-600" :
                            index === 1 ? "bg-gray-100 text-gray-600" :
                            index === 2 ? "bg-amber-100 text-amber-600" :
                            "bg-blue-100 text-blue-600"
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{entry.name}</span>
                            {entry.country && (
                              <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                {countries.find(c => c.code === entry.country)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-lg">{entry.score}</span>
                      </div>
                    ))}
                    {userRank && userRank > 5 && (
                      <>
                        <div className="text-center py-2 text-gray-500">...</div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold bg-blue-100 text-blue-600">
                              {userRank}
                            </div>
                            <span className="font-semibold">{name}</span>
                          </div>
                          <span className="font-bold text-lg">{score}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Stats */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <BarChart className="h-6 w-6 text-blue-500" />
                    Performance Analytics
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Accuracy</span>
                        <span className="font-semibold">
                          {score} / {questions.length} ({(score / questions.length * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={(score / questions.length) * 100} className="h-3 rounded-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Average Time Per Question</span>
                        <span className="font-semibold">
                          {((questions.length * 15 - timeLeft) / questions.length).toFixed(1)}s
                        </span>
                      </div>
                      <Progress
                        value={100 - ((questions.length * 15 - timeLeft) / questions.length / 15) * 100}
                        className="h-3 rounded-full"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Best Streak</span>
                        <span className="font-semibold">{maxStreak} answers</span>
                      </div>
                      <Progress value={(maxStreak / questions.length) * 100} className="h-3 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Global Buzz Quiz. Challenge your mind, conquer the world. 🌍
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}