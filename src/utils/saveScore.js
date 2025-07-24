import { supabase } from '../supabaseClient';

export async function saveScoreToSupabase({ 
  user, 
  answers, 
  firstName, 
  category, 
  industry, 
  difficulty, 
  score,           // ✅ Accept pre-calculated score
  correctCount,    // ✅ Accept pre-calculated correctCount  
  totalQuestions,  // ✅ Accept pre-calculated totalQuestions
  timeTakenSec,    // ✅ Accept pre-calculated time
  sourceScreen     // ✅ Accept sourceScreen parameter
}) {
  if (!user?.id || !Array.isArray(answers) || answers.length === 0) {
    console.warn("⚠️ Incomplete data, not saving.");
    return { success: false, reason: "incomplete-data" };
  }

  const insertPayload = {
    user_id: user.id,
    user_email: user.email,
    first_name: firstName,
    score: score,                    // ✅ Use passed score
    category,
    difficulty,
    industry,
    correct_count: correctCount,     // ✅ Use passed correctCount
    total_questions: totalQuestions, // ✅ Use passed totalQuestions
    time_taken_sec: timeTakenSec,    // ✅ Use passed timeTakenSec
    source_screen: sourceScreen || "test", // ✅ Use passed sourceScreen
  };

  console.log("📦 Insert payload:", insertPayload);

  try {
    // ✅ Insert directly to test-results table with debug logging
    console.log("🔍 About to insert to test-results table");
    console.log("📊 Insert payload:", JSON.stringify(insertPayload, null, 2));
    
    const { error: insertError } = await supabase
      .from("test-results") // ✅ Correct table name
      .insert([insertPayload]);

    console.log("📤 Insert result - Error:", insertError);

    if (insertError) {
      console.error("❌ Insert failed:", insertError.message);
      console.error("❌ Full error object:", insertError);
      return { success: false, reason: "insert-error", error: insertError.message };
    }

    console.log(`✅ Score saved to Supabase: ${score}%`);
    return { success: true };
  } catch (err) {
    console.error("❌ Unexpected error during save:", err.message);
    return { success: false, reason: "unexpected", error: err.message };
  }
}