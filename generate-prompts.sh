#!/bin/bash

# Lists of options
industries=("Tech" "Finance" "Healthcare" "Education")
categories=("General" "Numerical" "Verbal" "Logical")
difficulties=("Easy" "Medium" "Hard")

# How many questions per prompt
total_questions=20

# Loop through all combinations
for industry in "${industries[@]}"; do
  for category in "${categories[@]}"; do
    for difficulty in "${difficulties[@]}"; do
      folder="questionbank/$industry/$category/$difficulty"
      mkdir -p "$folder"

      # Create placeholder questions.json
      echo "[]" > "$folder/questions.json"

      # Compose ID prefix
      id_prefix="${industry}_${category}_${difficulty}"

      # Create prompt.txt
      cat > "$folder/prompt.txt" <<EOF
Please generate ${total_questions} ${difficulty} level aptitude test questions for the ${industry} industry in the ${category} category.

Requirements:
- Format the result as a JSON array of ${total_questions} objects.
- Each object must have:
  - "id": a unique identifier (e.g. "${id_prefix}_Q001")
  - "question": the question text
  - "options": an object with keys "A", "B", "C", and "D" and their respective answer choices
  - "answer": the correct answer key (e.g., "A")
  - "explanation": a brief explanation of the correct answer
- Make the questions realistic and suitable for job seekers.
- Avoid duplicate or generic questions.
EOF

      # Echo summary
      echo "📝 Created prompt.txt for $industry / $category / $difficulty"
      echo "   → Requesting ${total_questions} questions"
      echo "   → Expected IDs: ${id_prefix}_Q001 to ${id_prefix}_Q$(printf "%03d" $total_questions)"
      echo ""
    done
  done
done

echo "✅ All prompt.txt files regenerated with ${total_questions} questions each."
