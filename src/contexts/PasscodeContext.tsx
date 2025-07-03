
import React, { createContext, useContext, useState, useEffect } from 'react';

interface PasscodeContextType {
  isAuthenticated: boolean;
  passcode: string;
  setPasscode: (code: string) => void;
  authenticate: (code: string) => boolean;
  logout: () => void;
}

const PasscodeContext = createContext<PasscodeContextType | undefined>(undefined);

export const PasscodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscodeState] = useState('1234'); // Default fallback

  useEffect(() => {
    const savedPasscode = localStorage.getItem('game_passcode');
    const authStatus = localStorage.getItem('game_authenticated');
    
    if (savedPasscode) {
      setPasscodeState(savedPasscode);
    } else {
      // Only set default if no passcode exists at all
      const defaultCode = '1234';
      setPasscodeState(defaultCode);
      localStorage.setItem('game_passcode', defaultCode);
    }
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const setPasscode = (code: string) => {
    setPasscodeState(code);
    localStorage.setItem('game_passcode', code);
  };

  const authenticate = (code: string) => {
    if (code === passcode) {
      setIsAuthenticated(true);
      localStorage.setItem('game_authenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('game_authenticated');
  };

  return (
    <PasscodeContext.Provider value={{
      isAuthenticated,
      passcode,
      setPasscode,
      authenticate,
      logout
    }}>
      {children}
    </PasscodeContext.Provider>
  );
};

export const usePasscode = () => {
  const context = useContext(PasscodeContext);
  if (context === undefined) {
    throw new Error('usePasscode must be used within a PasscodeProvider');
  }
  return context;
};
