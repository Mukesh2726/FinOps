import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api/auth';
import { profileApi, workspaceApi } from '../services/api/workspace';
import { transactionsApi } from '../services/api/transactions';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Supabase auth state
  useEffect(() => {
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
      login, signup, logout, setupCompany,
      loadTransactions, updateTransaction, setTransactions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
