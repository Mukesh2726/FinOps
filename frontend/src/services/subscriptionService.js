import { DEFAULT_PLAN_ID, getPlan, SUBSCRIPTION_PLANS } from '../config/subscriptionPlans';

const STORAGE_KEY = 'finops.subscription';

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const createMockSubscription = (planId = DEFAULT_PLAN_ID) => {
  const startDate = new Date('2026-08-25T00:00:00.000Z');
  return {
    planId,
    status: 'active',
    startDate: startDate.toISOString(),
    renewalDate: addMonths(startDate, 1).toISOString(),
    active: true,
  };
};

const readSubscription = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : createMockSubscription();
  } catch {
    return createMockSubscription();
  }
};

const saveSubscription = (subscription) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
  return subscription;
};

const getUsage = (subscription) => ({
  companies: { used: 1, limit: getPlan(subscription.planId).access.companyLimit },
  users: { used: 3, limit: subscription.planId === 'starter' ? 1 : subscription.planId === 'growth' ? 10 : 'unlimited' },
  branches: { used: 1, limit: getPlan(subscription.planId).access.multipleBranches ? 'unlimited' : 1 },
  reports: { used: 2, limit: getPlan(subscription.planId).access.reports },
});

export const subscriptionService = {
  // Replace these methods with the matching FastAPI calls when the backend is ready.
  getSubscription: async () => readSubscription(),
  getPlans: async () => SUBSCRIPTION_PLANS,
  checkout: async (planId) => saveSubscription(createMockSubscription(planId)),
  changePlan: async (planId) => saveSubscription({ ...readSubscription(), planId, status: 'active', active: true }),
  cancel: async () => saveSubscription({ ...readSubscription(), status: 'cancelled', active: false }),
  getUsage: async () => getUsage(readSubscription()),
};
