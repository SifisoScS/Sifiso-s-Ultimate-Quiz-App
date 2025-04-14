import React, { useState, useEffect, useRef } from "react";
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
  Shield,
  Globe2,
  Users,
  Star,
  Bookmark
} from "lucide-react";

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
  const [themes, setThemes] = useState(["light"]);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const timerRef = useRef(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "ja", name: "日本語" }
  ];

  useEffect(() => {
    // Fetch countries for the country selector
    fetch("https://restcountries.com/v3.1/all")
      .then(res => res.json())
      .then(data => {
        const sortedCountries = data
          .map(c => ({
            code: c.cca2,
            name: c.name.common
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      });

    // Fetch user stats from localStorage
    const savedStats = localStorage.getItem("quizUserStats");
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }

    // Fetch daily challenge
    fetchDailyChallenge();
  }, []);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      handleSubmit();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, timerActive]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/questions?category=${category}&difficulty=${difficulty}&lang=${selectedLanguage}`
      );
      const data = await res.json();
      setQuestions(data);
      setCurrentQuestionIndex(0);
      setShowResults(false);
      setScore(0);
      setSelectedAnswer(null);
      setStreak(0);
      setTimerActive(false);
      setTimeLeft(15);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/leaderboard?country=${country}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard);
      setUserRank(data.userRank);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  const fetchDailyChallenge = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/daily-challenge");
      const data = await res.json();
      setDailyChallenge(data);
    } catch (err) {
      console.error("Error fetching daily challenge:", err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user-stats");
      const data = await res.json();
      setUserStats(data);
      localStorage.setItem("quizUserStats", JSON.stringify(data));
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const submitToLeaderboard = async () => {
    if (!name) return;
    try {
      await fetch("http://localhost:5000/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          score,
          country,
          category,
          difficulty,
          timeTaken: (questions.length * 15 - timeLeft) / questions.length
        })
      });
      fetchLeaderboard();
      fetchUserStats();
    } catch (err) {
      console.error("Failed to submit score", err);
    }
  };

  const currentQuestion = questions[currentQuestionIndex] || {};

  const handleSubmit = () => {
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
        submitToLeaderboard();
      }
    }, 2000);
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
    fetchQuestions();
    setTimerActive(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <main className={`flex flex-col items-center min-h-screen p-4 ${selectedTheme === "dark" ? "bg-gray-900 text-white" : "bg-blue-50"}`}>
      <div className="flex justify-between w-full max-w-6xl mb-6">
        <div className="flex items-center gap-2">
          <Globe2 className="text-green-600" />
          <h1 className="text-2xl font-bold">Global Buzz Quiz</h1>
        </div>
        <div className="flex gap-4">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[120px]">
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
            <SelectTrigger className="w-[120px]">
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
      </div>

      {!quizStarted ? (
        <div className="w-full max-w-2xl space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="text-yellow-500" /> Welcome to Global Buzz Quiz
            </h2>
            <p className="mb-6">
              Test your knowledge against players worldwide in this ultimate quiz challenge. Compete in
              real-time, climb the leaderboards, and earn achievements!
            </p>

            <div className="space-y-4">
              <Input
                placeholder="Enter Your Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full"
              />

              <Select value={country} onValueChange={setCountry} searchable>
                <SelectTrigger>
                  <Flag className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select Your Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-4">
                <Select value={category} onValueChange={setCategory} className="flex-1">
                  <SelectTrigger>
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

                <Select value={difficulty} onValueChange={setDifficulty} className="flex-1">
                  <SelectTrigger>
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

              <Button onClick={startQuiz} className="w-full bg-green-600 hover:bg-green-700">
                Start Quiz
              </Button>
            </div>
          </Card>

          {dailyChallenge && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Award className="text-purple-500" /> Daily Challenge
                </h3>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {new Date(dailyChallenge.date).toLocaleDateString()}
                </span>
              </div>
              <p className="mb-4">{dailyChallenge.description}</p>
              <Button variant="outline" className="w-full">
                Join Challenge
              </Button>
            </Card>
          )}

          {userStats && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="text-blue-500" /> Your Stats
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{userStats.totalQuizzes}</div>
                  <div className="text-sm text-gray-500">Quizzes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.highScore}</div>
                  <div className="text-sm text-gray-500">High Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.rank}</div>
                  <div className="text-sm text-gray-500">Global Rank</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : !showResults ? (
        <div className="w-full max-w-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{name}</span>
              {country && (
                <span className="text-sm bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                  <Flag className="h-3 w-3" />
                  {countries.find(c => c.code === country)?.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {streak > 2 && (
                <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                  <Sparkles className="h-4 w-4" /> {streak}
                </span>
              )}
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="h-4 w-4 text-red-500" /> {timeLeft}s
              </span>
              <span className="font-semibold">
                {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {questions.length === 0 ? (
                <p className="text-center text-gray-500">Loading questions...</p>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        {currentQuestion.category} • {currentQuestion.difficulty}
                      </span>
                      <h2 className="text-xl font-semibold mt-1">{currentQuestion.question}</h2>
                    </div>
                    {currentQuestion.points && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {currentQuestion.points} pts
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {currentQuestion.options?.map(option => (
                      <Button
                        key={option}
                        variant="outline"
                        className={`w-full justify-start text-left h-auto py-3 ${
                          selectedAnswer === option
                            ? selectedAnswer === currentQuestion.answer
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : ""
                        } ${
                          showExplanation && option === currentQuestion.answer
                            ? "border-green-500 bg-green-50"
                            : ""
                        }`}
                        onClick={() => !showExplanation && setSelectedAnswer(option)}
                        disabled={showExplanation}
                      >
                        <div className="flex items-center w-full">
                          {showExplanation && (
                            <span className="mr-2">
                              {option === currentQuestion.answer ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : option === selectedAnswer ? (
                                <X className="h-4 w-4 text-red-500" />
                              ) : null}
                            </span>
                          )}
                          {option}
                        </div>
                      </Button>
                    ))}
                  </div>

                  {showExplanation && currentQuestion.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                      <p className="font-medium">Explanation:</p>
                      <p>{currentQuestion.explanation}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-6">
                    <Progress
                      value={((currentQuestionIndex + 1) / questions.length) * 100}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedAnswer || showExplanation}
                      className="ml-4 bg-green-600 hover:bg-green-700"
                    >
                      {showExplanation ? "Next Question" : "Submit"}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {score === questions.length ? (
                  <div className="bg-yellow-100 text-yellow-800 p-3 rounded-full">
                    <Trophy className="h-12 w-12" />
                  </div>
                ) : score >= questions.length * 0.8 ? (
                  <div className="bg-blue-100 text-blue-800 p-3 rounded-full">
                    <Award className="h-12 w-12" />
                  </div>
                ) : (
                  <div className="bg-green-100 text-green-800 p-3 rounded-full">
                    <Check className="h-12 w-12" />
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {score === questions.length
                  ? "Perfect Score! 🎉"
                  : score >= questions.length * 0.8
                  ? "Great Job! 👏"
                  : "Well Done!"}
              </h2>
              <p className="text-xl mb-4">
                {name || "Player"}, you scored <span className="font-bold">{score}</span> out of{" "}
                {questions.length}
              </p>
              <p className="text-gray-500 mb-6">
                {maxStreak > 3 && `🔥 You had a streak of ${maxStreak} correct answers!`}
              </p>

              <div className="flex justify-center gap-4">
                <Button onClick={handleRestart} variant="outline">
                  Play Again
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Share Results</Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="text-yellow-500" /> Leaderboard
                </h3>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded ${
                        entry.name === name ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-medium ${
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                              ? "text-gray-500"
                              : index === 2
                              ? "text-amber-700"
                              : ""
                          }`}
                        >
                          {index + 1}.
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.name}</span>
                          {entry.country && (
                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              {countries.find(c => c.code === entry.country)?.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold">{entry.score}</span>
                    </div>
                  ))}
                  {userRank && userRank > 5 && (
                    <>
                      <div className="text-center py-2">...</div>
                      <div className="flex items-center justify-between p-2 rounded bg-blue-50">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{userRank}.</span>
                          <span className="font-medium">{name}</span>
                        </div>
                        <span className="font-bold">{score}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart className="text-blue-500" /> Performance Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Correct Answers</span>
                      <span>
                        {score} / {questions.length}
                      </span>
                    </div>
                    <Progress value={(score / questions.length) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Time</span>
                      <span>{((questions.length * 15 - timeLeft) / questions.length).toFixed(1)}s</span>
                    </div>
                    <Progress
                      value={100 - ((questions.length * 15 - timeLeft) / questions.length / 15) * 100}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Max Streak</span>
                      <span>{maxStreak}</span>
                    </div>
                    <Progress value={(maxStreak / questions.length) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Global Buzz Quiz. All rights reserved.</p>
      </footer>
    </main>
  );
}