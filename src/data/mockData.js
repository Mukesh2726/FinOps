export const BUSINESS_TYPES = [
  'Marketing Agency', 'Ecommerce Store', 'Freelancer', 'Consultancy', 'Retail Store',
];

export const PLANS = [
  { id: 'starter', name: 'Starter', price: '$9/mo', features: ['Up to 100 transactions', 'Basic reports', 'Email support'] },
  { id: 'growth', name: 'Growth', price: '$29/mo', features: ['Unlimited transactions', 'AI categorization', 'All reports', 'Priority support'] },
  { id: 'enterprise', name: 'Enterprise', price: '$99/mo', features: ['Everything in Growth', 'Multi-company', 'API access', 'Dedicated support'] },
];

export const CATEGORIES = [
  'Revenue', 'Office Expense', 'Marketing Expense', 'Software & Subscriptions',
  'Travel & Transport', 'Meals & Entertainment', 'Payroll', 'Rent & Utilities',
  'Cost of Goods Sold', 'Professional Services', 'Bank Charges', 'Miscellaneous',
];

export const generateMonthData = (month, year) => {
  const seed = month * 100 + year;
  const rand = (min, max) => Math.floor(((seed * 9301 + 49297) % 233280) / 233280 * (max - min) + min);
  const revenue = rand(45000, 120000);
  const expenses = rand(20000, 60000);
  return {
    revenue, expenses,
    netProfit: revenue - expenses,
    cashBalance: rand(30000, 80000),
    pendingTransactions: rand(3, 15),
    outstandingPayments: rand(5000, 25000),
    dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      revenue: rand(800, 5000),
      expenses: rand(400, 2500),
    })),
    expenseByCategory: [
      { name: 'Marketing', value: rand(3000, 12000) },
      { name: 'Payroll', value: rand(8000, 25000) },
      { name: 'Software', value: rand(1000, 4000) },
      { name: 'Rent', value: rand(2000, 6000) },
      { name: 'Travel', value: rand(500, 3000) },
      { name: 'Misc', value: rand(200, 1500) },
    ],
    topVendors: [
      { name: 'Google Ads', amount: rand(2000, 8000) },
      { name: 'Meta Ads', amount: rand(1500, 6000) },
      { name: 'AWS', amount: rand(500, 3000) },
      { name: 'Slack', amount: rand(200, 800) },
      { name: 'Notion', amount: rand(100, 400) },
    ],
    cashFlow: Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
      inflow: rand(30000, 90000),
      outflow: rand(15000, 50000),
    })),
  };
};

export const MOCK_TRANSACTIONS = [
  { id: 1, date: '2026-07-01', vendor: 'SWIGGY INSTAMART', amount: 1240, category: 'Office Expense', confidence: 98, status: 'pending', type: 'expense' },
  { id: 2, date: '2026-07-02', vendor: 'Meta Ads', amount: 15000, category: 'Marketing Expense', confidence: 99, status: 'approved', type: 'expense' },
  { id: 3, date: '2026-07-03', vendor: 'Client Payment - Acme Corp', amount: 85000, category: 'Revenue', confidence: 95, status: 'approved', type: 'income' },
  { id: 4, date: '2026-07-04', vendor: 'AWS', amount: 3200, category: 'Software & Subscriptions', confidence: 97, status: 'pending', type: 'expense' },
  { id: 5, date: '2026-07-05', vendor: 'Unknown Vendor XYZ', amount: 45000, category: 'Miscellaneous', confidence: 42, status: 'pending', type: 'expense' },
  { id: 6, date: '2026-07-06', vendor: 'Slack', amount: 850, category: 'Software & Subscriptions', confidence: 99, status: 'approved', type: 'expense' },
  { id: 7, date: '2026-07-07', vendor: 'Freelancer Payment', amount: 12000, category: 'Professional Services', confidence: 61, status: 'pending', type: 'expense' },
  { id: 8, date: '2026-07-08', vendor: 'Google Ads', amount: 22000, category: 'Marketing Expense', confidence: 99, status: 'approved', type: 'expense' },
];
