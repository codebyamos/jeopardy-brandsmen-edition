
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
  const lastSaveTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const saveData = async () => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;
      const minInterval = intervalMinutes * 60 * 1000;

      if (timeSinceLastSave < minInterval) {
        console.log('⏱️ Skipping periodic save - not enough time passed');
        return;
      }

      const currentData = JSON.stringify({ questions, categoryDescriptions });
      if (currentData === lastDataRef.current) {
        console.log('📋 Skipping periodic save - no data changes');
        return;
      }

      try {
        console.log('🔄 Starting periodic database save...');
        await onSave(questions, categoryDescriptions);
        lastDataRef.current = currentData;
        lastSaveTimeRef.current = now;
        console.log('✅ Periodic database save completed at:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('❌ Periodic database save failed (local data still safe):', error);
      }
    };

    // Check every 2 minutes but only save every intervalMinutes
    intervalRef.current = setInterval(saveData, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [questions, categoryDescriptions, onSave, intervalMinutes, enabled]);

  const triggerSave = async () => {
    try {
      console.log('💾 Manual periodic save triggered');
      await onSave(questions, categoryDescriptions);
      lastDataRef.current = JSON.stringify({ questions, categoryDescriptions });
      lastSaveTimeRef.current = Date.now();
    } catch (error) {
      console.error('❌ Manual periodic save failed:', error);
      throw error;
    }
  };

  return { triggerSave };
};
