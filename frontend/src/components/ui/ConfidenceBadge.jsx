import { useState } from 'react';
import { Brain } from 'lucide-react';

export default function ConfidenceBadge({ confidence, count }) {
  const [tip, setTip] = useState(false);
  const level = confidence >= 85 ? 'high' : confidence >= 60 ? 'med' : 'low';
  return (
    <span
      className={`conf-badge conf-badge--${level}`}
      onMouseEnter={() => setTip(true)}
      onMouseLeave={() => setTip(false)}
      style={{ position: 'relative', cursor: 'default' }}
    >
      <Brain size={11} />
      {confidence}%
      {tip && (
        <span className="conf-tooltip">
          AI categorized this based on {count || Math.floor(confidence * 2.5)} similar approved transactions.
        </span>
      )}
    </span>
  );
}
