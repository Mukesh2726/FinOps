export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 999,
    priceLabel: '₹999',
    description: 'The essentials for a focused finance workflow.',
    features: ['1 company', 'Basic analytics', 'Sales graphs', 'P&L reports'],
    access: {
      companyLimit: 1,
      basicAnalytics: true,
      advancedAnalytics: false,
      salesGraphs: true,
      pnlReports: true,
      ebitda: false,
      grossMargin: false,
      reportDownloads: false,
      multipleUsers: false,
      multipleBranches: false,
      prioritySupport: false,
      apiAccess: false,
      reports: 1,
    },
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 2999,
    priceLabel: '₹2,999',
    description: 'More clarity and collaboration as your business grows.',
    recommended: true,
    features: ['Advanced analytics', 'EBITDA', 'Gross margin', 'Report downloads', 'Multiple users'],
    access: {
      companyLimit: 1,
      basicAnalytics: true,
      advancedAnalytics: true,
      salesGraphs: true,
      pnlReports: true,
      ebitda: true,
      grossMargin: true,
      reportDownloads: true,
      multipleUsers: true,
      multipleBranches: false,
      prioritySupport: false,
      apiAccess: false,
      reports: 10,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 7999,
    priceLabel: '₹7,999',
    description: 'Complete control for complex finance operations.',
    features: ['Unlimited reports', 'Multiple branches', 'Priority support', 'API access'],
    access: {
      companyLimit: 'unlimited',
      basicAnalytics: true,
      advancedAnalytics: true,
      salesGraphs: true,
      pnlReports: true,
      ebitda: true,
      grossMargin: true,
      reportDownloads: true,
      multipleUsers: true,
      multipleBranches: true,
      prioritySupport: true,
      apiAccess: true,
      reports: 'unlimited',
    },
  },
];

export const DEFAULT_PLAN_ID = 'growth';

export function getPlan(planId) {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || SUBSCRIPTION_PLANS[0];
}

export function formatUsage(value) {
  return value === 'unlimited' ? 'Unlimited' : value;
}
