import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchIssues, fetchHeatmapData } from '../utils/api';
import Spinner from '../components/Spinner';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

// ── Custom colored markers ────────────────────────────────────────────────────
const markerColors = { High: '#ef4444', Medium: '#f97316', Low: '#22c55e' };

function createColoredIcon(priority) {
  const color = markerColors[priority] || '#3b82f6';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path fill="${color}" stroke="white" stroke-width="1.5"
        d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z"/>
      <circle fill="white" cx="12" cy="12" r="5"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

// ── Heatmap Layer (using leaflet.heat via CDN) ────────────────────────────────
function HeatmapLayer({ points, active }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!active || !points.length) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // Load leaflet.heat dynamically
    if (!window.L.heatLayer) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
      script.onload = () => addHeat();
      document.head.appendChild(script);
    } else {
      addHeat();
    }

    function addHeat() {
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
      const data = points.map((p) => [p.lat, p.lng, p.intensity]);
      heatLayerRef.current = window.L.heatLayer(data, {
        radius: 35,
        blur: 20,
        maxZoom: 17,
        gradient: { 0.4: '#22c55e', 0.65: '#f97316', 1: '#ef4444' },
      }).addTo(map);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [active, points, map]);

  return null;
}

// ── Main MapPage ──────────────────────────────────────────────────────────────
export default function MapPage() {
  const [issues, setIssues] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [filterPriority, setFilterPriority] = useState('All');

  // Default map center — will shift if issues exist
  const defaultCenter = [19.076, 72.877];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [issuesData, heatData] = await Promise.all([
          fetchIssues(),
          fetchHeatmapData(),
        ]);
        setIssues(issuesData.issues || []);
        setHeatmapPoints(heatData.points || []);
      } catch {
        setError('Failed to load issues. Is the server running?');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredIssues = filterPriority === 'All'
    ? issues
    : issues.filter((i) => i.priority === filterPriority);

  const mapCenter = issues.length
    ? [issues[0].latitude, issues[0].longitude]
    : defaultCenter;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" text="Loading map data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center p-8 bg-red-50 rounded-2xl border border-red-200">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Controls Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="font-semibold text-slate-700">🗺️ Issue Map</span>
        <span className="text-sm text-slate-400">|</span>
        <span className="text-sm text-slate-500">{filteredIssues.length} issues shown</span>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-slate-500">Filter:</label>
          {['All', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
                filterPriority === p
                  ? p === 'High' ? 'bg-red-500 text-white border-red-500'
                    : p === 'Medium' ? 'bg-orange-500 text-white border-orange-500'
                    : p === 'Low' ? 'bg-green-500 text-white border-green-500'
                    : 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Heatmap Toggle */}
        <button
          onClick={() => setHeatmapActive((v) => !v)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
            heatmapActive
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
          }`}
        >
          🔥 Heatmap {heatmapActive ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-[999] bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3">
        <p className="text-xs font-semibold text-slate-500 mb-2">LEGEND</p>
        {[['High', '#ef4444'], ['Medium', '#f97316'], ['Low', '#22c55e']].map(([label, color]) => (
          <div key={label} className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
            <span className="text-xs text-slate-600">{label} Priority</span>
          </div>
        ))}
      </div>

      {/* Map */}
      {issues.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-slate-100">
          <div className="text-center p-8">
            <p className="text-4xl mb-3">📍</p>
            <p className="font-medium text-slate-600">No issues reported yet</p>
            <p className="text-sm text-slate-400 mt-1">Submit an issue to see it on the map</p>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <HeatmapLayer points={heatmapPoints} active={heatmapActive} />

            {filteredIssues.map((issue) => (
              <Marker
                key={issue._id}
                position={[issue.latitude, issue.longitude]}
                icon={createColoredIcon(issue.priority)}
              >
                <Popup maxWidth={280}>
                  <div className="p-1">
                    {issue.imageUrl && (
                      <img
                        src={issue.imageUrl}
                        alt="Issue"
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <p className="text-sm font-semibold text-slate-800 mb-2 leading-snug">
                      {issue.description}
                    </p>
                    <div className="flex gap-2 flex-wrap items-center">
                      <PriorityBadge priority={issue.priority} />
                      <StatusBadge status={issue.status} />
                      {(issue.reportCount || 1) > 1 && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          🔁 {issue.reportCount} reports
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
