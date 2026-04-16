import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchIssues, updateIssueStatus } from '../utils/api';
import Spinner from '../components/Spinner';

// ── Status flow ───────────────────────────────────────────────────────────────
const STATUS_FLOW = ['Pending', 'In Progress', 'Resolved'];

function nextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

// ── Priority helpers ──────────────────────────────────────────────────────────
const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

function priorityScore(issue) {
  return (issue.reportCount || 1) * (PRIORITY_WEIGHT[issue.priority] || 1);
}

// ── Category clustering from description keywords ─────────────────────────────
const CLUSTER_RULES = [
  { label: 'Road & Traffic',    icon: '🛣️',  keywords: ['road', 'pothole', 'street', 'traffic', 'sinkhole', 'pavement', 'footpath', 'accident'] },
  { label: 'Water & Drainage',  icon: '💧',  keywords: ['water', 'drain', 'sewage', 'flood', 'leakage', 'pipe', 'overflow', 'clogged', 'blocked'] },
  { label: 'Electricity',       icon: '⚡',  keywords: ['electricity', 'electrical', 'wire', 'light', 'streetlight', 'power', 'hazard', 'exposed'] },
  { label: 'Sanitation',        icon: '🗑️',  keywords: ['garbage', 'waste', 'litter', 'dump', 'debris', 'trash', 'sanitation'] },
  { label: 'Public Property',   icon: '🏗️',  keywords: ['broken', 'vandalism', 'graffiti', 'crack', 'collapse', 'overgrown', 'damage', 'wall'] },
];
const CLUSTER_OTHER = { label: 'Other Issues', icon: '📋' };

function getCluster(description = '') {
  const lower = description.toLowerCase();
  for (const cluster of CLUSTER_RULES) {
    if (cluster.keywords.some((kw) => lower.includes(kw))) return cluster;
  }
  return CLUSTER_OTHER;
}

// ── Priority Badge ────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = {
    High:   { cls: 'admin-badge--high',   label: '🔴 High' },
    Medium: { cls: 'admin-badge--medium', label: '🟠 Medium' },
    Low:    { cls: 'admin-badge--low',    label: '🟢 Low' },
  };
  const { cls, label } = map[priority] || map.Low;
  return <span className={`admin-badge ${cls}`}>{label}</span>;
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    'Pending':     { cls: 'admin-badge--pending',     label: '⏳ Pending' },
    'In Progress': { cls: 'admin-badge--inprogress',  label: '🔧 In Progress' },
    'Resolved':    { cls: 'admin-badge--resolved',    label: '✅ Resolved' },
  };
  const { cls, label } = map[status] || map['Pending'];
  return <span className={`admin-badge ${cls}`}>{label}</span>;
}

// ── Report Count Badge ────────────────────────────────────────────────────────
function ReportCountBadge({ count }) {
  const c = count || 1;
  const cls =
    c >= 5 ? 'admin-report-badge--critical' :
    c >= 2 ? 'admin-report-badge--hot' :
              'admin-report-badge--normal';
  return (
    <span className={`admin-report-badge ${cls}`}>
      {c >= 2 && <span className="admin-report-badge__pulse" />}
      🔁 {c} report{c !== 1 ? 's' : ''}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, variant }) {
  return (
    <div className={`admin-stat-card admin-stat-card--${variant}`}>
      <div className="admin-stat-card__icon">{icon}</div>
      <div className="admin-stat-card__value">{value}</div>
      <div className="admin-stat-card__label">{label}</div>
    </div>
  );
}

