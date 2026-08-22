export default function SubscriptionBadge({ status = 'active' }) {
  const label = status === 'active' ? 'Active' : 'Cancelled';
  return <span className={`badge ${status === 'active' ? 'badge-green' : 'badge-warn'}`}>{label}</span>;
}
