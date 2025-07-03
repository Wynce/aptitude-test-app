#!/bin/bash

# Always run inside prompts directory
cd "$(dirname "$0")" || exit 1

# Difficulty levels
difficulties=("Easy" "Medium" "Hard")

# Define the actual root where industry folders live
bank_root="../questionBank"

# Traverse: questionBank/<Industry>/<Category>/<Difficulty>
for industry_path in "$bank_root"/*; do
  [ -d "$industry_path" ] || continue
  industry_name=$(basename "$industry_path")

  for category_path in "$industry_path"/*; do
    [ -d "$category_path" ] || continue
    category_name=$(basename "$category_path" | tr '[:upper:]' '[:lower:]')

    for difficulty in "${difficulties[@]}"; do
      difficulty_path="${category_path}/${difficulty}"
      if [ -d "$difficulty_path" ]; then
        difficulty_lower=$(echo "$difficulty" | tr '[:upper:]' '[:lower:]')
        filename="${category_name}-${difficulty_lower}-QB.json"

        # Output path: questionBank/<Industry>/<category-difficulty-QB.json>
        output_path="${industry_path}/${filename}"

        if [ -f "$output_path" ]; then
          echo "⚠️  Already exists: $output_path (skipped)"
        else
          echo "[]" > "$output_path"
          echo "✅ Created: $output_path"
        fi
      fi
    done
  done
done

echo "🎯 All flat questionbank files created inside: questionBank/<industry>/"
