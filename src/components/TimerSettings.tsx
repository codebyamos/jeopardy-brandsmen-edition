
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTimerSettings } from '../hooks/useTimerSettings';

interface TimerSettingsProps {
  isVisible: boolean;
  onClose: () => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({ isVisible, onClose }) => {
  const { settings, updateSettings } = useTimerSettings();
  const [localTimerDuration, setLocalTimerDuration] = useState(settings.timerDuration.toString());

  useEffect(() => {
    if (isVisible) {
      setLocalTimerDuration(settings.timerDuration.toString());
    }
  }, [isVisible, settings]);

  const handleSaveSettings = () => {
    const duration = parseInt(localTimerDuration);
    if (duration > 0) {
      updateSettings({
        timerDuration: duration
      });
      onClose();
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="bg-white border-2 text-gray-800 max-w-md" style={{ borderColor: '#2c5b69' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#2c5b69' }}>Timer Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="timer-duration" style={{ color: '#2c5b69' }}>
              Timer Duration (seconds)
            </Label>
            <Input
              id="timer-duration"
              type="number"
              min="5"
              max="300"
              value={localTimerDuration}
              onChange={(e) => setLocalTimerDuration(e.target.value)}
              className="bg-white border-2 text-gray-800"
              style={{ borderColor: '#2c5b69' }}
            />
            <p className="text-sm text-gray-600 mt-1">
              Set how many seconds players have to answer each question (5-300 seconds)
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#2c5b69', borderColor: '#2c5b69' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#2c5b69' }}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimerSettings;