// ── Issue Card ────────────────────────────────────────────────────────────────
function IssueCard({ issue, onAdvance, isUpdating }) {
  const next = nextStatus(issue.status);
  const score = priorityScore(issue);

  return (
    <div className={`admin-issue-card admin-issue-card--${issue.priority?.toLowerCase()}`}>
      {/* Score pill */}
      <div className="admin-issue-card__score" title="Priority Score = Reports × Priority Weight">
        ⚖️ {score}
      </div>

      {/* Image */}
      <div className="admin-issue-card__img-wrap">
        <img
          src={issue.imageUrl}
          alt="Issue"
          className="admin-issue-card__img"
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="32">🏙️</text></svg>';
          }}
        />
      </div>

      {/* Body */}
      <div className="admin-issue-card__body">
        <p className="admin-issue-card__desc">{issue.description}</p>
        <p className="admin-issue-card__location">
          📍 {issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}
        </p>
        <p className="admin-issue-card__date">
          🗓️ {new Date(issue.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>

        {/* Badges row */}
        <div className="admin-issue-card__badges">
          <PriorityBadge priority={issue.priority} />
          <StatusBadge status={issue.status} />
          <ReportCountBadge count={issue.reportCount} />
        </div>

        {/* Action */}
        <div className="admin-issue-card__action">
          {next ? (
            <button
              className="admin-advance-btn"
              onClick={() => onAdvance(issue)}
              disabled={isUpdating}
            >
              {isUpdating ? <><Spinner size="sm" /> Updating…</> : `→ Mark ${next}`}
            </button>
          ) : (
            <span className="admin-completed-label">✅ Completed</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [search, setSearch]               = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus]   = useState('All');

  // ── Load issues ─────────────────────────────────────────────────────────────
  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterPriority !== 'All') params.priority = filterPriority;
      if (filterStatus !== 'All') params.status = filterStatus;
      const data = await fetchIssues(params);
      setIssues(data.issues || []);
    } catch {
      setError('Failed to load grievances from the server.');
    } finally {
      setLoading(false);
    }
  }, [search, filterPriority, filterStatus]);

  useEffect(() => {
    const t = setTimeout(loadIssues, 300);
    return () => clearTimeout(t);
  }, [loadIssues]);

  // ── Status advance ──────────────────────────────────────────────────────────
  const handleAdvance = async (issue) => {
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

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    unique:     issues.length,
    totalRpts:  issues.reduce((s, i) => s + (i.reportCount || 1), 0),
    pending:    issues.filter((i) => i.status === 'Pending').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    resolved:   issues.filter((i) => i.status === 'Resolved').length,
    high:       issues.filter((i) => i.priority === 'High').length,
  }), [issues]);

  // ── Sort: highest priority score first ──────────────────────────────────────
  const sorted = useMemo(() =>
    [...issues].sort((a, b) => priorityScore(b) - priorityScore(a)),
    [issues]
  );

  // ── Cluster sorted issues by category ───────────────────────────────────────
  const clusters = useMemo(() => {
    const map = new Map();
    for (const issue of sorted) {
      const cluster = getCluster(issue.description);
      if (!map.has(cluster.label)) map.set(cluster.label, { ...cluster, issues: [] });
      map.get(cluster.label).issues.push(issue);
    }
    return [...map.values()];
  }, [sorted]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="admin-root">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">🏛️ Admin Dashboard</h1>
          <p className="admin-header__sub">
            Grievance Management Portal · Issues sorted by Priority Score
          </p>
        </div>
        <button className="admin-refresh-btn" onClick={loadIssues} title="Refresh">
          🔄 Refresh
        </button>
      </div>

      {/* ── Stats Strip ──────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="admin-stats-strip">
          <StatCard icon="📋" label="Unique Issues"   value={stats.unique}     variant="blue" />
          <StatCard icon="🔁" label="Total Reports"   value={stats.totalRpts}  variant="purple" />
          <StatCard icon="⏳" label="Pending"         value={stats.pending}    variant="yellow" />
          <StatCard icon="🔧" label="In Progress"     value={stats.inProgress} variant="sky" />
          <StatCard icon="✅" label="Resolved"        value={stats.resolved}   variant="green" />
          <StatCard icon="🔴" label="High Priority"   value={stats.high}       variant="red" />
        </div>
      )}

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <div className="admin-filters">
        <div className="admin-filters__search-wrap">
          <span className="admin-filters__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search grievances…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-filters__search"
            id="admin-search-input"
          />
        </div>

        <label className="admin-filters__label">Priority</label>
        <select
          className="admin-filters__select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          id="admin-priority-filter"
        >
          {['All', 'High', 'Medium', 'Low'].map((v) => <option key={v}>{v}</option>)}
        </select>

        <label className="admin-filters__label">Status</label>
        <select
          className="admin-filters__select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          id="admin-status-filter"
        >
          {['All', 'Pending', 'In Progress', 'Resolved'].map((v) => <option key={v}>{v}</option>)}
        </select>

        <span className="admin-filters__count">
          {sorted.length} issue{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="admin-loading">
          <Spinner size="lg" text="Loading grievances…" />
        </div>
      ) : error ? (
        <div className="admin-error">
          <p className="admin-error__icon">⚠️</p>
          <p className="admin-error__msg">{error}</p>
          <button className="admin-advance-btn" onClick={loadIssues}>Try Again</button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty__icon">📭</p>
          <p className="admin-empty__title">No grievances found</p>
          <p className="admin-empty__sub">Adjust filters or wait for new reports</p>
        </div>
      ) : (
        <div className="admin-clusters">
          {clusters.map((cluster) => (
            <div key={cluster.label} className="admin-cluster">
              {/* Cluster header */}
              <div className="admin-cluster__header">
                <span className="admin-cluster__icon">{cluster.icon}</span>
                <span className="admin-cluster__label">{cluster.label}</span>
                <span className="admin-cluster__count">{cluster.issues.length}</span>
              </div>

              {/* Issue cards grid */}
              <div className="admin-cluster__grid">
                {cluster.issues.map((issue) => (
                  <IssueCard
                    key={issue._id}
                    issue={issue}
                    onAdvance={handleAdvance}
                    isUpdating={updatingId === issue._id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
