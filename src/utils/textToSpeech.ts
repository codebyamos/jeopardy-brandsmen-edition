
import { generateElevenLabsAudio, initializeElevenLabsApi } from './elevenLabsApi';
import { initializeBrowserSpeech, speakWithBrowser, stopBrowserSpeech } from './browserSpeech';
import { getCachedAudio } from './speechCache';

// Audio playback state
let currentAudio: HTMLAudioElement | null = null;
let isApiReady = false;
let apiInitPromise: Promise<void> | null = null;

// Voice settings helpers
const isVoiceEnabled = () => {
  return localStorage.getItem('voice_enabled') !== 'false';
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
  
  // Try to initialize ElevenLabs API
  const elevenLabsReady = await initializeElevenLabsApi();
  if (elevenLabsReady) {
    isApiReady = true;
  }
  
  // Initialize browser speech in parallel
  await initializeBrowserSpeech();
};

// Preload audio for faster playback
export const preloadAudio = async (text: string): Promise<string | null> => {
  if (!isVoiceEnabled()) return null;
  
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
    console.error('Preload error:', error);
    return null;
  }
};

export const speakWithElevenLabs = async (text: string): Promise<void> => {
  if (!isVoiceEnabled()) return;
  
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  if (!apiKey || !voiceId) {
    speakWithBrowser(text);
    return;
  }

  try {
    const audioUrl = await generateElevenLabsAudio(text, voiceId, apiKey, true);
    
    // Stop any current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    
    currentAudio = new Audio(audioUrl);
    
    // Set up event listeners
    currentAudio.onended = () => {
      currentAudio = null;
    };
    
    currentAudio.onerror = () => {
      console.error('Audio playback error');
      currentAudio = null;
    };
    
    // Start playing immediately
    await currentAudio.play();
    
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    speakWithBrowser(text);
  }
};

export const stopCurrentSpeech = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  stopBrowserSpeech();
};
