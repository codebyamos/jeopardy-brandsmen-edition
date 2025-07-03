
import { useState, useEffect } from 'react';

interface TimerSettings {
  isTimerEnabled: boolean;
  timerDuration: number; // in seconds
}

export const useTimerSettings = () => {
  const [settings, setSettings] = useState<TimerSettings>({
    isTimerEnabled: false,
    timerDuration: 30
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTimerEnabled = localStorage.getItem('timer_enabled');
    const savedTimerDuration = localStorage.getItem('timer_duration');
    
    setSettings({
      isTimerEnabled: savedTimerEnabled === 'true',
      timerDuration: savedTimerDuration ? parseInt(savedTimerDuration) : 30
    });
  }, []);

  const updateSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    localStorage.setItem('timer_enabled', newSettings.isTimerEnabled.toString());
    localStorage.setItem('timer_duration', newSettings.timerDuration.toString());
  };

  return {
    settings,
    updateSettings
  };
};
