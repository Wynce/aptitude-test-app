// ==============================
// 📄 ReviewScreen.js - View Answers After Test
// ==============================

import React from "react";

const ReviewScreen = ({ questions, answers, onBack }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-4">📋 Review Answers</h2>

      {questions.map((q, index) => {
        const userAnswer = answers.find((a) => a.questionId === q.id);

        return (
          <div key={q.id} className="border p-4 rounded shadow-sm bg-gray-50">
            <h3 className="font-medium">
              Q{index + 1}. {q.question}
            </h3>

            <div className="pl-4 mt-2 space-y-1">
              {Object.entries(q.options).map(([key, value]) => {
                const isSelected = key === userAnswer?.selected;
                const isCorrectOption = key === q.answer;

                const className = isCorrectOption
                  ? "text-green-600 font-medium"
                  : isSelected
                  ? "text-red-600"
                  : "text-gray-700";

                return (
                  <p key={key} className={className}>
                    {key}. {value} {isCorrectOption ? "✅" : isSelected ? "❌" : ""}
                  </p>
                );
              })}
            </div>

            {q.explanation && (
              <div className="mt-2 text-sm text-gray-600">
                💡 <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      <div className="text-center mt-6">
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          🔙 Back
        </button>
      </div>
    </div>
  );
};

export default ReviewScreen;
