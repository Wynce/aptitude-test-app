#!/bin/bash

# Array of difficulty folder names and corresponding lowercase filenames
difficulties=("Easy" "Medium" "Hard")

for industry in *; do
  [ -d "$industry" ] || continue
  for category in "$industry"/*; do
    [ -d "$category" ] || continue

    for difficulty in "${difficulties[@]}"; do
      lowercase=$(echo "$difficulty" | tr '[:upper:]' '[:lower:]')
      output_file="$category/${lowercase}-questionbank.json"

      if [ -f "$output_file" ]; then
        echo "⚠️  Already exists: $output_file (skipped)"
      else
        echo "[]" > "$output_file"
        echo "✅ Created: $output_file"
      fi
    done
  done
done

echo "🎯 All flat questionbank files created in each category."
