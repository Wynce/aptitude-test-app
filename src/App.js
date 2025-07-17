// ==============================
// 📘 App.js - Main Application Logic (Final Version)
// ==============================

import React, { useState, useEffect, useCallback } from 'react';
import StartScreen from './screens/StartScreen';
import QuestionCard from './components/QuestionCard';
import ResultScreen from './screens/ResultScreen';
import ReviewScreen from './screens/ReviewScreen';
import ErrorBoundary from './components/ErrorBoundary';
import loadQuestions from './utils/loadQuestions';

function App() {
  // ==============================
  // 🔧 State Hooks
  // ==============================
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [totalTimeLeft, setTotalTimeLeft] = useState(600);
  const [reviewMode, setReviewMode] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState("");

  const [industry, setIndustry] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // ==============================
  // ✅ Submit Answer Handler
  // ==============================
  const submitAnswer = useCallback((selectedOption = currentSelection) => {
    if (completed || currentIndex >= questions.length || currentIndex < 0) {
      setCompleted(true);
      setTestStarted(false);
      setIsAutoSubmitting(false);
      return;
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.answer;

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        category: currentQuestion.category,
        selected: selectedOption,
        correct: isCorrect,
      },
    ]);

    const isLast = currentIndex + 1 >= questions.length;
    if (isLast) {
      setCompleted(true);
      setTestStarted(false);
      setIsAutoSubmitting(false);
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSelection(
        userAnswers.find((a) => a.questionId === questions[nextIndex]?.id)?.selected || ""
      );
      setIsAutoSubmitting(false);
    }
  }, [currentIndex, questions, completed, currentSelection, userAnswers]);

  // ==============================
  // ⏲️ Timer Hook
  // ==============================
  useEffect(() => {
    if (!testStarted || currentIndex >= questions.length) return;

    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAutoSubmitting(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, testStarted, questions.length]);

  // ==============================
  // 🚀 Auto Submit Trigger
  // ==============================
  useEffect(() => {
    if (isAutoSubmitting && questions[currentIndex]) {
      submitAnswer();
      setIsAutoSubmitting(false);
    }
  }, [isAutoSubmitting, currentIndex, questions, submitAnswer]);

  // ==============================
  // 🔙 Back Button
  // ==============================
  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentSelection(
        userAnswers.find((a) => a.questionId === questions[prevIndex]?.id)?.selected || ""
      );
      setIsAutoSubmitting(false);
    }
  };

  const getTimeLimitInSeconds = (difficulty, numQuestions) => {
    const difficultyTimes = { Easy: 30, Medium: 45, Hard: 60 };
    const perQuestionTime = difficultyTimes[difficulty] || 30;
    return perQuestionTime * numQuestions;
  };

  // ==============================
// ▶️ Start Test Handler (receives selected values from StartScreen)
// ==============================
const handleStartTest = async ({ industries, category, difficulty }) => {
  const selectedIndustry = industries[0];
  setIndustry(selectedIndustry);
  setCategory(category);
  setDifficulty(difficulty);

  try {
    const allQuestions = await loadQuestions({
      selectedIndustries: industries,
      selectedCategory: category,
      selectedDifficulty: difficulty,
    });

    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 10);

    if (selectedQuestions.length === 0) {
      alert("No questions found. Please try different filters.");
      return;
    }

    const timeLimit = getTimeLimitInSeconds(difficulty, selectedQuestions.length);

    setQuestions(selectedQuestions);
    setUserAnswers([]);
    setCurrentIndex(0);
    setTotalTimeLeft(timeLimit);
    setTestStarted(true);
    setCompleted(false);
    setReviewMode(false);
    setIsAutoSubmitting(false);
    setCurrentSelection("");
  } catch (error) {
    console.error("❌ Error loading questions:", error);
  }
};

  // ==============================
  // 🔁 Retest: Incorrect
  // ==============================
  const handleRetestIncorrect = async () => {
    const incorrectIds = userAnswers
      .filter((a) => !a.correct)
      .map((a) => a.questionId);
  
    const filtered = questions.filter((q) =>
      incorrectIds.includes(q.id)
    );
  
    if (filtered.length === 0) {
      alert("✅ Congrats! You got everything right. No questions to retest.");
      return;
    }
  
    const timeLimit = getTimeLimitInSeconds(difficulty, filtered.length);
  
    setQuestions(filtered);
    setUserAnswers([]);
    setCurrentIndex(0);
    setTotalTimeLeft(timeLimit);
    setTestStarted(true);
    setCompleted(false);
    setIsAutoSubmitting(false);
    setCurrentSelection("");
  };

  

  // ==============================
  // 🔁 Retest: By Category
  // ==============================
  const handleRetestCategory = async (category) => {
    const allQuestions = await loadQuestions({
      selectedIndustries: [industry],
      selectedCategory: category,
      selectedDifficulty: difficulty,
    });

    const timeLimit = getTimeLimitInSeconds(difficulty, allQuestions.length);

    setQuestions(allQuestions);
    setUserAnswers([]);
    setCurrentIndex(0);
    setTotalTimeLeft(timeLimit);
    setTestStarted(true);
    setCompleted(false);
    setIsAutoSubmitting(false);
    setCurrentSelection("");
  };

  // ==============================
  // 🎨 UI Rendering
  // ==============================
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-screen-md mx-auto bg-white p-4 rounded shadow">
        {!testStarted && !completed ? (
          <StartScreen
            onStart={handleStartTest}
            industry={industry}
            setIndustry={setIndustry}
            category={category}
            setCategory={setCategory}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        ) : reviewMode ? (
          <ReviewScreen
            questions={questions}
            answers={userAnswers}
            onBack={() => setReviewMode(false)}
          />
        ) : completed ? (
          <ResultScreen
            questions={questions}
            answers={userAnswers}
            onRetestIncorrect={handleRetestIncorrect}
            onRetestCategory={handleRetestCategory}
            onReview={() => setReviewMode(true)}
            goHome={() => {
              setTestStarted(false);
              setCompleted(false);
              setReviewMode(false);
              setQuestions([]);
              setUserAnswers([]);
              setCurrentIndex(0);
              setCurrentSelection("");
            }}
          />
        ) : (
          <ErrorBoundary>
            {questions[currentIndex] ? (
              <QuestionCard
                questionObj={questions[currentIndex]}
                currentIndex={currentIndex}
                total={questions.length}
                onAnswer={submitAnswer}
                onBack={handleBack}
                timeLeft={totalTimeLeft}
                selectedAnswer={userAnswers.find(
                  (a) => a.questionId === questions[currentIndex]?.id
                )?.selected || ""}
                onSelect={(selected) => {
                  const currentQuestion = questions[currentIndex];
                  const isCorrect = selected === currentQuestion.answer;
                  setCurrentSelection(selected);
                  setUserAnswers((prev) => {
                    const updated = prev.filter((a) => a.questionId !== currentQuestion.id);
                    return [
                      ...updated,
                      {
                        questionId: currentQuestion.id,
                        category: currentQuestion.category,
                        selected,
                        correct: isCorrect,
                      },
                    ];
                  });
                }}
              />
            ) : (
              <div className="text-center text-red-500">⚠️ Error: Question not found.</div>
            )}
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

export default App;
