// ==============================
// 📦 loadQuestions.js - Fixed Version with loadAll support
// ==============================

import educationGeneralEasy from '../questionBank/Education/General/general-easy-QB.json';
import educationGeneralMedium from '../questionBank/Education/General/general-medium-QB.json';
import educationGeneralHard from '../questionBank/Education/General/general-hard-QB.json';

import educationLogicalEasy from '../questionBank/Education/Logical/logical-easy-QB.json';
import educationLogicalMedium from '../questionBank/Education/Logical/logical-medium-QB.json';
import educationLogicalHard from '../questionBank/Education/Logical/logical-hard-QB.json';

import educationNumericalEasy from '../questionBank/Education/Numerical/numerical-easy-QB.json';
import educationNumericalMedium from '../questionBank/Education/Numerical/numerical-medium-QB.json';
import educationNumericalHard from '../questionBank/Education/Numerical/numerical-hard-QB.json';

import educationVerbalEasy from '../questionBank/Education/Verbal/verbal-easy-QB.json';
import educationVerbalMedium from '../questionBank/Education/Verbal/verbal-medium-QB.json';
import educationVerbalHard from '../questionBank/Education/Verbal/verbal-hard-QB.json';

// 🗺️ Normalize category input to match keys in sourcesMap
const normalizeCategory = (cat) => {
  const map = {
    general: 'general',
    logical: 'logical',
    numerical: 'numerical',
    numerial: 'numerical', // typo fix
    verbal: 'verbal',
    mix: 'mixed',
    mixed: 'mixed',
  };
  return map[cat?.toLowerCase()] || '';
};

const sourcesMap = {
  education: {
    general: {
      easy: educationGeneralEasy,
      medium: educationGeneralMedium,
      hard: educationGeneralHard,
    },
    logical: {
      easy: educationLogicalEasy,
      medium: educationLogicalMedium,
      hard: educationLogicalHard,
    },
    numerical: {
      easy: educationNumericalEasy,
      medium: educationNumericalMedium,
      hard: educationNumericalHard,
    },
    verbal: {
      easy: educationVerbalEasy,
      medium: educationVerbalMedium,
      hard: educationVerbalHard,
    },
  },
};

/**
 * Filters and returns questions based on selection
 * @param {Object} params - Parameters object
 * @param {Array} params.selectedIndustries - Array of selected industries
 * @param {string} params.selectedCategory - Selected category
 * @param {string} params.selectedDifficulty - Selected difficulty
 * @param {boolean} params.loadAll - If true, returns all matching questions instead of just 10
 * @param {Array} params.specificIds - If provided, returns only questions with these IDs
 */
function loadQuestions({ 
  selectedIndustries, 
  selectedCategory, 
  selectedDifficulty, 
  loadAll = false,
  specificIds = null 
}) {
  const allMatchedQuestions = [];

  const normalizedCategory = normalizeCategory(selectedCategory);
  const difficultyKey = selectedDifficulty?.toLowerCase();
  const normalizedIndustries = selectedIndustries
    .map((industry) => industry?.toLowerCase())
    .filter((key) => key && sourcesMap[key]); // ✅ filter out empty or invalid industries

  normalizedIndustries.forEach((industryKey) => {
    if (normalizedCategory && normalizedCategory !== 'mixed') {
      const source = sourcesMap[industryKey]?.[normalizedCategory]?.[difficultyKey];
      if (Array.isArray(source)) {
        console.log(`📂 Loaded: ${industryKey}/${normalizedCategory}/${difficultyKey} → ${source.length} questions`);
        allMatchedQuestions.push(...source);
      } else {
        console.warn(`⚠️ Not found or not an array: ${industryKey}/${normalizedCategory}/${difficultyKey}`);
      }
    } else if (normalizedCategory === 'mixed') {
      Object.entries(sourcesMap[industryKey]).forEach(([catKey, catObj]) => {
        const source = catObj[difficultyKey];
        if (Array.isArray(source)) {
          console.log(`📂 Loaded: ${industryKey}/${catKey}/${difficultyKey} → ${source.length} questions`);
          allMatchedQuestions.push(...source);
        } else {
          console.warn(`⚠️ Not found or not an array: ${industryKey}/${catKey}/${difficultyKey}`);
        }
      });
    }
  });

  console.log("📦 Total matched questions:", allMatchedQuestions.length);

  // ✅ If specific IDs are requested, filter for those
  if (specificIds && Array.isArray(specificIds)) {
    const specificQuestions = allMatchedQuestions.filter(q => specificIds.includes(q.id));
    console.log(`🎯 Found ${specificQuestions.length} out of ${specificIds.length} specific questions`);
    return specificQuestions;
  }

  // ✅ If loadAll is true, return all questions
  if (loadAll) {
    console.log("🧠 Returning all questions:", allMatchedQuestions.length);
    return allMatchedQuestions;
  }

  // ✅ Default behavior: shuffle and return 10
  const shuffled = allMatchedQuestions.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 10);

  if (selected.length === 0) {
    console.warn("❌ No questions selected! Check filters or JSON file content.", {
      selectedIndustries,
      selectedCategory,
      selectedDifficulty,
    });
  } else {
    console.log("🧠 Selected Questions:", selected.map((q) => q.id));
  }

  return selected;
}

export default loadQuestions;