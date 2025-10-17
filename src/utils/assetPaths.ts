// Utility function to get the correct asset path based on environment
export const getAssetPath = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development, Vite serves from root
  // In production, we need to include the base path
  const base = import.meta.env.BASE_URL || '/';
  
  return `${base}${cleanPath}`;
};

// Pre-configured paths for common assets
export const ASSET_PATHS = {
  BACKGROUND_IMAGE: getAssetPath('uploads/d1647a56-db6d-4277-aeb4-395f4275273b.png'),
  PASSCODE_BACKGROUND: getAssetPath('uploads/08283c09-ba05-4fe0-87f1-64e2ce9da242.png'),
} as const;