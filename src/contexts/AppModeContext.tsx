import { createContext, useContext, useEffect, useState } from 'react';

export type AppMode = 'quiet' | 'stimulating';

interface AppModeContextType {
  mode: AppMode;
  toggleMode: () => void;
}

const AppModeContext = createContext<AppModeContextType>({ mode: 'quiet', toggleMode: () => {} });

export const AppModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<AppMode>(() => {
    return (localStorage.getItem('appMode') as AppMode) || 'quiet';
  });

  useEffect(() => {
    localStorage.setItem('appMode', mode);
  }, [mode]);

  const toggleMode = () => setMode(m => (m === 'quiet' ? 'stimulating' : 'quiet'));

  return (
    <AppModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => useContext(AppModeContext);
