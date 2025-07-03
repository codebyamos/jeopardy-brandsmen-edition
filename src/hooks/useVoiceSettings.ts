
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceSettings {
  apiKey: string;
  selectedVoice: string;
}

export const useVoiceSettings = () => {
  const [settings, setSettings] = useState<VoiceSettings>({
    apiKey: '',
    selectedVoice: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from both localStorage and database
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // First check localStorage for immediate access
      const localApiKey = localStorage.getItem('elevenlabs_api_key') || '';
      const localVoice = localStorage.getItem('selected_voice') || '';
      
      setSettings({
        apiKey: localApiKey,
        selectedVoice: localVoice
      });

      // Then check database for any updates
      const { data, error } = await supabase
        .from('voice_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading voice settings:', error);
      } else if (data) {
        // Update localStorage with database values if they exist
        if (data.api_key) {
          localStorage.setItem('elevenlabs_api_key', data.api_key);
        }
        if (data.selected_voice) {
          localStorage.setItem('selected_voice', data.selected_voice);
        }
        
        setSettings({
          apiKey: data.api_key || localApiKey,
          selectedVoice: data.selected_voice || localVoice
        });
      }
    } catch (error) {
      console.error('Error loading voice settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: VoiceSettings) => {
    try {
      setIsLoading(true);
      
      // Save to localStorage immediately for fast access
      localStorage.setItem('elevenlabs_api_key', newSettings.apiKey);
      localStorage.setItem('selected_voice', newSettings.selectedVoice);
      
      // Save to database
      const { error } = await supabase
        .from('voice_settings')
        .upsert({
          id: 1, // Single row for settings
          api_key: newSettings.apiKey,
          selected_voice: newSettings.selectedVoice,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving voice settings:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    saveSettings,
    isLoading
  };
};
