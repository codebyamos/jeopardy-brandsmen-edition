
// Pre-initialize voices and API connection
let voicesInitialized = false;
let currentAudio: HTMLAudioElement | null = null;
let isApiReady = false;
let preloadedAudioCache = new Map<string, string>();

// Pre-initialize the speech system
export const initializeSpeechSystem = async () => {
  if (isApiReady) return;
  
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  if (apiKey && voiceId) {
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
          text: "Ready",
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
        isApiReady = true;
        console.log('ElevenLabs API initialized successfully');
      }
    } catch (error) {
      console.log('ElevenLabs API not available, will use browser speech');
    }
  }

  // Initialize browser speech synthesis
  if ('speechSynthesis' in window && !voicesInitialized) {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesInitialized = true;
        console.log('Browser speech synthesis initialized');
      }
    };
    
    loadVoices();
    if (!voicesInitialized) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }
};

// Preload audio for faster playback
export const preloadAudio = async (text: string): Promise<string | null> => {
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  if (!apiKey || !voiceId) return null;

  // Check cache first
  const cacheKey = `${text}_${voiceId}`;
  if (preloadedAudioCache.has(cacheKey)) {
    return preloadedAudioCache.get(cacheKey)!;
  }

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
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      preloadedAudioCache.set(cacheKey, audioUrl);
      return audioUrl;
    }
  } catch (error) {
    console.error('Preload error:', error);
  }

  return null;
};

export const speakWithElevenLabs = async (text: string): Promise<void> => {
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  const voiceId = localStorage.getItem('selected_voice');

  if (!apiKey || !voiceId) {
    // Fallback to browser speech synthesis
    speakWithBrowser(text);
    return;
  }

  try {
    // Check if we have preloaded audio
    const cacheKey = `${text}_${voiceId}`;
    let audioUrl = preloadedAudioCache.get(cacheKey);

    if (!audioUrl) {
      // Generate audio on demand
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
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
      audioUrl = URL.createObjectURL(audioBlob);
    }
    
    // Stop any current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    
    currentAudio = new Audio(audioUrl);
    
    currentAudio.onended = () => {
      if (!preloadedAudioCache.has(cacheKey)) {
        URL.revokeObjectURL(audioUrl!);
      }
      currentAudio = null;
    };
    
    currentAudio.onerror = () => {
      if (!preloadedAudioCache.has(cacheKey)) {
        URL.revokeObjectURL(audioUrl!);
      }
      currentAudio = null;
    };
    
    // Start playing immediately
    await currentAudio.play();
    
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    // Fallback to browser speech synthesis
    speakWithBrowser(text);
  }
};

const speakWithBrowser = (text: string): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = [
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Google US English Female'
    ];
    
    let selectedVoice = null;
    for (const preferredName of preferredVoices) {
      selectedVoice = voices.find(voice => 
        voice.name.toLowerCase() === preferredName.toLowerCase()
      );
      if (selectedVoice) break;
    }
    
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        !voice.name.toLowerCase().includes('male')
      );
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
};

export const stopCurrentSpeech = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
