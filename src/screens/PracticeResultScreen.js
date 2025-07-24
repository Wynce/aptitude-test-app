import React, { useEffect, useState } from 'react';
import logo from '../assets/axcel-logo.png';
import { supabase } from '../supabaseClient';

function PracticeResultScreen({
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
  actualTimeTaken,
  onBackToOriginal,
  practiceRound = 1 // Track which practice round this is
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

  // Use actual time if provided, otherwise fallback to calculated time
  const timeTaken = actualTimeTaken || (totalQuestions * 45);
  const avgTime = totalQuestions > 0 ? Math.round(timeTaken / totalQuestions) : 0;

  // Practice-specific messages
  let message = '';
  let encouragement = '';
  
  if (scorePercentage === 100) {
    message = '🎯 Perfect Practice!';
    encouragement = 'Outstanding! You\'ve mastered these questions!';
  } else if (scorePercentage >= 80) {
    message = '🌟 Excellent Progress!';
    encouragement = 'Great improvement! Keep practicing the remaining questions.';
  } else if (scorePercentage >= 60) {
    message = '📈 Good Improvement!';
    encouragement = 'You\'re getting better! Practice makes perfect.';
  } else if (scorePercentage >= 40) {
    message = '💪 Keep Practicing!';
    encouragement = 'Don\'t give up! Each practice session helps you improve.';
  } else {
    message = '🔄 Practice More!';
    encouragement = 'Focus on understanding each question. You\'ll get there!';
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentScreen('login');
  };

  // Count incorrect questions for the retest button
  const incorrectCount = totalQuestions - correctCount;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-br from-blue-50 to-purple-50 text-center">
      {/* Logo and title */}
      <img src={logo} alt="Axcel Logo" className="w-16 h-16 mt-6" />
      <h1 className="text-xl font-semibold text-gray-800 mt-2 mb-2">
        Practice Session #{practiceRound}
      </h1>
      <p className="text-sm text-gray-600 italic mb-4">
        🎯 {category} • {difficulty} • {industry}
      </p>

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

      {/* Practice Results Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mb-6">
        {/* Score Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-2">
          {message}, {firstName}!
        </h2>
        
        <p className="text-gray-600 mb-4">{encouragement}</p>

        {/* Score Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-lg mb-2">
            Practice Score: <strong className="text-blue-600">{scorePercentage}%</strong> 
            <span className="text-gray-600"> ({correctCount} out of {totalQuestions} correct)</span>
          </p>
          <p className="text-md text-gray-600">
            Time Taken: <strong>{timeTaken} seconds</strong> | Average: <strong>{avgTime} sec/question</strong>
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${scorePercentage}%` }}
          ></div>
        </div>

        {/* Practice Status */}
        <div className="text-sm text-gray-500 italic">
          ✨ This is a practice session - results are not saved to your history
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
        
        {/* Review Answers */}
        <button
          onClick={onReview}
          className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
        >
          📖 Review Answers
        </button>

        {/* Practice Incorrect Again - Only show if there are incorrect answers */}
        {incorrectCount > 0 && (
          <button
            onClick={onRetestIncorrect}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105"
          >
            🔄 Practice {incorrectCount} Incorrect Again
          </button>
        )}

        {/* Perfect Score Message */}
        {incorrectCount === 0 && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-lg">
            🎉 Perfect! No questions to practice
          </div>
        )}

        {/* Back to Main Results */}
        <button
          onClick={onBackToOriginal}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
        >
          📊 Back to Main Results
        </button>

        {/* New Test */}
        <button
          onClick={goHome}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
        >
          🆕 Try New Test
        </button>
      </div>

      {/* Tips Section */}
      <div className="mt-8 max-w-2xl text-sm text-gray-600 bg-white rounded-lg p-4 shadow">
        <h3 className="font-semibold text-gray-800 mb-2">💡 Practice Tips:</h3>
        <ul className="text-left space-y-1">
          <li>• Focus on understanding why answers are correct</li>
          <li>• Use "Review Answers" to learn from mistakes</li>
          <li>• Keep practicing incorrect questions until you master them</li>
          <li>• Take breaks between practice sessions for better retention</li>
        </ul>
      </div>
    </div>
  );
}

export default PracticeResultScreen;