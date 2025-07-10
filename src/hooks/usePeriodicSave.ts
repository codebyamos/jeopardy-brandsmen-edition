
import { useEffect, useRef } from 'react';
import { Question, CategoryDescription } from '../types/game';

interface UsePeriodicSaveProps {
  questions: Question[];
  categoryDescriptions: CategoryDescription[];
  onSave: (questions: Question[], categoryDescriptions: CategoryDescription[]) => Promise<void>;
  intervalMinutes?: number;
  enabled?: boolean;
}

export const usePeriodicSave = ({
  questions,
  categoryDescriptions,
  onSave,
  intervalMinutes = 15,
  enabled = true
}: UsePeriodicSaveProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const saveData = async () => {
      // Check if data has changed since last save
      const currentData = JSON.stringify({ questions, categoryDescriptions });
      if (currentData === lastDataRef.current) {
        return; // No changes, skip save
      }

      try {
        await onSave(questions, categoryDescriptions);
        lastDataRef.current = currentData;
        console.log('Periodic save completed at:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Periodic save failed:', error);
      }
    };

    // Set up interval
    intervalRef.current = setInterval(saveData, intervalMinutes * 60 * 1000);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [questions, categoryDescriptions, onSave, intervalMinutes, enabled]);

  // Manual trigger for immediate save
  const triggerSave = async () => {
    try {
      await onSave(questions, categoryDescriptions);
      lastDataRef.current = JSON.stringify({ questions, categoryDescriptions });
    } catch (error) {
      console.error('Manual save failed:', error);
      throw error;
    }
  };

  return { triggerSave };
};
