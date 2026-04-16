/**
 * Priority Keywords Configuration
 */
const PRIORITY_KEYWORDS = {
  High: [
    'pothole',
    'water leakage',
    'open drain',
    'road damage',
    'flood',
    'collapse',
    'sewage',
    'broken pipe',
    'gas leak',
    'electrical hazard',
    'exposed wire',
    'sinkhole',
    'accident',
    'hazard',
  ],
  Medium: [
    'garbage',
    'streetlight',
    'graffiti',
    'broken',
    'litter',
    'debris',
    'crack',
    'overgrown',
    'vandalism',
    'blocked',
    'clogged',
  ],
};

/**
 * classifyPriority
 * Analyzes a description and returns a priority level.
 *
 * @param {string} description - Issue description text
 * @returns {'High' | 'Medium' | 'Low'} - Priority level
 */
function classifyPriority(description) {
  const lowerDesc = description.toLowerCase();

  // Check High priority keywords first
  for (const keyword of PRIORITY_KEYWORDS.High) {
    if (lowerDesc.includes(keyword.toLowerCase())) {
      return 'High';
    }
  }

  // Then check Medium priority keywords
  for (const keyword of PRIORITY_KEYWORDS.Medium) {
    if (lowerDesc.includes(keyword.toLowerCase())) {
      return 'Medium';
    }
  }

  return 'Low';
}

module.exports = { classifyPriority };
