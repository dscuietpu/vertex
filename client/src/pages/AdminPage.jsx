import { useEffect, useState, useCallback } from 'react';
import { fetchIssues, updateIssueStatus } from '../utils/api';
import Spinner from '../components/Spinner';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

const STATUS_FLOW = ['Pending', 'In Progress', 'Resolved'];

function nextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

export default function AdminPage() {
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterPriority !== 'All') params.priority = filterPriority;
      if (filterStatus !== 'All') params.status = filterStatus;
      const data = await fetchIssues(params);
      setIssues(data.issues || []);
      setTotal(data.total || 0);
    } catch {
      setError('Failed to load issues.');
    } finally {
      setLoading(false);
    }
  }, [search, filterPriority, filterStatus]);

  useEffect(() => {
    const timeout = setTimeout(loadIssues, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [loadIssues]);

  const handleStatusUpdate = async (issue) => {
    const next = nextStatus(issue.status);
    if (!next) return;
    try {
      setUpdatingId(issue._id);
      await updateIssueStatus(issue._id, next);
      setIssues((prev) =>
        prev.map((i) => (i._id === issue._id ? { ...i, status: next } : i))
      );
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Stats summary ──────────────────────────────────────────────────────────
  const totalReports = issues.reduce((sum, i) => sum + (i.reportCount || 1), 0);
  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === 'Pending').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    resolved: issues.filter((i) => i.status === 'Resolved').length,
    high: issues.filter((i) => i.priority === 'High').length,
    totalReports,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Manage and resolve reported civic issues</p>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Unique Issues', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'Total Reports', value: stats.totalReports, color: 'bg-purple-50 text-purple-700 border-purple-100' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-50 text-green-700 border-green-100' },
            { label: 'High Priority', value: stats.high, color: 'bg-red-50 text-red-700 border-red-100' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {['All', 'High', 'Medium', 'Low'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {['All', 'Pending', 'In Progress', 'Resolved'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 ml-auto">{total} result{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" text="Loading issues..." />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-500">{error}</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-slate-600">No issues found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Image</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Reports</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((issue) => {
                  const next = nextStatus(issue.status);
                  const isUpdating = updatingId === issue._id;

                  return (
                    <tr key={issue._id} className="hover:bg-slate-50 transition-colors">
                      {/* Image */}
                      <td className="px-4 py-3">
                        <img
                          src={issue.imageUrl}
                          alt="Issue"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="%23f1f5f9" width="64" height="64"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="24">🏙️</text></svg>';
                          }}
                        />
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-slate-800 font-medium line-clamp-2 leading-snug">
                          {issue.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          📍 {issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}
                        </p>
                      </td>

                      {/* Report Count */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                            (issue.reportCount || 1) >= 5
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : (issue.reportCount || 1) >= 2
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          🔁 {issue.reportCount || 1}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <PriorityBadge priority={issue.priority} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={issue.status} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        {next ? (
                          <button
                            onClick={() => handleStatusUpdate(issue)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition whitespace-nowrap flex items-center gap-1"
                          >
                            {isUpdating ? (
                              <><Spinner size="sm" /> Updating...</>
                            ) : (
                              `→ ${next}`
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
