const colors = { Pending: 'warning text-dark', Approved: 'success', Rejected: 'danger', Present: 'success', Late: 'warning text-dark', Absent: 'danger', Planned: 'secondary', Ongoing: 'primary', Completed: 'success' };

export default function StatusBadge({ value }) {
  return <span className={`badge bg-${colors[value] || 'secondary'}`}>{value}</span>;
}
