// ==============================
// 📘 QuestionCard.js
// ==============================

import React, { useState, useEffect } from "react";

const QuestionCard = ({
  questionObj,
  currentIndex,
  total,
  onAnswer,
  onBack,
  timeLeft,
  selectedAnswer,
  onSelect,
}) => {
  const [localSelected, setLocalSelected] = useState("");

  useEffect(() => {
    setLocalSelected(selectedAnswer || "");
  }, [selectedAnswer]);

  const { question, options } = questionObj;

  // Convert options object to array of [key, value] pairs
  const safeOptions =
    typeof options === "object" && !Array.isArray(options)
      ? Object.entries(options)
      : [];

  const isLastQuestion = currentIndex + 1 === total;
  const isFirstQuestion = currentIndex === 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          Question {currentIndex + 1} of {total}
        </span>
        <span>
          ⏱️ Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </span>
      </div>

      <div className="text-lg font-semibold">{question}</div>

      <div className="space-y-2">
        {safeOptions.map(([key, value]) => (
          <label
            key={key}
            className={`flex items-center space-x-2 p-2 border rounded cursor-pointer ${
              localSelected === key ? "bg-blue-100" : ""
            }`}
          >
            <input
              type="radio"
              name={`option-${currentIndex}`}
              value={key}
              checked={localSelected === key}
              onChange={() => {
                setLocalSelected(key);
                if (onSelect) onSelect(key);
              }}
            />
            <span>{value}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        {!isFirstQuestion ? (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ⬅️ Back
          </button>
        ) : (
          <div /> // Empty div to maintain layout spacing
        )}
        <button
          onClick={() => onAnswer(localSelected)}
          disabled={!localSelected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-200"
        >
          {isLastQuestion ? "Submit ✅" : "Next ➡️"}
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
