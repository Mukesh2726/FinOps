import { Lock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UpgradePrompt({ planName = 'Growth', featureName = 'This feature' }) {
  const navigate = useNavigate();
  return (
    <div className="upgrade-prompt">
      <div className="upgrade-prompt-icon"><Lock size={16} /></div>
      <div className="upgrade-prompt-copy">
        <strong>{featureName} is available on the {planName} plan.</strong>
        <span>Unlock more financial intelligence as your business grows.</span>
      </div>
      <div className="upgrade-prompt-actions">
        <button className="glow-btn glow-btn--primary glow-btn--sm" onClick={() => navigate('/pricing')}>
          Upgrade Now <ArrowUpRight size={14} />
        </button>
        <button className="glow-btn glow-btn--ghost glow-btn--sm" onClick={() => navigate('/pricing')}>View Plans</button>
      </div>
    </div>
  );
}
