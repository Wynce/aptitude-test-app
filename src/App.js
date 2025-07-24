// ==============================
// 📘 App.js - Main Application Logic (Final Version)
// ==============================
import { supabase } from './supabaseClient';
import React, { useState, useEffect, useCallback } from 'react';
import StartScreen from './screens/StartScreen';
import QuestionCard from './components/QuestionCard';
import ResultScreen from './screens/ResultScreen';
import ReviewScreen from './screens/ReviewScreen';
import ScoreHistoryScreen from "./screens/ScoreHistoryScreen";
import ErrorBoundary from './components/ErrorBoundary';
import loadQuestions from './utils/loadQuestions';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AdminDashboard from './screens/AdminDashboard';
import ResultSaverScreen from './screens/ResultSaverScreen'; 
import PracticeResultScreen from './screens/PracticeResultScreen'; 
import PasswordResetScreen from './screens/PasswordResetScreen';
function App() {
 
  // ==============================
  // 🔧 State Hooks
  // ==============================
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); // ⬅️ default to LoginScreen
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [totalTimeLeft, setTotalTimeLeft] = useState(600);
  const [reviewMode, setReviewMode] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState("");
  const [startTimestamp, setStartTimestamp] = useState(null); // 🕒 Track when test starts
  const [industry, setIndustry] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [hasSavedScore, setHasSavedScore] = useState(false); // 🆕
  const [isRetest, setIsRetest] = useState(false); // 🆕 Add this line
  const [originalTestResults, setOriginalTestResults] = useState(null); // 🆕 Store original results
  const [practiceRound, setPracticeRound] = useState(1); // 🆕 Track practice rounds

// 🧼 Reset test state when changing users or logging out
const resetTestState = () => {
  setTestStarted(false);
  setCompleted(false);
  setReviewMode(false);
  setQuestions([]);
  setUserAnswers([]);
  setCurrentIndex(0);
  setCurrentSelection("");
  setTotalTimeLeft(0);
  setHasSavedScore(false);
  setIsRetest(false);
  setOriginalTestResults(null); 
  setPracticeRound(1);
};
  // ✅ Refresh session on mount (fix for 406 error)
useEffect(() => {
  const refreshSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("❌ Failed to refresh Supabase session:", error.message);
    } else {
      console.log("🔁 Supabase session refreshed:", data);
    }
  };
  refreshSession();
}, []);

// ✅ ADD THIS NEW useEffect for password reset detection
useEffect(() => {
  // Check for password reset hash in URL
  const handleAuthRedirect = async () => {
    const hashFragment = window.location.hash;
    if (hashFragment && hashFragment.includes('type=recovery')) {
      console.log("🔑 Password reset link detected");
      setCurrentScreen('reset-password');
    }
  };

  handleAuthRedirect();
}, []);

    
  // ==============================
// ✅ Submit Answer Handler (UPDATED FOR PRACTICE SCREEN)
// ==============================
const submitAnswer = useCallback(
  async (selectedOption = currentSelection) => {
    console.log("isAutoSubmitting:", isAutoSubmitting);

    if (completed || currentIndex >= questions.length || currentIndex < 0) {
      setCompleted(true);
      setTestStarted(false);
      setIsAutoSubmitting(false);
      return;
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.answer;
    console.log("📤 Submitting answer for:", currentQuestion.id, "Selected:", selectedOption);

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
    if (isLast && !completed) {
      setCompleted(true);
      setTestStarted(false);
      setIsAutoSubmitting(false);
      
      // ✅ Route to different screens based on test type
      if (!isRetest) {
        setCurrentScreen('resultSaver'); // Initial test -> save to database
      } else {
        setCurrentScreen('practice'); // Retest -> practice screen (no saving)
      }
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSelection(
        userAnswers.find((a) => a.questionId === questions[nextIndex]?.id)?.selected || ""
      );
      setIsAutoSubmitting(false);
    }
  }, [currentIndex, questions, completed, currentSelection, userAnswers, isAutoSubmitting, isRetest]
);

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
    const alreadyAnswered = userAnswers.find(
      (a) => a.questionId === questions[currentIndex]?.id
    );
    
    
    if (isAutoSubmitting && questions[currentIndex] && !alreadyAnswered) {
      console.log("🚀 Auto-submitting current question...");
      submitAnswer();
      setIsAutoSubmitting(false);
    }
  }, [isAutoSubmitting, currentIndex, questions, submitAnswer, userAnswers]);
  
  
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
    setStartTimestamp(new Date()); // 🟢 Capture actual test start time
    setIsAutoSubmitting(false); // ✅ Move this up immediately
    setIsRetest(false);
    setQuestions(selectedQuestions);
    setUserAnswers([]);
    setCurrentIndex(0);
    setTotalTimeLeft(timeLimit);
    setTestStarted(true);
    setCompleted(false);
    setReviewMode(false);
    setCurrentSelection("");
  } catch (error) {
    console.error("❌ Error loading questions:", error);
  }
};

  // ==============================
