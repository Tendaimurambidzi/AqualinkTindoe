import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalMuteContextType {
  isGloballyMuted: boolean;
  toggleGlobalMute: () => void;
  setGlobalMute: (muted: boolean) => void;
}

const GlobalMuteContext = createContext<GlobalMuteContextType | undefined>(undefined);

export const useGlobalMute = () => {
  const context = useContext(GlobalMuteContext);
  if (!context) {
    throw new Error('useGlobalMute must be used within GlobalMuteProvider');
  }
  return context;
};

interface GlobalMuteProviderProps {
  children: ReactNode;
}

export const GlobalMuteProvider: React.FC<GlobalMuteProviderProps> = ({ children }) => {
  const [isGloballyMuted, setIsGloballyMuted] = useState(false);

  const toggleGlobalMute = () => {
    setIsGloballyMuted(prev => !prev);
  };

  const setGlobalMute = (muted: boolean) => {
    setIsGloballyMuted(muted);
  };

  return (
    <GlobalMuteContext.Provider value={{ isGloballyMuted, toggleGlobalMute, setGlobalMute }}>
      {children}
    </GlobalMuteContext.Provider>
  );
};

export default GlobalMuteProvider;
