// generateQuestionFolders.js

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'questionBank');

const industries = ['Tech', 'Finance', 'Healthcare', 'Education'];
const categories = ['General', 'Numerical', 'Logical', 'Verbal']; // Exclude 'Mixed'
const difficulties = ['Easy', 'Medium', 'Hard'];

industries.forEach((industry) => {
  const industryPath = path.join(baseDir, industry);
  fs.mkdirSync(industryPath, { recursive: true });

  categories.forEach((category) => {
    const categoryPath = path.join(industryPath, category);
    fs.mkdirSync(categoryPath, { recursive: true });

    difficulties.forEach((level) => {
      const filePath = path.join(categoryPath, `${level}.json`);
      const emptyData = [];
      fs.writeFileSync(filePath, JSON.stringify(emptyData, null, 2), 'utf8');
    });
  });
});

console.log('✅ Folder and file structure created in /questionBank');
