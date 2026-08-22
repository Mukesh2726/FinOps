import { useSubscription } from '../../hooks/useSubscription';
import UpgradePrompt from './UpgradePrompt';

export default function FeatureGate({ feature, featureName, children }) {
  const { hasFeature, currentPlan } = useSubscription();
  if (hasFeature(feature)) return children;

  return (
    <UpgradePrompt
      featureName={featureName || feature}
      planName={currentPlan?.id === 'starter' ? 'Growth' : 'Business'}
    />
  );
}
