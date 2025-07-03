import { useState, useEffect } from 'react';

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  gradientStart: string;
  gradientEnd: string;
  opacity: number;
}

const defaultTheme: ThemeColors = {
  primaryColor: '#fa1e4e',
  secondaryColor: '#1c1726',
  gradientStart: '#000000',
  gradientEnd: '#374151',
  opacity: 0.8
};

// Brandsmen theme colors - updated for white grid items with dark green text
const brandsmenTheme: ThemeColors = {
  primaryColor: '#ffffff', // White for grid items
  secondaryColor: '#2C5F6F', // Dark teal for headers
  gradientStart: '#87CEEB',
  gradientEnd: '#4A90A4',
  opacity: 0.0 // 100% transparent background
};

// Auto-generate theme variations from primary colors
const generateThemeVariations = (theme: ThemeColors) => {
  const { primaryColor, secondaryColor, gradientStart, gradientEnd, opacity } = theme;
  
  // Create lighter and darker variations automatically
  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const darkenColor = (color: string, percent: number) => {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  };

  // Special handling for Brandsmen theme
  const isBrandsmenTheme = primaryColor === '#ffffff' && secondaryColor === '#2C5F6F';
  
  return {
    primary: primaryColor,
    secondary: secondaryColor,
    background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
    boardBackground: `linear-gradient(135deg, ${gradientStart}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, ${gradientEnd}${Math.round(opacity * 255).toString(16).padStart(2, '0')})`,
    categoryHeader: secondaryColor,
    categoryHeaderText: isBrandsmenTheme ? '#ffffff' : '#ffffff', // White text for both themes
    questionItem: primaryColor,
    questionItemHover: isBrandsmenTheme ? '#f0f0f0' : darkenColor(primaryColor, 20),
    text: isBrandsmenTheme ? '#2C5F6F' : '#ffffff', // Dark green text for Brandsmen theme
    buttonText: isBrandsmenTheme ? '#2C5F6F' : '#ffffff', // Dark green button text for Brandsmen theme
    whiteButtonText: '#2C5F6F', // Always dark green for white buttons
    accent: lightenColor(primaryColor === '#ffffff' ? secondaryColor : primaryColor, 20),
    muted: darkenColor(secondaryColor, 10)
  };
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeColors>(defaultTheme);
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  // Load theme and background from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('game_theme');
    const savedBackground = localStorage.getItem('game_background_image');
    
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme));
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
    
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Apply background image whenever it changes
  useEffect(() => {
    applyBackgroundImage(backgroundImage);
  }, [backgroundImage]);

  const applyThemeToDOM = (themeColors: ThemeColors) => {
    const variations = generateThemeVariations(themeColors);
    const root = document.documentElement;
    
    // Apply CSS custom properties for real-time theme changes
    root.style.setProperty('--theme-primary', variations.primary);
    root.style.setProperty('--theme-secondary', variations.secondary);
    root.style.setProperty('--theme-background', variations.background);
    root.style.setProperty('--theme-board-background', variations.boardBackground);
    root.style.setProperty('--theme-category-header', variations.categoryHeader);
    root.style.setProperty('--theme-category-header-text', variations.categoryHeaderText);
    root.style.setProperty('--theme-question-item', variations.questionItem);
    root.style.setProperty('--theme-question-item-hover', variations.questionItemHover);
    root.style.setProperty('--theme-text', variations.text);
    root.style.setProperty('--theme-button-text', variations.buttonText);
    root.style.setProperty('--theme-white-button-text', variations.whiteButtonText);
    root.style.setProperty('--theme-accent', variations.accent);
    root.style.setProperty('--theme-muted', variations.muted);
    root.style.setProperty('--theme-background-opacity', themeColors.opacity.toString());
  };

  const applyBackgroundImage = (imageUrl: string) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-background-image', imageUrl ? `url(${imageUrl})` : 'none');
    
    // Toggle body attribute based on background presence
    if (imageUrl) {
      document.body.removeAttribute('data-no-background');
    } else {
      document.body.setAttribute('data-no-background', 'true');
    }
  };

  const updateTheme = (newTheme: ThemeColors) => {
    setTheme(newTheme);
    localStorage.setItem('game_theme', JSON.stringify(newTheme));
  };

  const updateBackgroundImage = (imageUrl: string) => {
    setBackgroundImage(imageUrl);
    localStorage.setItem('game_background_image', imageUrl);
  };

  const previewTheme = (previewTheme: ThemeColors) => {
    applyThemeToDOM(previewTheme);
  };

  const resetTheme = () => {
    updateTheme(defaultTheme);
  };

  const applyBrandsmenTheme = () => {
    updateTheme(brandsmenTheme);
  };

  return {
    theme,
    backgroundImage,
    updateTheme,
    updateBackgroundImage,
    previewTheme,
    resetTheme,
    applyBrandsmenTheme,
    generatePreview: generateThemeVariations,
    brandsmenTheme
  };
};