// 🔁 Retest: Incorrect (UPDATED FOR PRACTICE ROUNDS)
// ==============================
const handleRetestIncorrect = async () => {
  console.log("🚨 RETEST BUTTON CLICKED!");
  
  // ✅ Save original test results before retest (only if not already saved)
  if (!originalTestResults) {
    const originalResults = {
      questions: [...questions],
      answers: [...userAnswers],
      category,
      industry,
      difficulty,
      startTimestamp,
      actualTimeTaken: startTimestamp ? 
        Math.floor((Date.now() - startTimestamp) / 1000) : 
        questions.length * 45
    };
    setOriginalTestResults(originalResults);
    console.log("💾 Saved original results for first practice session");
  }
  
  // ✅ Remove duplicates from userAnswers first
  const uniqueAnswers = userAnswers.reduce((acc, current) => {
    const existing = acc.find(item => item.questionId === current.questionId);
    if (!existing) {
      acc.push(current);
    }
    return acc;
  }, []);
  
  const incorrectAnswers = uniqueAnswers.filter((a) => !a.correct);
  const incorrectIds = incorrectAnswers.map((a) => a.questionId);
  
  console.log("❌ Incorrect question IDs:", incorrectIds);

  if (incorrectIds.length === 0) {
    alert("🎉 Excellent! You got everything right! No questions to practice.");
    return;
  }

  try {
    // ✅ Load questions with specific IDs
    const incorrectQuestions = await loadQuestions({
      selectedIndustries: [industry],
      selectedCategory: category,
      selectedDifficulty: difficulty,
      specificIds: incorrectIds,
    });

    console.log("🎯 Found incorrect questions:", incorrectQuestions.length);

    if (incorrectQuestions.length === 0) {
      alert(`⚠️ Could not find any of the incorrect questions.`);
      return;
    }

    // ✅ Set up retest with practice tracking
    const timeLimit = getTimeLimitInSeconds(difficulty, incorrectQuestions.length);
    
    // ✅ Increment practice round and set up practice session
    setPracticeRound(prev => prev + 1);
    setCompleted(false);
    setReviewMode(false);
    setCurrentScreen('');
    setQuestions(incorrectQuestions);
    setUserAnswers([]);
    setCurrentIndex(0);
    setTotalTimeLeft(timeLimit);
    setTestStarted(true);
    setIsAutoSubmitting(false);
    setCurrentSelection("");
    setHasSavedScore(false);
    setIsRetest(true); // ✅ Mark this as a retest
    setStartTimestamp(Date.now()); // ✅ Reset timer for practice session

    console.log(`🟢 Practice round ${practiceRound + 1} started with ${incorrectQuestions.length} questions`);
    
  } catch (error) {
    console.error("❌ Error in retest:", error);
    alert("Error loading questions for practice. Please try again.");
  }
};

