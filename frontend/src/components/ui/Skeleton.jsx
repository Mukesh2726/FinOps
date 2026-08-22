export function Skeleton({ width = '100%', height = 20, radius = 8, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton height={16} width="60%" />
      <Skeleton height={32} width="80%" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <Skeleton key={i} height={12} width={`${70 - i * 10}%`} />
      ))}
    </div>
  );
}
