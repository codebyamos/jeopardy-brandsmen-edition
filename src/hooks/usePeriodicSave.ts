
import { useEffect, useRef } from 'react';
import { Question, CategoryDescription, Player } from '../types/game';

interface UsePeriodicSaveProps {
  questions: Question[];
  categoryDescriptions: CategoryDescription[];
  players?: Player[];
  onSave: (questions: Question[], categoryDescriptions: CategoryDescription[], players?: Player[]) => Promise<void>;
  onClearLocal: () => void;
  intervalMinutes?: number;
  enabled?: boolean;
}

export const usePeriodicSave = ({
  questions,
  categoryDescriptions,
  players = [],
  onSave,
  onClearLocal,
  intervalMinutes = 20,
  enabled = true
}: UsePeriodicSaveProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const saveToDatabase = async () => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;
      const minInterval = intervalMinutes * 60 * 1000;

      if (timeSinceLastSave < minInterval) {
        console.log(`⏱️ Skipping periodic save - waiting for ${intervalMinutes} minutes`);
        return;
      }

      if (questions.length === 0) {
        console.log('📋 Skipping periodic save - no questions to save');
        return;
      }

      try {
        console.log(`🔄 Starting periodic database save (every ${intervalMinutes} minutes)...`);
        await onSave(questions, categoryDescriptions, players);
        lastSaveTimeRef.current = now;
        
        // Clear local storage after successful database save
        onClearLocal();
        console.log(`✅ Periodic save completed and local storage cleared at: ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('❌ Periodic database save failed (keeping local data safe):', error);
      }
    };

    // Check every 2 minutes but only save every intervalMinutes
    intervalRef.current = setInterval(saveToDatabase, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [questions, categoryDescriptions, players, onSave, onClearLocal, intervalMinutes, enabled]);

  const triggerManualSave = async () => {
    try {
      console.log('💾 Manual database save triggered');
      await onSave(questions, categoryDescriptions, players);
      lastSaveTimeRef.current = Date.now();
      onClearLocal();
      console.log('✅ Manual save completed and local storage cleared');
    } catch (error) {
      console.error('❌ Manual database save failed:', error);
      throw error;
    }
  };

  return { triggerManualSave };
};
