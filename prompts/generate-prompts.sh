#!/bin/bash

# Create prompt output folder
mkdir -p prompts

industries=("Tech" "Finance" "Healthcare" "Education")
categories=("General" "Logical" "Numerical" "Verbal")
difficulties=("Easy" "Medium" "Hard")

for industry in "${industries[@]}"; do
  for category in "${categories[@]}"; do
    for difficulty in "${difficulties[@]}"; do
      # Convert names to uppercase for ID
      upper_industry=$(echo "$industry" | tr '[:lower:]' '[:upper:]')
      upper_category=$(echo "$category" | tr '[:lower:]' '[:upper:]')
      short_diff=$(echo "$difficulty" | cut -c1 | tr '[:lower:]' '[:upper:]')

      filename="prompts/${industry}-${category}-${difficulty}.txt"

      cat > "$filename" <<EOF
You are generating aptitude test questions.

Industry: $industry  
Category: $category  
Difficulty: $difficulty  

Generate 10 multiple-choice questions for a job aptitude test. Each question should include:
- An id following this format: ${upper_industry}-${upper_category}-${short_diff}XX (e.g., TECH-LOGICAL-E01)
- The question text
- Four options
- One correct answer
- A short explanation
- type: "MCQ"

Output the result as a JSON array. Keep the tone suitable for professional use.
EOF

      echo "Prompt saved to $filename"
    done
  done
done
