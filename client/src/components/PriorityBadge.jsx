const styles = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-orange-100 text-orange-700 border-orange-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
};

const icons = { High: '🔴', Medium: '🟠', Low: '🟢' };

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
        styles[priority] || styles.Low
      }`}
    >
      {icons[priority]} {priority}
    </span>
  );
}
