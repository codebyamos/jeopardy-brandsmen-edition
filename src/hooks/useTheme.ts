
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

  return {
    primary: primaryColor,
    secondary: secondaryColor,
    background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
    boardBackground: `linear-gradient(135deg, ${gradientStart}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, ${gradientEnd}${Math.round(opacity * 255).toString(16).padStart(2, '0')})`,
    categoryHeader: secondaryColor,
    questionItem: primaryColor,
    questionItemHover: darkenColor(primaryColor, 20),
    text: '#ffffff',
    buttonText: '#ffffff',
    accent: lightenColor(primaryColor, 20),
    muted: darkenColor(secondaryColor, 10)
  };
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeColors>(defaultTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('game_theme');
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme));
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const applyThemeToDOM = (themeColors: ThemeColors) => {
    const variations = generateThemeVariations(themeColors);
    const root = document.documentElement;
    
    // Apply CSS custom properties for real-time theme changes
    root.style.setProperty('--theme-primary', variations.primary);
    root.style.setProperty('--theme-secondary', variations.secondary);
    root.style.setProperty('--theme-background', variations.background);
    root.style.setProperty('--theme-board-background', variations.boardBackground);
    root.style.setProperty('--theme-category-header', variations.categoryHeader);
    root.style.setProperty('--theme-question-item', variations.questionItem);
    root.style.setProperty('--theme-question-item-hover', variations.questionItemHover);
    root.style.setProperty('--theme-text', variations.text);
    root.style.setProperty('--theme-button-text', variations.buttonText);
    root.style.setProperty('--theme-accent', variations.accent);
    root.style.setProperty('--theme-muted', variations.muted);
  };

  const updateTheme = (newTheme: ThemeColors) => {
    setTheme(newTheme);
    localStorage.setItem('game_theme', JSON.stringify(newTheme));
  };

  const previewTheme = (previewTheme: ThemeColors) => {
    applyThemeToDOM(previewTheme);
  };

  const resetTheme = () => {
    updateTheme(defaultTheme);
  };

  return {
    theme,
    updateTheme,
    previewTheme,
    resetTheme,
    generatePreview: generateThemeVariations
  };
};
