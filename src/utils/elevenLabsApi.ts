
import { getCachedAudio, setCachedAudio } from './speechCache';

export const generateElevenLabsAudio = async (
  text: string, 
  voiceId: string, 
  apiKey: string,
  fastMode = false
): Promise<string> => {
  // More detailed input validation and logging
  console.log('🔥 ELEVENLABS API CALL STARTING');
  console.log('📝 Text length:', text?.length || 0);
  console.log('🎤 Voice ID:', voiceId);
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🔑 API Key length:', apiKey?.length || 0);
  console.log('🔑 API Key first 10 chars:', apiKey ? apiKey.substring(0, 10) + '...' : 'null');
  console.log('⚡ Fast mode:', fastMode);
  console.log('🌐 Current domain:', window.location.hostname);
  console.log('🌐 Current protocol:', window.location.protocol);

  if (!text || !voiceId || !apiKey) {
    console.error('❌ Missing required parameters:', { 
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
    console.log('✅ Using cached audio');
    return cachedUrl;
  }

  const requestUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const requestHeaders = {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': apiKey
  };
  const requestBody = {
    text: text,
    model_id: fastMode ? "eleven_turbo_v2_5" : "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.5,
      use_speaker_boost: true
    }
  };

  console.log('🚀 Making ElevenLabs API request:');
  console.log('📍 URL:', requestUrl);
  console.log('📋 Headers:', {
    'Accept': requestHeaders.Accept,
    'Content-Type': requestHeaders['Content-Type'],
    'xi-api-key': requestHeaders['xi-api-key'] ? requestHeaders['xi-api-key'].substring(0, 10) + '...' : 'missing'
  });
  console.log('📦 Body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    console.log('📡 ElevenLabs API response:');
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    console.log('📊 OK:', response.ok);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const responseText = await response.text();
      console.error('❌ ElevenLabs API error response:', {
        status: response.status,
        statusText: response.statusText,
        responseText,
        headers: Object.fromEntries(response.headers.entries()),
        requestUrl,
        requestHeaders: {
          ...requestHeaders,
          'xi-api-key': requestHeaders['xi-api-key'] ? requestHeaders['xi-api-key'].substring(0, 10) + '...' : 'missing'
        }
      });

      if (response.status === 401) {
        console.error('🚫 Authentication failed - API key issue');
        throw new Error('Invalid API key or unauthorized access');
      } else if (response.status === 429) {
        console.error('⏰ Rate limit exceeded');
        throw new Error('Rate limit exceeded or quota depleted');
      } else if (response.status === 400) {
        console.error('📝 Invalid request parameters');
        throw new Error('Invalid request parameters');
      }
      throw new Error(`ElevenLabs API request failed with status ${response.status}: ${responseText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Cache for potential replay
    setCachedAudio(text, voiceId, audioUrl);
    
    console.log('✅ ElevenLabs audio generated successfully');
    console.log('🎵 Audio URL created, length:', audioUrl.length);
    return audioUrl;
  } catch (error) {
    console.error('💥 ElevenLabs API Error Details:', {
      error: error.message,
      stack: error.stack,
      apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'missing',
      voiceId,
      textLength: text.length
    });
    throw error;
  }
};

export const initializeElevenLabsApi = async (): Promise<boolean> => {
  console.log('🎬 INITIALIZING ELEVENLABS API');
  
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  console.log('🔍 Checking stored credentials:');
  console.log('🔑 API Key from localStorage:', apiKey ? apiKey.substring(0, 10) + '...' : 'null');
  console.log('🎤 Voice ID from localStorage:', voiceId);
  console.log('🌐 Current domain:', window.location.hostname);
  console.log('🌐 localStorage available:', typeof(Storage) !== "undefined");

  if (!apiKey || !voiceId) {
    console.log('❌ Missing ElevenLabs credentials in localStorage');
    return false;
  }

  try {
    console.log('🧪 Testing ElevenLabs API connection...');
    const testResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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

    console.log('🧪 Test response details:');
    console.log('📊 Status:', testResponse.status);
    console.log('📊 Status Text:', testResponse.statusText);
    console.log('📊 OK:', testResponse.ok);

    if (testResponse.ok) {
      console.log('✅ ElevenLabs API initialized successfully');
      
      // Preload the test audio
      const audioBlob = await testResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setCachedAudio(`Test`, voiceId, audioUrl);
      return true;
    } else {
      const responseText = await testResponse.text();
      console.error('❌ ElevenLabs initialization failed:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        responseText,
        apiKey: apiKey.substring(0, 10) + '...',
        voiceId
      });

      if (testResponse.status === 401) {
        console.warn('🚫 ElevenLabs API key is invalid or expired');
      } else if (testResponse.status === 429) {
        console.warn('⏰ ElevenLabs API quota exceeded');
      } else {
        console.warn(`❓ ElevenLabs API initialization failed with status ${testResponse.status}`);
      }
      return false;
    }
  } catch (error) {
    console.warn('💥 ElevenLabs API initialization error:', {
      message: error.message,
      stack: error.stack,
      apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'missing'
    });
    return false;
  }
};
