// 📊 ResultScreen.js - Displays test summary and performance analysis

import React from 'react';

function ResultScreen({ questions, answers, onRetestIncorrect, onReview, goHome, category }) {
  // ==============================
  // 🧼 Deduplicate Answers
  // ==============================
  const dedupedAnswersMap = new Map();
  answers.forEach((ans) => {
    dedupedAnswersMap.set(ans.questionId, ans); // latest will overwrite
  });
  const dedupedAnswers = Array.from(dedupedAnswersMap.values());

  // ==============================
  // 🧮 Score Calculation
  // ==============================
  const totalQuestions = questions.length;
  const correctCount = dedupedAnswers.filter((ans) => ans.correct).length;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  let message = "";
  if (scorePercentage >= 90) message = "🎉 Congratulations!";
  else if (scorePercentage >= 70) message = "👏 Well done!";
  else if (scorePercentage >= 30) message = "👍 Keep practising!";
  else message = "💪 Don't give up!";

  // ==============================
  // ⏱️ Time Tracking (Placeholder)
  // ==============================
  const totalTimeAllowed = totalQuestions * 45; // assuming 45s per question
  const timeTaken = totalTimeAllowed; // replace with actual timer in real use
  const avgTimePerQuestion = Math.round(timeTaken / totalQuestions);

  // ==============================
  // 🎨 UI
  // ==============================
  return (
    <div className="text-center space-y-6">
      {/* 🔝 Home Button */}
      <div className="flex justify-end">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm" onClick={goHome}>
          🏠 Home
        </button>
      </div>

      {/* 🎯 Score */}
      <div>
        <h2 className="text-2xl font-bold text-blue-700">{message}</h2>
        <p className="text-lg mt-1">
          You scored <strong>{scorePercentage}%</strong> ({correctCount} out of {totalQuestions} correct)
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Time Taken: <strong>{timeTaken} seconds</strong> | Average: <strong>{avgTimePerQuestion} sec/question</strong>
        </p>
      </div>

      {/* 🔁 Actions */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          onClick={onReview}
        >
          Review Answers
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          onClick={onRetestIncorrect}
        >
          Retest Incorrect Questions
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Another Test
        </button>
      </div>
    </div>
  );
}

export default ResultScreen;
