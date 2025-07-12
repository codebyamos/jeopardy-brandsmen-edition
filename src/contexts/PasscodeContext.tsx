
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

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
    const initializePasscode = async () => {
      try {
        // Fetch the current passcode from the database
        const { data, error } = await supabase
          .from('game_passcode')
          .select('passcode')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('Error fetching passcode:', error);
          // Use default passcode if there's an error
          setPasscodeState('1234');
        } else if (data) {
          setPasscodeState(data.passcode);
        }
      } catch (error) {
        console.error('Error initializing passcode:', error);
        setPasscodeState('1234');
      }

      // Check authentication status from localStorage
      const authStatus = localStorage.getItem('game_authenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
      
      // Check for new game refresh - in this case we need to restore authentication
      const hardResetFlag = sessionStorage.getItem('hard-reset-new-game');
      const tempPasscode = sessionStorage.getItem('temp-jeopardy-passcode');
      
      if (hardResetFlag === 'true' && tempPasscode) {
        console.log('🔑 Auto-authenticating after new game refresh');
        setIsAuthenticated(true);
        localStorage.setItem('game_authenticated', 'true');
      }
    };

    initializePasscode();
  }, []);

  const setPasscode = async (code: string) => {
    try {
      // Update the passcode in the database
      const { error } = await supabase
        .from('game_passcode')
        .update({ passcode: code })
        .eq('id', 1);

      if (error) {
        console.error('Error updating passcode:', error);
      } else {
        // Update local state only if database update was successful
        setPasscodeState(code);
      }
    } catch (error) {
      console.error('Error setting passcode:', error);
    }
  };

  const authenticate = (code: string) => {
    if (code === passcode) {
      setIsAuthenticated(true);
      localStorage.setItem('game_authenticated', 'true');
      // Also store the passcode in localStorage to preserve authentication during new game
      localStorage.setItem('jeopardy-passcode', code);
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
