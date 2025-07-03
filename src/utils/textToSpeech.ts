
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
  return localStorage.getItem('voice_enabled') !== 'false';
};

const hasValidApiCredentials = () => {
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');
  return !!(apiKey && voiceId);
};

// Set callback for speech completion
export const setSpeechCompleteCallback = (callback: (() => void) | null) => {
  onSpeechComplete = callback;
};

// Pre-initialize the speech system
export const initializeSpeechSystem = async () => {
  if (!isVoiceEnabled()) return;
  
  if (apiInitPromise) {
    return apiInitPromise;
  }
  
  apiInitPromise = initializeApi();
  return apiInitPromise;
};

const initializeApi = async () => {
  if (isApiReady) return;
  
  // Only try to initialize ElevenLabs API if we have credentials
  if (hasValidApiCredentials()) {
    try {
      const elevenLabsReady = await initializeElevenLabsApi();
      if (elevenLabsReady) {
        isApiReady = true;
        console.log('ElevenLabs API initialized successfully');
      }
    } catch (error) {
      console.warn('ElevenLabs API initialization failed, will use browser speech:', error);
    }
  } else {
    console.log('No ElevenLabs credentials found, using browser speech only');
  }
  
  // Initialize browser speech in parallel
  await initializeBrowserSpeech();
};

// Preload audio for faster playback
export const preloadAudio = async (text: string): Promise<string | null> => {
  if (!isVoiceEnabled() || !hasValidApiCredentials()) return null;

  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  if (!apiKey || !voiceId) return null;

  // Check cache first
  const cachedUrl = getCachedAudio(text, voiceId);
  if (cachedUrl) {
    return cachedUrl;
  }

  try {
    return await generateElevenLabsAudio(text, voiceId, apiKey, false);
  } catch (error) {
    console.warn('Preload failed, will generate on demand or use browser speech:', error);
    return null;
  }
};

export const speakWithElevenLabs = async (text: string): Promise<void> => {
  if (!isVoiceEnabled()) return;
  
  // Check if we have valid credentials before attempting ElevenLabs
  if (!hasValidApiCredentials()) {
    console.log('No valid ElevenLabs credentials, falling back to browser speech');
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

  try {
    const audioUrl = await generateElevenLabsAudio(text, voiceId!, apiKey!, true);
    
    // Stop any current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    
    currentAudio = new Audio(audioUrl);
    
    // Return a promise that resolves when audio completes
    return new Promise<void>((resolve, reject) => {
      if (!currentAudio) {
        reject(new Error('Audio not created'));
        return;
      }

      currentAudio.onended = () => {
        console.log('ElevenLabs audio playback completed');
        currentAudio = null;
        // Notify parent component that speech is complete
        if (onSpeechComplete) {
          onSpeechComplete();
        }
        resolve();
      };
      
      currentAudio.onerror = (error) => {
        console.error('ElevenLabs audio playback error:', error);
        currentAudio = null;
        // Notify parent component that speech failed/stopped
        if (onSpeechComplete) {
          onSpeechComplete();
        }
        reject(error);
      };
      
      // Start playing
      currentAudio.play().catch((error) => {
        console.error('ElevenLabs audio play error:', error);
        currentAudio = null;
        if (onSpeechComplete) {
          onSpeechComplete();
        }
        reject(error);
      });
    });
    
  } catch (error) {
    console.warn('ElevenLabs TTS failed, falling back to browser speech:', error);
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
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  stopBrowserSpeech();
  
  // Always notify completion when stopping
  if (onSpeechComplete) {
    onSpeechComplete();
  }
};
