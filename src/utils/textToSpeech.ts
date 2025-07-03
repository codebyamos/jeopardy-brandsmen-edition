
import { generateElevenLabsAudio, initializeElevenLabsApi } from './elevenLabsApi';
import { initializeBrowserSpeech, speakWithBrowser, stopBrowserSpeech } from './browserSpeech';
import { getCachedAudio } from './speechCache';

// Audio playback state
let currentAudio: HTMLAudioElement | null = null;
let isApiReady = false;
let apiInitPromise: Promise<void> | null = null;

// Callback for when speech completes
let onSpeechComplete: (() => void) | null = null;

// Voice settings helpers
const isVoiceEnabled = () => {
  const enabled = localStorage.getItem('voice_enabled') !== 'false';
  console.log('🔊 Voice enabled check:', enabled);
  return enabled;
};

const hasValidApiCredentials = () => {
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');
  
  console.log('🔍 Checking API credentials in textToSpeech:');
  console.log('🔑 Has API Key:', !!apiKey);
  console.log('🔑 API Key length:', apiKey ? apiKey.length : 0);
  console.log('🔑 API Key preview:', apiKey ? apiKey.substring(0, 10) + '...' : 'null');
  console.log('🎤 Has Voice ID:', !!voiceId);
  console.log('🎤 Voice ID:', voiceId);
  console.log('🌐 Domain:', window.location.hostname);
  
  const isValid = !!(apiKey && voiceId);
  console.log('✅ Credentials valid:', isValid);
  return isValid;
};

// Set callback for speech completion
export const setSpeechCompleteCallback = (callback: (() => void) | null) => {
  onSpeechComplete = callback;
};

// Pre-initialize the speech system
export const initializeSpeechSystem = async () => {
  if (!isVoiceEnabled()) {
    console.log('🔇 Voice disabled, skipping speech system initialization');
    return;
  }
  
  if (apiInitPromise) {
    console.log('⏳ API initialization already in progress');
    return apiInitPromise;
  }
  
  apiInitPromise = initializeApi();
  return apiInitPromise;
};

const initializeApi = async () => {
  if (isApiReady) {
    console.log('✅ API already initialized');
    return;
  }
  
  console.log('🎬 Starting API initialization...');
  
  // Only try to initialize ElevenLabs API if we have credentials
  if (hasValidApiCredentials()) {
    try {
      console.log('🚀 Attempting ElevenLabs API initialization...');
      const elevenLabsReady = await initializeElevenLabsApi();
      if (elevenLabsReady) {
        isApiReady = true;
        console.log('✅ ElevenLabs API initialized successfully');
      } else {
        console.log('❌ ElevenLabs API initialization failed, will use browser speech');
      }
    } catch (error) {
      console.warn('💥 ElevenLabs API initialization failed, will use browser speech:', error);
    }
  } else {
    console.log('⚠️ No ElevenLabs credentials found, using browser speech only');
  }
  
  // Initialize browser speech in parallel
  await initializeBrowserSpeech();
  console.log('🎉 Speech system initialization complete');
};

// Preload audio for faster playback
export const preloadAudio = async (text: string): Promise<string | null> => {
  if (!isVoiceEnabled() || !hasValidApiCredentials()) {
    console.log('⏭️ Skipping preload - voice disabled or no credentials');
    return null;
  }

  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  if (!apiKey || !voiceId) {
    console.log('⏭️ Skipping preload - missing credentials');
    return null;
  }

  // Check cache first
  const cachedUrl = getCachedAudio(text, voiceId);
  if (cachedUrl) {
    console.log('✅ Preload found cached audio');
    return cachedUrl;
  }

  try {
    console.log('🔄 Starting preload for text:', text.substring(0, 50) + '...');
    return await generateElevenLabsAudio(text, voiceId, apiKey, false);
  } catch (error) {
    console.warn('⚠️ Preload failed, will generate on demand or use browser speech:', error);
    return null;
  }
};

export const speakWithElevenLabs = async (text: string): Promise<void> => {
  if (!isVoiceEnabled()) {
    console.log('🔇 Voice disabled, skipping speech');
    return;
  }
  
  console.log('🎤 SPEAK WITH ELEVENLABS CALLED');
  console.log('📝 Text to speak:', text.substring(0, 100) + '...');
  
  // Check if we have valid credentials before attempting ElevenLabs
  if (!hasValidApiCredentials()) {
    console.log('❌ No valid ElevenLabs credentials, falling back to browser speech');
    speakWithBrowser(text);
    // Simulate completion callback for browser speech
    setTimeout(() => {
      if (onSpeechComplete) {
        onSpeechComplete();
      }
    }, text.length * 50); // Rough estimate based on text length
    return;
  }

  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  console.log('🔑 Retrieved credentials for speech:');
  console.log('🔑 API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'null');
  console.log('🎤 Voice ID:', voiceId);

  try {
    console.log('🚀 Calling generateElevenLabsAudio...');
    const audioUrl = await generateElevenLabsAudio(text, voiceId!, apiKey!, true);
    
    // Stop any current audio
    if (currentAudio) {
      console.log('⏹️ Stopping current audio');
      currentAudio.pause();
      currentAudio = null;
    }
    
    console.log('🎵 Creating new audio element');
    currentAudio = new Audio(audioUrl);
    
    // Return a promise that resolves when audio completes
    return new Promise<void>((resolve, reject) => {
      if (!currentAudio) {
        reject(new Error('Audio not created'));
        return;
      }

      currentAudio.onended = () => {
        console.log('✅ ElevenLabs audio playback completed');
        currentAudio = null;
        // Notify parent component that speech is complete
        if (onSpeechComplete) {
          onSpeechComplete();
        }
        resolve();
      };
      
      currentAudio.onerror = (error) => {
        console.error('❌ ElevenLabs audio playback error:', error);
        currentAudio = null;
        // Notify parent component that speech failed/stopped
        if (onSpeechComplete) {
          onSpeechComplete();
        }
        reject(error);
      };
      
      // Start playing
      console.log('▶️ Starting audio playback');
      currentAudio.play().then(() => {
        console.log('🎵 Audio playback started successfully');
      }).catch((error) => {
        console.error('❌ ElevenLabs audio play error:', error);
        currentAudio = null;
        if (onSpeechComplete) {
          onSpeechComplete();
        }
        reject(error);
      });
    });
    
  } catch (error) {
    console.warn('💥 ElevenLabs TTS failed, falling back to browser speech:', error);
    speakWithBrowser(text);
    // Simulate completion callback for browser speech fallback
    setTimeout(() => {
      if (onSpeechComplete) {
        onSpeechComplete();
      }
    }, text.length * 50); // Rough estimate based on text length
    throw error;
  }
};

export const stopCurrentSpeech = () => {
  console.log('⏹️ STOP CURRENT SPEECH CALLED');
  if (currentAudio) {
    console.log('⏹️ Stopping ElevenLabs audio');
    currentAudio.pause();
    currentAudio = null;
  }
  stopBrowserSpeech();
  
  // Always notify completion when stopping
  if (onSpeechComplete) {
    console.log('🔔 Notifying speech completion callback');
    onSpeechComplete();
  }
};
