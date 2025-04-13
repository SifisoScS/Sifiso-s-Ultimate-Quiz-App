import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import quizData from "../data/questions.json";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Globe, Target, User, BarChart, Trophy } from "lucide-react";

const questions = quizData;

export default function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [name, setName] = useState("");

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = () => {
    if (selectedAnswer === currentQuestion.answer) {
      setScore(score + 1);
    }

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResults(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <h1 className="text-4xl font-bold text-blue-700 flex items-center gap-2">
        <Globe className="text-green-600" /> Global Buzz Quiz App
      </h1>
      <p className="text-gray-600 text-center mb-4">
        Test your knowledge, climb the ranks, and represent your country!
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select>
          <SelectTrigger className="w-[200px]">
            <Globe className="mr-2 h-4 w-4 text-gray-500" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[200px]">
            <Target className="mr-2 h-4 w-4 text-gray-500" />
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Enter Your Name"
          className="w-[250px]"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <Card className="w-full max-w-2xl mb-6">
        <CardContent className="p-6">
          {!showResults ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Question {currentQuestionIndex + 1}: {currentQuestion.question}
              </h2>
              {currentQuestion.options.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  className={`w-full mb-2 text-left justify-start ${
                    selectedAnswer === option ? "border-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </Button>
              ))}
              <Button
                className="w-full bg-green-600 text-white mt-4"
                onClick={handleSubmit}
                disabled={!selectedAnswer}
              >
                Submit Answer
              </Button>
              <Progress
                value={((currentQuestionIndex + 1) / questions.length) * 100}
                className="mt-4"
              />
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-700 mb-4">
                Well done {name || "Player"}! 🎉
              </h2>
              <p className="text-lg mb-2">
                You scored <strong>{score}</strong> out of {questions.length}
              </p>
              <Button onClick={handleRestart} className="mt-4">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-around w-full max-w-2xl text-blue-700">
        <Button variant="link" className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard
        </Button>
        <Button variant="link" className="flex items-center gap-1">
          <BarChart className="h-4 w-4 text-blue-500" /> Global Stats
        </Button>
        <Button variant="link" className="flex items-center gap-1">
          <User className="h-4 w-4 text-purple-500" /> My Profile
        </Button>
      </div>
    </main>
  );
}
