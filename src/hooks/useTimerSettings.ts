
import { useState, useEffect } from 'react';

interface TimerSettings {
  timerDuration: number; // in seconds
}

export const useTimerSettings = () => {
  const [settings, setSettings] = useState<TimerSettings>({
    timerDuration: 30
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTimerDuration = localStorage.getItem('timer_duration');
    
    setSettings({
      timerDuration: savedTimerDuration ? parseInt(savedTimerDuration) : 30
    });
  }, []);

  const updateSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    localStorage.setItem('timer_duration', newSettings.timerDuration.toString());
  };

  return {
    settings,
    updateSettings
  };
};
