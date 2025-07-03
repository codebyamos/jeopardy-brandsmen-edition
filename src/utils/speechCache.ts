
// Audio caching utilities
let preloadedAudioCache = new Map<string, string>();

export const getCachedAudio = (text: string, voiceId: string): string | null => {
  const cacheKey = `${text}_${voiceId}`;
  return preloadedAudioCache.get(cacheKey) || null;
};

export const setCachedAudio = (text: string, voiceId: string, audioUrl: string): void => {
  const cacheKey = `${text}_${voiceId}`;
  preloadedAudioCache.set(cacheKey, audioUrl);
};

export const clearAudioCache = (): void => {
  // Clean up old URLs to prevent memory leaks
  preloadedAudioCache.forEach(url => URL.revokeObjectURL(url));
  preloadedAudioCache.clear();
};
