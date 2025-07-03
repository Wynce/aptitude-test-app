// ==============================
// 📊 scoreProcessor.js - Utility functions to analyze and interpret test results
// ==============================


// ==============================
// 🔍 getImprovementTips(answers)
// Returns a list of category-based improvement tips
// ==============================

export function getImprovementTips(answers) {
  const categoryStats = {};

  // 🧮 Tally correct and total answers per category
  answers.forEach((ans) => {
    const category = ans.category || "Unknown";

    if (!categoryStats[category]) {
      categoryStats[category] = { correct: 0, total: 0 };
    }

    categoryStats[category].total += 1;
    if (ans.correct) {
      categoryStats[category].correct += 1;
    }
  });

  // 💡 Generate tips based on accuracy
  const tips = [];

  Object.entries(categoryStats).forEach(([category, stats]) => {
    const { correct, total } = stats;
    const accuracy = (correct / total) * 100;

    if (accuracy >= 90) {
      tips.push(`${category}: Excellent work!`);
    } else if (accuracy >= 60) {
      tips.push(`${category}: Good, but review core concepts to strengthen.`);
    } else {
      tips.push(`${category}: Needs improvement. Focus on practice and understanding key ideas.`);
    }
  });

  return tips;
}


// ==============================
// 📉 analyzePerformance(questions, answers)
// Returns stats per category, weakest category, and list of incorrect questions
// ==============================

export function analyzePerformance(questions, answers) {
  const categoryStats = {};
  const incorrectQuestions = [];

  // 🧮 Calculate stats and collect incorrect questions
  answers.forEach((ans) => {
    const question = questions.find((q) => q.id === ans.questionId);
    const category = question?.category || "Unknown";

    if (!categoryStats[category]) {
      categoryStats[category] = { correct: 0, total: 0 };
    }

    categoryStats[category].total += 1;

    if (ans.correct) {
      categoryStats[category].correct += 1;
    } else {
      incorrectQuestions.push(question);
    }
  });

  // 📉 Determine weakest category
  let weakestCategory = null;
  let lowestAccuracy = 1;

  Object.entries(categoryStats).forEach(([category, stats]) => {
    const accuracy = stats.correct / stats.total;
    if (accuracy < lowestAccuracy) {
      lowestAccuracy = accuracy;
      weakestCategory = category;
    }
  });

  return {
    categoryStats,
    weakestCategory,
    incorrectQuestions,
  };
}
