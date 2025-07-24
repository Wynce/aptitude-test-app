import React, { useEffect, useState } from 'react';
import logo from '../assets/axcel-logo.png';
import { supabase } from '../supabaseClient';

function ResultScreen({
  user,
  questions = [],
  answers = [],
  category,
  industry,
  difficulty,
  onRetestIncorrect,
  onReview,
  goHome,
  setCurrentScreen,
  hasSavedScore,         // 🆕 from App.js
  setHasSavedScore,      // 🆕 from App.js
  isRetest = false,      // ✅ New prop to identify if this is a retest
  actualTimeTaken,       // ✅ New prop for actual time taken
  onBackToOriginal       // ✅ Correct syntax - no default value assignment
}) {

  const [firstName, setFirstName] = useState('User');
  
  // Fetch user first name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Failed to fetch user name:', error.message);
      } else if (data?.first_name) {
        setFirstName(data.first_name);
        console.log('✅ Name set to:', data.first_name);
      }
    };

    fetchUserName();
  }, [user]);

  // Deduplicate answers
  const dedupedAnswersMap = new Map();
  answers.forEach((ans) => {
    if (ans?.questionId) {
      dedupedAnswersMap.set(ans.questionId, ans);
    }
  });
  const dedupedAnswers = Array.from(dedupedAnswersMap.values());

  const totalQuestions = questions.length;
  const correctCount = dedupedAnswers.filter((ans) => ans.correct).length;
  const scorePercentage =
    totalQuestions > 0
      ? Math.min(100, Math.round((correctCount / totalQuestions) * 100))
      : 0;

  // ✅ Use actual time if provided, otherwise fallback to calculated time
  const timeTaken = actualTimeTaken || (totalQuestions * 45);
  const avgTime = totalQuestions > 0 ? Math.round(timeTaken / totalQuestions) : 0;

  // ✅ Different messages for initial test vs retest
  let message = '';
  if (isRetest) {
    if (scorePercentage >= 90) message = '🎯 Excellent Practice';
    else if (scorePercentage >= 70) message = '👏 Good Improvement';
    else if (scorePercentage >= 50) message = '📈 Keep Practicing';
    else message = '💪 Practice Makes Perfect';
  } else {
    if (scorePercentage >= 90) message = '🎉 Congratulations';
    else if (scorePercentage >= 70) message = '👏 Well done';
    else if (scorePercentage >= 30) message = '👍 Keep practising';
    else message = "💪 Don't give up";
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentScreen('login');
  };

  const handleViewScores = () => {
    setCurrentScreen('score-history');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-white text-center">
      {/* Logo and title */}
      <img src={logo} alt="Axcel Logo" className="w-16 h-16 mt-6" />
      <h1 className="text-xl font-semibold text-gray-800 mt-2 mb-4">
        {isRetest ? 'Practice Results' : 'Aptitude Test'}
      </h1>

      {/* Top row buttons */}
      <div className="flex justify-between w-full max-w-xl px-4 mb-4">
        <button
          onClick={goHome}
          className="bg-white text-purple-600 border border-purple-400 px-4 py-2 rounded font-semibold shadow hover:bg-purple-100"
        >
          🏠 Home
        </button>
        <button
          onClick={handleLogout}
          className="bg-white text-red-600 border border-red-400 px-4 py-2 rounded font-semibold shadow hover:bg-red-100"
        >
          🔒 Logout
        </button>
      </div>

      {/* Score Message */}
      <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mt-4">
        {message}, {firstName}!
      </h2>

      {/* ✅ Different info for retest */}
      {isRetest && (
        <p className="text-sm text-gray-500 mt-2 italic">
          This was a practice session - score not saved
        </p>
      )}

      {/* Score Summary */}
      <p className="text-lg mt-4">
        You scored <strong>{scorePercentage}%</strong> ({correctCount} out of {totalQuestions} correct)
      </p>
      <p className="text-md text-gray-600 mt-2">
        Time Taken: <strong>{timeTaken} seconds</strong> | Average: <strong>{avgTime} sec/question</strong>
      </p>

      {/* Action Buttons - Different for retest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 px-4 w-full max-w-xl">
        <button
          onClick={onReview}
          className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700"
        >
          Review Answers
        </button>
        
        {/* ✅ Only show "Retest Incorrect" for initial tests */}
        {!isRetest && (
          <button
            onClick={onRetestIncorrect}
            className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600"
          >
            Retest Incorrect Questions
          </button>
        )}

        <button
          onClick={goHome}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          {isRetest ? 'Try Another Test' : 'Another Test'}
        </button>
        
        {/* ✅ Only show "View Past Scores" for initial tests */}
        {!isRetest && (
          <button
            onClick={handleViewScores}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            📈 View Past Scores
          </button>
        )}

        {/* ✅ For retests, show "Back to Results" button */}
        {isRetest && onBackToOriginal && (
          <button
            onClick={onBackToOriginal}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            🔙 Back to Main Results
          </button>
        )}
      </div>
    </div>
  );
}

export default ResultScreen;