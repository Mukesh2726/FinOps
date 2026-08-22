import { useApp } from '../context/useApp';

export function useSubscription() {
  const {
    subscription,
    subscriptionLoading,
    usage,
    selectPlan,
    changePlan,
    cancelSubscription,
  } = useApp();

  return {
    subscription,
    subscriptionLoading,
    usage,
    selectPlan,
    changePlan,
    cancelSubscription,
    isActive: Boolean(subscription?.active),
    currentPlan: subscription?.plan,
    hasFeature: (feature) => Boolean(subscription?.plan?.access?.[feature]),
  };
}
