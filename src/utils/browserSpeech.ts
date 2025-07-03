
let voicesInitialized = false;

export const initializeBrowserSpeech = (): Promise<void> => {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window && !voicesInitialized) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          voicesInitialized = true;
          console.log('Browser speech synthesis initialized');
          resolve();
        }
      };
      
      loadVoices();
      if (!voicesInitialized) {
        window.speechSynthesis.onvoiceschanged = () => {
          loadVoices();
        };
      } else {
        resolve();
      }
    } else {
      resolve();
    }
  });
};

export const speakWithBrowser = (text: string): void => {
  if (!('speechSynthesis' in window)) return;
  
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
};

export const stopBrowserSpeech = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
