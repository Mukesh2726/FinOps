import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

// Persist key names
const KEYS = { user: 'fo_user', company: 'fo_company', transactions: 'fo_txns', stmtPwd: 'fo_spwd' };

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => load(KEYS.user, null));
  const [company, setCompany] = useState(() => load(KEYS.company, null));
  const [transactions, setTransactionsState] = useState(() => load(KEYS.transactions, []));

  // Persist every change
  useEffect(() => { save(KEYS.user, user); }, [user]);
  useEffect(() => { save(KEYS.company, company); }, [company]);
  useEffect(() => { save(KEYS.transactions, transactions); }, [transactions]);

  const setTransactions = (txns) => setTransactionsState(txns);

  const login = (email, name) => setUser({ email, name: name || email.split('@')[0] });
  const logout = () => {
    setUser(null);
    setCompany(null);
    setTransactionsState([]);
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  };
  const setupCompany = (data) => setCompany(data);
  const updateTransaction = (id, changes) =>
    setTransactionsState(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));

  // Bank statement password — stored obfuscated, never returned to UI after save
  // Returns true if a stored password exists for this user
  const hasStatementPassword = () => {
    try {
      const stored = localStorage.getItem(KEYS.stmtPwd);
      if (!stored || !user) return false;
      const map = JSON.parse(stored);
      return !!map[user.email];
    } catch { return false; }
  };

  // Save password — stored as base64 keyed by user email, never exposed via context getter
  const saveStatementPassword = (pwd) => {
    try {
      const stored = localStorage.getItem(KEYS.stmtPwd);
      const map = stored ? JSON.parse(stored) : {};
      map[user.email] = btoa(unescape(encodeURIComponent(pwd)));
      localStorage.setItem(KEYS.stmtPwd, JSON.stringify(map));
    } catch {}
  };

  // Try stored password — returns true if it matches (simulated check), false if not found
  const tryStoredStatementPassword = () => {
    return hasStatementPassword();
  };

  return (
    <AppContext.Provider value={{
      user, company, transactions,
      setTransactions, login, logout, setupCompany, updateTransaction,
      hasStatementPassword, saveStatementPassword, tryStoredStatementPassword,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
