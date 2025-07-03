// StartScreen.js

import React, { useState } from 'react';
import logo from '../assets/axcel-logo.png'; // adjust path if needed

const industriesList = ['Education']; // ['Tech', 'Finance', 'Healthcare', 'Education'] for future use
const categoriesList = ['Mixed', 'General', 'Numerical', 'Verbal', 'Logical'];
const difficultyLevels = ['Easy', 'Medium', 'Hard'];

const StartScreen = ({ onStart }) => {
  const [selectedIndustries, setSelectedIndustries] = useState(['Education']);
  const [selectedCategory, setSelectedCategory] = useState('Mixed');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');

  const handleIndustryChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedIndustries((prev) => [...prev, value]);
    } else {
      setSelectedIndustries((prev) => prev.filter((industry) => industry !== value));
    }
  };

  const handleStartTest = () => {
    const industry = selectedIndustries;
    const category = selectedCategory;
    const difficulty = selectedDifficulty;
  
    // Debug log to confirm values
    console.log('📋 Selected Values:', { industry, category, difficulty });
  
    if (
      industry.length === 0 ||
      !category ||
      !difficulty
    ) {
      alert('Please select Industry, Category, and Difficulty.');
      return;
    }
  
    // Pass structured object to App
    onStart({
      industries: industry,
      category,
      difficulty
    });
  };
  

  return (
    <div className="start-screen min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-16 sm:h-20" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-6">
          Aptitude Test
        </h1>

        {/* Industry Checkboxes */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">Select Industry</label>
          <div className="grid grid-cols-2 gap-2">
            {industriesList.map((industry) => (
              <label key={industry} className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  value={industry}
                  checked={selectedIndustries.includes(industry)}
                  onChange={handleIndustryChange}
                  className="mr-2 accent-blue-500"
                />
                {industry}
              </label>
            ))}
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">Select Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Category --</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Dropdown */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">Select Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Difficulty --</option>
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartTest}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Start Test
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
