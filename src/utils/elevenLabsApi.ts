
import { getCachedAudio, setCachedAudio } from './speechCache';

export const generateElevenLabsAudio = async (
  text: string, 
  voiceId: string, 
  apiKey: string,
  fastMode = false
): Promise<string> => {
  // Validate inputs
  if (!text || !voiceId || !apiKey) {
    console.error('Missing required parameters:', { 
      hasText: !!text, 
      hasVoiceId: !!voiceId, 
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyStart: apiKey ? apiKey.substring(0, 8) + '...' : 'null'
    });
    throw new Error('Missing required parameters for ElevenLabs API');
  }

  // Check cache first
  const cachedUrl = getCachedAudio(text, voiceId);
  if (cachedUrl) {
    return cachedUrl;
  }

  console.log('Making ElevenLabs API request:', {
    voiceId,
    textLength: text.length,
    fastMode,
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey.length,
    domain: window.location.hostname
  });

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: fastMode ? "eleven_turbo_v2_5" : "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });

    console.log('ElevenLabs API response status:', response.status);

    if (!response.ok) {
      const responseText = await response.text();
      console.error('ElevenLabs API error response:', {
        status: response.status,
        statusText: response.statusText,
        responseText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.status === 401) {
        throw new Error('Invalid API key or unauthorized access');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded or quota depleted');
      } else if (response.status === 400) {
        throw new Error('Invalid request parameters');
      }
      throw new Error(`ElevenLabs API request failed with status ${response.status}: ${responseText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Cache for potential replay
    setCachedAudio(text, voiceId, audioUrl);
    
    console.log('ElevenLabs audio generated successfully');
    return audioUrl;
  } catch (error) {
    console.error('ElevenLabs API Error:', error);
    throw error;
  }
};

export const initializeElevenLabsApi = async (): Promise<boolean> => {
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  console.log('Initializing ElevenLabs API:', {
    hasApiKey: !!apiKey,
    hasVoiceId: !!voiceId,
    apiKeyLength: apiKey ? apiKey.length : 0,
    voiceId: voiceId,
    domain: window.location.hostname,
    localStorage: {
      apiKey: apiKey ? apiKey.substring(0, 8) + '...' : 'null',
      voiceId: voiceId
    }
  });

  if (!apiKey || !voiceId) {
    console.log('Missing ElevenLabs credentials');
    return false;
  }

  try {
    // Test API connection with a minimal request
    console.log('Testing ElevenLabs API connection...');
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: "Test",
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });

    console.log('ElevenLabs test response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (response.ok) {
      console.log('ElevenLabs API initialized successfully');
      
      // Preload the test audio
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setCachedAudio(`Test`, voiceId, audioUrl);
      return true;
    } else {
      const responseText = await response.text();
      console.error('ElevenLabs initialization failed:', {
        status: response.status,
        statusText: response.statusText,
        responseText
      });

      if (response.status === 401) {
        console.warn('ElevenLabs API key is invalid or expired');
      } else if (response.status === 429) {
        console.warn('ElevenLabs API quota exceeded');
      } else {
        console.warn(`ElevenLabs API initialization failed with status ${response.status}`);
      }
      return false;
    }
  } catch (error) {
    console.warn('ElevenLabs API not available:', error);
    return false;
  }
};
