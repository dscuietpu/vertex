const stringSimilarity = require('string-similarity');
const Issue = require('../models/Issue');

/**
 * calculateDistance
 * Haversine formula to compute distance (meters) between two GPS coordinates.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * checkDuplicate
 * Compares a new issue against existing DB issues using text similarity + proximity.
 * Returns the best matching issue (original, non-duplicate) if found.
 *
 * @param {string} newDescription - AI-generated description of the new issue
 * @param {number} latitude - Latitude of the new issue
 * @param {number} longitude - Longitude of the new issue
 * @returns {Promise<{ duplicate: boolean, matchedIssue: object|null }>}
 */
async function checkDuplicate(newDescription, latitude, longitude) {
  try {
    // Fetch all non-duplicate issues within a rough bounding box (~500m)
    const SEARCH_RADIUS_DEG = 0.005; // ~500m in degrees

    const nearbyIssues = await Issue.find({
      duplicateOf: null,
      latitude: { $gte: latitude - SEARCH_RADIUS_DEG, $lte: latitude + SEARCH_RADIUS_DEG },
      longitude: { $gte: longitude - SEARCH_RADIUS_DEG, $lte: longitude + SEARCH_RADIUS_DEG },
    });

    if (!nearbyIssues.length) {
      return { duplicate: false, matchedIssue: null };
    }

    const SIMILARITY_THRESHOLD = 0.65; // lowered for better detection
    const DISTANCE_THRESHOLD = 100;    // meters — expanded to 100m

    let bestMatch = null;
    let bestScore = 0;

    for (const issue of nearbyIssues) {
      const similarity = stringSimilarity.compareTwoStrings(
        newDescription.toLowerCase(),
        issue.description.toLowerCase()
      );

      const distance = calculateDistance(latitude, longitude, issue.latitude, issue.longitude);

      if (similarity >= SIMILARITY_THRESHOLD && distance <= DISTANCE_THRESHOLD) {
        const score = similarity * (1 - distance / DISTANCE_THRESHOLD);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = issue;
        }
      }
    }

    if (bestMatch) {
      console.log(
        `🔁 Duplicate detected! Best match: "${bestMatch.description.substring(0, 50)}..." ` +
        `(score: ${bestScore.toFixed(2)})`
      );
      return { duplicate: true, matchedIssue: bestMatch };
    }

    return { duplicate: false, matchedIssue: null };
  } catch (error) {
    console.error('❌ Duplicate check failed:', error.message);
    return { duplicate: false, matchedIssue: null };
  }
}

module.exports = { checkDuplicate, calculateDistance };
