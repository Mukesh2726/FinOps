import { useContext } from 'react';
import { AppContext } from './contextValue';

export const useApp = () => useContext(AppContext);