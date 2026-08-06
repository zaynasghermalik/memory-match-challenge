/**
 * Returns a new array with the elements of the input array shuffled.
 * Uses the Fisher-Yates (Durstenfeld) algorithm, which shuffles in place
 * with uniform distribution and O(n) performance.
 *
 * @param {Array} array - The array to shuffle (not mutated).
 * @returns {Array} A new shuffled array.
 */
export function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
