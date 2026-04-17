/**
 * Reverse geocoding via OpenStreetMap Nominatim.
 *
 * Strategy (most specific → guaranteed-unique fallback):
 *  1. road + neighbourhood/suburb  →  "Market Road, Sector 25 West"
 *  2. road + district/city         →  "Sector 17 Road, Chandigarh"
 *  3. neighbourhood/suburb + district/city + SHORT COORDS
 *                                  →  "Sector 25 West, Ward 5 · 30.7319°N, 76.7751°E"
 *  4. display_name (3 segments)    →  "Sector 25, Ward 5, Chandigarh"
 *  5. raw coordinates              →  last resort
 *
 * Step 3 guarantees two locations 1 km apart in the same sector
 * always display different labels — even when OSM has no road data.
 */

const cache = new Map();

/**
 * Short coordinate suffix — 4 decimal places ≈ 11 m precision.
 * Enough to tell two locations apart at a glance.
 */
function coordSuffix(lat, lng) {
  const ns = lat  >= 0 ? 'N' : 'S';
  const ew = lng  >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${ns}, ${Math.abs(lng).toFixed(4)}°${ew}`;
}

export async function reverseGeocode(lat, lng) {
  // 5-decimal cache key ≈ 1 m — distinct for locations 1 km apart
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}` +
      `&format=json&addressdetails=1&zoom=18`;

    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'CivicAI/1.0' },
    });
    if (!res.ok) throw new Error('Nominatim error');

    const data = await res.json();
    const a    = data.address || {};

    const road         = a.road || a.pedestrian || a.footway || a.path || a.street || a.highway;
    const neighbourhood= a.neighbourhood || a.quarter || a.hamlet;
    const suburb       = a.suburb || a.village;
    const area         = neighbourhood || suburb;          // local area name
    const district     = a.city_district || a.county;
    const city         = a.town || a.city || a.state_district;
    const broader      = district || city;

    let label;

    if (road && area) {
      // Best case: street-level precision, no coords needed
      label = `${road}, ${area}`;
    } else if (road && broader) {
      label = `${road}, ${broader}`;
    } else if (area && broader) {
      // No road data — same area label for the whole sector.
      // Append coordinates so two locations 1 km apart are ALWAYS distinct.
      label = `${area}, ${broader} · ${coordSuffix(lat, lng)}`;
    } else if (area) {
      label = `${area} · ${coordSuffix(lat, lng)}`;
    } else {
      // Last resort: take up to 3 segments from Nominatim's display_name
      const segs = data.display_name?.split(',').map(s => s.trim()).filter(Boolean) || [];
      label = segs.slice(0, 3).join(', ') || coordSuffix(lat, lng);
    }

    cache.set(key, label);
    return label;
  } catch {
    const fallback = coordSuffix(lat, lng);
    cache.set(key, fallback);
    return fallback;
  }
}

