
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TimerSettings {
  timerDuration: number; // in seconds
}

export const useTimerSettings = () => {
  const [settings, setSettings] = useState<TimerSettings>({
    timerDuration: 30
  });

  // Load settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('timer_settings')
          .select('timer_duration')
          .eq('id', 1)
          .single();

        if (error) {
          console.warn('Failed to load timer settings from database:', error);
          // Fallback to localStorage for backwards compatibility
          const savedDuration = localStorage.getItem('timer_duration');
          if (savedDuration) {
            setSettings({ timerDuration: parseInt(savedDuration) || 30 });
          }
        } else if (data) {
          console.log('Timer settings loaded from database:', data.timer_duration);
          setSettings({ timerDuration: data.timer_duration });
        }
      } catch (error) {
        console.error('Error loading timer settings:', error);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: TimerSettings) => {
    setSettings(newSettings);
    
    try {
      // Save to database
      const { error } = await supabase
        .from('timer_settings')
        .update({ timer_duration: newSettings.timerDuration })
        .eq('id', 1);

      if (error) {
        console.error('Failed to save timer settings to database:', error);
        // Fallback to localStorage
        localStorage.setItem('timer_duration', newSettings.timerDuration.toString());
      } else {
        console.log('Timer settings saved to database:', newSettings);
        // Also save to localStorage as backup
        localStorage.setItem('timer_duration', newSettings.timerDuration.toString());
      }
    } catch (error) {
      console.error('Error saving timer settings:', error);
      // Fallback to localStorage
      localStorage.setItem('timer_duration', newSettings.timerDuration.toString());
    }
  };

  return {
    settings,
    updateSettings
  };
};
