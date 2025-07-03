
import { getCachedAudio, setCachedAudio } from './speechCache';

export const generateElevenLabsAudio = async (
  text: string, 
  voiceId: string, 
  apiKey: string,
  fastMode = false
): Promise<string> => {
  // Check cache first
  const cachedUrl = getCachedAudio(text, voiceId);
  if (cachedUrl) {
    return cachedUrl;
  }

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

  if (!response.ok) {
    throw new Error('ElevenLabs API request failed');
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  
  // Cache for potential replay
  setCachedAudio(text, voiceId, audioUrl);
  
  return audioUrl;
};

export const initializeElevenLabsApi = async (): Promise<boolean> => {
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  if (!apiKey || !voiceId) return false;

  try {
    // Test API connection with a minimal request
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

    if (response.ok) {
      console.log('ElevenLabs API initialized successfully');
      
      // Preload the test audio
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setCachedAudio(`Test`, voiceId, audioUrl);
      return true;
    }
  } catch (error) {
    console.log('ElevenLabs API not available');
  }
  
  return false;
};
