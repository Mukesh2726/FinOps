import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const login = (email) => setUser({ email, name: email.split('@')[0] });
  const logout = () => { setUser(null); setCompany(null); };
  const setupCompany = (data) => setCompany(data);
  const updateTransaction = (id, changes) =>
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));

  return (
    <AppContext.Provider value={{ user, company, transactions, setTransactions, login, logout, setupCompany, updateTransaction }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
