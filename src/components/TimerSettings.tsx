
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useTimerSettings } from '../hooks/useTimerSettings';

interface TimerSettingsProps {
  isVisible: boolean;
  onClose: () => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({ isVisible, onClose }) => {
  const { settings, updateSettings } = useTimerSettings();
  const [localTimerEnabled, setLocalTimerEnabled] = useState(settings.isTimerEnabled);
  const [localTimerDuration, setLocalTimerDuration] = useState(settings.timerDuration.toString());

  useEffect(() => {
    if (isVisible) {
      setLocalTimerEnabled(settings.isTimerEnabled);
      setLocalTimerDuration(settings.timerDuration.toString());
    }
  }, [isVisible, settings]);

  const handleSaveSettings = () => {
    const duration = parseInt(localTimerDuration);
    if (duration > 0) {
      updateSettings({
        isTimerEnabled: localTimerEnabled,
        timerDuration: duration
      });
      onClose();
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Timer Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="timer-enabled" className="text-white">
              Enable Question Timer
            </Label>
            <Switch
              id="timer-enabled"
              checked={localTimerEnabled}
              onCheckedChange={setLocalTimerEnabled}
            />
          </div>

          <div>
            <Label htmlFor="timer-duration" className="text-white">
              Timer Duration (seconds)
            </Label>
            <Input
              id="timer-duration"
              type="number"
              min="5"
              max="300"
              value={localTimerDuration}
              onChange={(e) => setLocalTimerDuration(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-sm text-gray-400 mt-1">
              Set how many seconds players have to answer each question (5-300 seconds)
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
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
