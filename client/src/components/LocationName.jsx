import { useState, useEffect, useRef } from 'react';
import { reverseGeocode } from '../utils/geocode';

/**
 * LocationName
 * Renders a human-readable place name resolved from GPS coordinates.
 * Shows a subtle loading shimmer while fetching, then fades in the name.
 *
 * Props:
 *  lat       {number}  – WGS-84 latitude
 *  lng       {number}  – WGS-84 longitude
 *  className {string}  – extra Tailwind classes (optional)
 *  prefix    {string}  – prefix string, e.g. "📍 " (optional)
 *  fallback  {string}  – text while loading (default: "Locating…")
 */
export default function LocationName({ lat, lng, className = '', prefix = '📍 ', fallback = 'Locating…' }) {
  const [label,   setLabel]   = useState(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
      setLabel('—');
      setLoading(false);
      return;
    }
    setLoading(true);
    reverseGeocode(lat, lng).then(name => {
      if (mounted.current) {
        setLabel(name);
        setLoading(false);
      }
    });
    return () => { mounted.current = false; };
  }, [lat, lng]);

  if (loading) {
    return (
      <span className={`inline-block animate-pulse bg-slate-200 rounded text-transparent text-xs select-none ${className}`}>
        {prefix}{fallback}
      </span>
    );
  }

  return (
    <span className={`transition-opacity duration-300 ${className}`}>
      {prefix}{label}
    </span>
  );
}
