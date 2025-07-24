import React, { useEffect, useRef } from "react";
import { saveScoreToSupabase } from "../utils/saveScore";

export default function ResultSaverScreen({
  user,
  answers,
  firstName,
  category,
  industry,
  difficulty,
  setHasSavedScore,
  setCurrentScreen,
  score,
  correctCount,
  totalQuestions,
  sourceScreen,
  startTimestamp,
}) {
  const hasSaved = useRef(false); // ✅ Flag to prevent double saving
  const isProcessing = useRef(false); // ✅ Additional flag for async operations

  useEffect(() => {
    // ✅ Early return if already saved or processing
    if (hasSaved.current || isProcessing.current) {
      console.log("⚠️ Save already in progress or completed, skipping...");
      return;
    }

    console.log("🧭 Entered ResultSaverScreen");
    console.log("📊 Data received:", {
      user: !!user,
      answers: answers?.length,
      firstName,
      score,
      correctCount,
      totalQuestions,
      category,
      industry,
      difficulty,
      sourceScreen,
      startTimestamp
    });

    if (
      !user ||
      !Array.isArray(answers) || answers.length === 0 ||
      typeof firstName !== "string" || firstName.trim() === "" ||
      typeof score !== "number" ||
      typeof correctCount !== "number" ||
      typeof totalQuestions !== "number" ||
      !category ||
      !difficulty ||
      !industry
    ) {
      console.warn("⚠️ Incomplete or invalid data, not saving.");
      console.log("❌ Validation failed:", {
        hasUser: !!user,
        hasAnswers: Array.isArray(answers) && answers.length > 0,
        hasFirstName: typeof firstName === "string" && firstName.trim() !== "",
        hasScore: typeof score === "number",
        hasCorrectCount: typeof correctCount === "number", 
        hasTotalQuestions: typeof totalQuestions === "number",
        hasCategory: !!category,
        hasDifficulty: !!difficulty,
        hasIndustry: !!industry
      });
      setCurrentScreen("result");
      return;
    }

    // ✅ Set flags immediately to prevent duplicate saves
    hasSaved.current = true;
    isProcessing.current = true;

    const saveAndProceed = async () => {
      const endTimestamp = Date.now();
      const timeTakenSec = startTimestamp ? 
        Math.floor((endTimestamp - startTimestamp) / 1000) : 
        totalQuestions * 45;

      const payload = {
        user,
        answers,
        firstName,
        category,
        industry,
        difficulty,
        score,              // ✅ Pass the calculated score
        correctCount,       // ✅ Pass the calculated correctCount
        totalQuestions,     // ✅ Pass the calculated totalQuestions
        timeTakenSec,       // ✅ Pass calculated time
        sourceScreen,       // ✅ Pass sourceScreen
      };

      console.log("🧪 Saving with payload:", payload);

      try {
        const result = await saveScoreToSupabase(payload);
        
        if (result.success) {
          console.log("✅ Score saved successfully");
        } else {
          console.warn("⚠️ Failed to save score:", result.reason, result.error);
        }
      } catch (err) {
        console.error("❌ Error during save:", err.message);
      } finally {
        isProcessing.current = false; // ✅ Reset processing flag
        setHasSavedScore(true);
        setCurrentScreen("result");
      }
    };

    saveAndProceed();
  }, [
    user,
    answers,
    firstName,
    category,
    industry,
    difficulty,
    score,
    correctCount,
    totalQuestions,
    sourceScreen,
    startTimestamp,
    setHasSavedScore,
    setCurrentScreen,
  ]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center text-lg font-medium text-gray-600">
        Saving your results...
      </div>
    </div>
  );
}