// ==============================
// 🔙 Return to Original Results
// ==============================
const handleBackToOriginalResults = () => {
  if (!originalTestResults) {
    console.warn("⚠️ No original results found");
    goHome();
    return;
  }

  // ✅ Restore original test state
  setQuestions(originalTestResults.questions);
  setUserAnswers(originalTestResults.answers);
  setCategory(originalTestResults.category);
  setIndustry(originalTestResults.industry);
  setDifficulty(originalTestResults.difficulty);
  setStartTimestamp(originalTestResults.startTimestamp);
  setIsRetest(false);
  setCompleted(true);
  setTestStarted(false);
  setCurrentScreen('result');
  
  console.log("🔙 Returned to original results");
};
  // ==============================
  // 🔁 Retest: By Category
  // ==============================
  


  const goHome = () => {
    window.manualNavigationToStart = true;
    resetTestState();
    setCurrentScreen('start');
  };
  
  // ==============================
  // 🎨 UI Rendering
  // ==============================
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-screen-md mx-auto bg-white p-4 rounded shadow">
      {currentScreen === 'login' ? (
  <LoginScreen setUser={setUser} setCurrentScreen={setCurrentScreen} resetTestState={resetTestState} />
) : currentScreen === 'signup' ? (
  <SignupScreen setUser={setUser} setCurrentScreen={setCurrentScreen} resetTestState={resetTestState} />
) : currentScreen === 'reset-password' ? (
  <PasswordResetScreen setCurrentScreen={setCurrentScreen} />
) : !testStarted && !completed ? (
          <StartScreen
            onStart={handleStartTest}
            user={user}
            setUser={setUser}
            industry={industry}
            setIndustry={setIndustry}
            category={category}
            setCategory={setCategory}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            setCurrentScreen={setCurrentScreen}
          />
        ) : reviewMode ? (
          <ReviewScreen
            questions={questions}
            answers={userAnswers}
            onBack={() => setReviewMode(false)}
          />
        ) : currentScreen === 'score-history' ? (
          <ScoreHistoryScreen
            user={user}
            setCurrentScreen={setCurrentScreen}
            setHasSavedScore={setHasSavedScore}
          />
        ) : currentScreen === 'practice' ? (
          (() => {
            // ✅ Calculate actual time taken (not using * 45 formula)
            const actualTimeTaken = startTimestamp ? 
              Math.floor((Date.now() - startTimestamp) / 1000) : 
              0; // Use 0 if no timestamp available
            
            return (
              <PracticeResultScreen
                user={user}
                questions={questions}
                answers={userAnswers}
                category={category}
                industry={industry}
                difficulty={difficulty}
                onRetestIncorrect={handleRetestIncorrect}
                onReview={() => setReviewMode(true)}
                goHome={goHome}
                setCurrentScreen={setCurrentScreen}
                actualTimeTaken={actualTimeTaken}
                onBackToOriginal={handleBackToOriginalResults}
                practiceRound={practiceRound}
              />
            );
          })()
        ) : currentScreen === 'resultSaver' ? (
  (() => {
    // Calculate the required values
    const correctCount = userAnswers.filter(a => a.correct).length;
    const totalQuestions = userAnswers.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    // ✅ Calculate actual time taken
    const endTimestamp = Date.now();
    const actualTimeTaken = startTimestamp ? 
      Math.floor((endTimestamp - startTimestamp) / 1000) : 
      totalQuestions * 45;
    
    return (
      <ResultSaverScreen
        user={user}
        answers={userAnswers}
        firstName={user?.user_metadata?.first_name || "N/A"}
        category={category}
        difficulty={difficulty}
        industry={industry}
        score={score}
        correctCount={correctCount}
        totalQuestions={totalQuestions}
        actualTimeTaken={actualTimeTaken} // ✅ Pass actual time
        setHasSavedScore={setHasSavedScore}
        setCurrentScreen={setCurrentScreen}
        sourceScreen="test"
        startTimestamp={startTimestamp}
      />
    );
  })()

// Update the result section (around line 330):
) : currentScreen === 'result' ? (
  (() => {
    // ✅ Calculate actual time taken for result screen too
    const endTimestamp = Date.now();
    const actualTimeTaken = startTimestamp ? 
      Math.floor((endTimestamp - startTimestamp) / 1000) : 
      questions.length * 45;
    
      return (
        <ResultScreen  
          questions={questions}
          answers={userAnswers}
          onRetestIncorrect={handleRetestIncorrect}
          onReview={() => setReviewMode(true)}
          goHome={goHome}
          user={user}
          setCurrentScreen={setCurrentScreen}
          category={category}
          industry={industry}
          difficulty={difficulty}
          hasSavedScore={hasSavedScore}
          setHasSavedScore={setHasSavedScore}
          isRetest={isRetest}
          actualTimeTaken={actualTimeTaken} // ✅ Pass actual time
          onBackToOriginal={handleBackToOriginalResults} 
        />
      );
  })()

) : currentScreen === 'admin' ? (
  <AdminDashboard
    setCurrentScreen={setCurrentScreen}
    user={user}
  />
) : (
  <ErrorBoundary>
  <>
    {(() => {
      if (questions[currentIndex]) {
        
      }
      return null;
    })()}

    {questions[currentIndex] ? (
      <QuestionCard
        questionObj={questions[currentIndex]}
        currentIndex={currentIndex}
        total={questions.length}
        onAnswer={submitAnswer}
        onBack={handleBack}
        timeLeft={totalTimeLeft}
        selectedAnswer={
          userAnswers.find(
            (a) => a.questionId === questions[currentIndex]?.id
          )?.selected || ""
        }
        onSelect={(selected) => {
          const currentQuestion = questions[currentIndex];
          const isCorrect = selected === currentQuestion.answer;
          setCurrentSelection(selected);
          
          setUserAnswers((prev) => {
            // ✅ Remove any existing answers for this question first
            const filtered = prev.filter(
              (a) => a.questionId !== currentQuestion.id
            );
            
            // ✅ Add the new answer
            return [
              ...filtered,
              {
                questionId: currentQuestion.id,
                category: currentQuestion.category, // ✅ Make sure category is included
                selected,
                correct: isCorrect,
              },
            ];
          });
        }}
      />
    ) : (
      <div className="text-center text-red-500">
        ⚠️ Error: Question not found.
      </div>
    )}
  </>
</ErrorBoundary>
        )}
      </div>
    </div>
  );
  
}

export default App;



