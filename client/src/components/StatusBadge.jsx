const styles = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Resolved: 'bg-green-100 text-green-700 border-green-200',
};

const icons = { Pending: '⏳', 'In Progress': '🔧', Resolved: '✅' };

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
        styles[status] || styles.Pending
      }`}
    >
      {icons[status]} {status}
    </span>
  );
}
