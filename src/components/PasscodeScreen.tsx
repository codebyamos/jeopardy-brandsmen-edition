
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { usePasscode } from '../contexts/PasscodeContext';
import { useToast } from '../hooks/use-toast';

const PasscodeScreen: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const { authenticate } = usePasscode();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputCode.length !== 4) {
      toast({
        title: "Invalid Passcode",
        description: "Please enter a 4-digit passcode.",
        variant: "destructive",
      });
      return;
    }

    if (authenticate(inputCode)) {
      toast({
        title: "Access Granted",
        description: "Welcome to Jeopardy: Brandsmen Edition!",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect passcode. Please try again.",
        variant: "destructive",
      });
      setInputCode('');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/uploads/08283c09-ba05-4fe0-87f1-64e2ce9da242.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 w-full max-w-md border border-gray-200 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            JEOPARDY: BRANDSMEN EDITION
          </h1>
          <p className="text-gray-600">Enter the 4-digit passcode to access the game</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-digit passcode"
              className="text-center text-2xl tracking-widest bg-white border-gray-300 text-gray-800 placeholder:text-gray-500"
              maxLength={4}
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3"
          >
            Enter Game
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasscodeScreen;
