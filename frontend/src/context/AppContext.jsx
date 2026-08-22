import { useState, useEffect } from 'react';
import { authApi } from '../services/api/auth';
import { workspaceApi } from '../services/api/workspace';
import { transactionsApi } from '../services/api/transactions';
import { AppContext } from './contextValue';
import { getPlan } from '../config/subscriptionPlans';
import { subscriptionService } from '../services/subscriptionService';
import { isSupabaseConfigured } from '../services/supabase';

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const loadSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const current = await subscriptionService.getSubscription();
      setSubscription({ ...current, plan: getPlan(current.planId) });
      setUsage(await subscriptionService.getUsage());
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Listen to Supabase auth state
  useEffect(() => {
    loadSubscription();
    authApi.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email.split('@')[0] });
        loadWorkspace();
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = authApi.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email.split('@')[0] });
        loadWorkspace();
      } else {
        setUser(null);
        setCompany(null);
        setTransactions([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const selectPlan = async (planId) => {
    const next = await subscriptionService.checkout(planId);
    setSubscription({ ...next, plan: getPlan(next.planId) });
    setUsage(await subscriptionService.getUsage());
    return next;
  };

  const changePlan = async (planId) => {
    const next = await subscriptionService.changePlan(planId);
    setSubscription({ ...next, plan: getPlan(next.planId) });
    setUsage(await subscriptionService.getUsage());
    return next;
  };

  const cancelSubscription = async () => {
    const next = await subscriptionService.cancel();
    setSubscription({ ...next, plan: getPlan(next.planId) });
    return next;
  };

  const loadWorkspace = async () => {
    try {
      const data = await workspaceApi.get();
      if (data?.workspace) setCompany(data.workspace);
    } catch {
      // No workspace yet — user needs onboarding
    }
  };

  const login = async (email, password) => {
    const { error } = await authApi.signIn(email, password);
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const result = await authApi.signInWithGoogle();
    if (result.error) throw result.error;
    if (result.local && result.data?.user) {
      const signedInUser = result.data.user;
      setUser({ id: signedInUser.id, email: signedInUser.email, name: signedInUser.user_metadata.full_name });
    }
    return result;
  };

  const signup = async (email, password, name) => {
    const { error } = await authApi.signUp(email, password, name);
    if (error) throw error;
  };

  const logout = async () => {
    await authApi.signOut();
    setUser(null);
    setCompany(null);
    setTransactions([]);
  };

  const setupCompany = async (data) => {
    if (!isSupabaseConfigured) {
      const workspace = { id: 'local-workspace', ...data, created_at: new Date().toISOString() };
      setCompany(workspace);
      return { workspace };
    }
    const result = await workspaceApi.setup(data);
    setCompany(result.workspace);
    return result;
  };

  const loadTransactions = async (params) => {
    const data = await transactionsApi.list(params);
    setTransactions(data.transactions || []);
    return data;
  };

  const updateTransaction = async (id, changes) => {
    const data = await transactionsApi.update(id, changes);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data.transaction } : t));
    return data;
  };

  return (
    <AppContext.Provider value={{
      user, company, transactions, authLoading,
      login, loginWithGoogle, signup, logout, setupCompany,
      loadTransactions, updateTransaction, setTransactions,
      subscription, subscriptionLoading, usage, selectPlan, changePlan, cancelSubscription,
    }}>
      {children}
    </AppContext.Provider>
  );
}

