import { useState, useRef, useCallback } from 'react';
import { submitIssue } from '../utils/api';
import Spinner from '../components/Spinner';

const MAX_FILE_SIZE_MB = 10;

export default function UploadPage() {
  const [image, setImage] = useState(null);       // File object
  const [preview, setPreview] = useState(null);   // Object URL for preview
  const [location, setLocation] = useState(null); // { latitude, longitude }
  const [locationError, setLocationError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);     // submission result
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // ── Geolocation ────────────────────────────────────────────────────────────
  const captureLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        setLocationError('Unable to retrieve location. Please allow location access.');
      },
      { enableHighAccuracy: true }
    );
  };

  // ── Image Handling ─────────────────────────────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setError('');
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleFileInput = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!image) return setError('Please select an image.');
    if (!location) return setError('Please capture your location first.');

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', image);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);

      const data = await submitIssue(formData);
      setResult(data);
      clearImage();
      setLocation(null);
    } catch (err) {
      let msg = err.response?.data?.message || err.response?.data?.error || 'Submission failed. Please try again.';
      if (err.response?.data?.details) msg += ` (${err.response.data.details})`;
      // 409 no longer used — but keep for safety
      if (err.response?.status === 409) {
        setResult(err.response.data);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Reset after result ─────────────────────────────────────────────────────
  const handleReset = () => {
    setResult(null);
    setError('');
  };

  // ── Success screen (new unique issue) ─────────────────────────────────────
  if (result && !result.duplicate) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Issue Reported!</h2>
        <p className="text-slate-500 mb-4">{result.message}</p>
        <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2">
          <p className="text-sm"><span className="font-semibold text-slate-600">Description:</span> {result.issue?.description}</p>
          <p className="text-sm"><span className="font-semibold text-slate-600">Priority:</span> {result.issue?.priority}</p>
          <p className="text-sm"><span className="font-semibold text-slate-600">Status:</span> {result.issue?.status}</p>
          <p className="text-sm">
            <span className="font-semibold text-slate-600">Times Reported:</span>{' '}
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              🔁 {result.issue?.reportCount ?? 1}
            </span>
          </p>
        </div>
        <button
          onClick={handleReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Report Another Issue
        </button>
      </div>
    );
  }

  // ── Duplicate detected screen ──────────────────────────────────────────────
  if (result && result.duplicate) {
    const count = result.reportCount ?? 2;
    const original = result.originalIssue;
    return (
      <div className="max-w-lg mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Already Reported!</h2>
        <p className="text-slate-500 mb-1">{result.message}</p>
        <p className="text-slate-400 text-sm mb-5">Your report has been counted — this issue is now marked as reported by multiple people.</p>

        {/* Report count badge */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-full border border-amber-200">
            🔁 Reported <span className="text-lg">{count}</span> time{count !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Original issue info */}
        {original && (
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Original Issue</p>
            <p className="text-sm"><span className="font-semibold text-slate-600">Description:</span> {original.description}</p>
            <p className="text-sm"><span className="font-semibold text-slate-600">Priority:</span> {original.priority}</p>
            <p className="text-sm"><span className="font-semibold text-slate-600">Status:</span> {original.status}</p>
          </div>
        )}

        <button
          onClick={handleReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Report Another Issue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Report a Civic Issue</h1>
        <p className="text-slate-500">Upload a photo and our AI will analyze and categorize the problem automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* ── Image Upload Zone ── */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">📸 Upload Image</h2>

          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <p className="text-4xl mb-3">🖼️</p>
              <p className="font-medium text-slate-600">Drag & drop your image here</p>
              <p className="text-sm text-slate-400 mt-1">or click to browse — JPG, PNG, WebP up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow transition"
              >
                ✕
              </button>
              <p className="text-xs text-slate-400 mt-2 text-center">{image?.name}</p>
            </div>
          )}
        </div>

        {/* ── Location ── */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">📍 Your Location</h2>
          {location ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-green-700">Location captured ✓</p>
                <p className="text-xs text-green-500 mt-0.5">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLocation(null)}
                className="text-xs text-green-600 hover:text-red-500 transition"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={captureLocation}
              className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 text-center transition hover:bg-blue-50"
            >
              <p className="text-2xl mb-1">📡</p>
              <p className="font-medium text-slate-600">Click to capture GPS location</p>
              <p className="text-xs text-slate-400 mt-1">Allow location access when prompted</p>
            </button>
          )}
          {locationError && (
            <p className="text-red-500 text-sm mt-2">⚠️ {locationError}</p>
          )}
        </div>

        {/* ── AI Info Banner ── */}
        <div className="px-6 py-4 bg-blue-50 border-b border-slate-100">
          <p className="text-xs text-blue-600">
            🤖 <span className="font-semibold">AI-Powered:</span> Our system will automatically generate a description, detect duplicates, and classify priority upon submission.
          </p>
        </div>

        {/* ── Submit ── */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-200">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !image || !location}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              '🚀 Submit Issue Report'
            )}
          </button>

          {(!image || !location) && (
            <p className="text-xs text-slate-400 text-center mt-2">
              {!image && !location ? 'Add an image and location to continue' :
               !image ? 'Add an image to continue' : 'Capture location to continue'}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
