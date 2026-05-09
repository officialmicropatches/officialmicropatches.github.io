// Grade computation is intentionally isolated here.
// To change the formula, edit only this file.

const GRADE_TO_NUM = { A: 4, B: 3, C: 2, D: 1, F: 0 };

const NUM_TO_GRADE = (avg) => {
  if (avg >= 3.5) return 'A';
  if (avg >= 2.5) return 'B';
  if (avg >= 1.5) return 'C';
  if (avg >= 0.5) return 'D';
  return 'F';
};

/**
 * Compute an overall letter grade from an array of letter grades.
 * @param {string[]} grades - Array of 'A'|'B'|'C'|'D'|'F' strings
 * @returns {string} - Overall grade letter
 */
function computeOverallGrade(grades) {
  if (!grades || grades.length === 0) return 'F';
  const nums = grades.map((g) => GRADE_TO_NUM[g] ?? 0);
  const avg = nums.reduce((sum, n) => sum + n, 0) / nums.length;
  return NUM_TO_GRADE(avg);
}

module.exports = { computeOverallGrade };
