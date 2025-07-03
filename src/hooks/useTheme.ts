
import { useState, useEffect } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  boardBackground: string;
  categoryHeader: string;
  questionItem: string;
  questionItemHover: string;
  text: string;
  buttonText: string;
}

const defaultTheme: ThemeColors = {
  primary: '#fa1e4e',
  secondary: '#1c1726',
  background: '#000000',
  boardBackground: '#374151',
  categoryHeader: '#1c1726',
  questionItem: '#fa1e4e',
  questionItemHover: '#4b0917',
  text: '#ffffff',
  buttonText: '#ffffff'
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

  const updateTheme = (newTheme: ThemeColors) => {
    setTheme(newTheme);
    localStorage.setItem('game_theme', JSON.stringify(newTheme));
    
    // Apply CSS custom properties for real-time theme changes
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', newTheme.primary);
    root.style.setProperty('--theme-secondary', newTheme.secondary);
    root.style.setProperty('--theme-background', newTheme.background);
    root.style.setProperty('--theme-board-background', newTheme.boardBackground);
    root.style.setProperty('--theme-category-header', newTheme.categoryHeader);
    root.style.setProperty('--theme-question-item', newTheme.questionItem);
    root.style.setProperty('--theme-question-item-hover', newTheme.questionItemHover);
    root.style.setProperty('--theme-text', newTheme.text);
    root.style.setProperty('--theme-button-text', newTheme.buttonText);
  };

  const resetTheme = () => {
    updateTheme(defaultTheme);
  };

  return {
    theme,
    updateTheme,
    resetTheme
  };
};
