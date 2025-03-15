import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, ArrowRight } from 'lucide-react';

const JackpotBanner: React.FC = () => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [jackpotAmount, setJackpotAmount] = useState(25000);
  
  // Calculate time until 8PM EST
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      
      // Convert current time to EST (UTC-5)
      const estTime = new Date(now.getTime() - (now.getTimezoneOffset() + 300) * 60000);
      const targetHour = 20; // 8PM in 24-hour format
      
      // Create target time at 8PM EST
      let targetTime = new Date(estTime);
      targetTime.setHours(targetHour, 0, 0, 0);
      
      // If it's already past 8PM EST, set target to 8PM tomorrow
      if (estTime.getHours() >= targetHour) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      // Convert back to local time for countdown
      const targetInLocalTime = new Date(targetTime.getTime() + (now.getTimezoneOffset() + 300) * 60000);
      
      // Calculate difference
      const diff = targetInLocalTime.getTime() - now.getTime();
      
      // Convert to hours, minutes, seconds
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining({
        hours,
        minutes,
        seconds
      });
    };
    
    // Initial calculation
    calculateTimeRemaining();
    
    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simulate growing jackpot
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAmount = Math.floor(Math.random() * 150);
      setJackpotAmount(prev => prev + randomAmount);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="border-b border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-primary">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm md:text-base font-medium">Daily Jackpot:</span>
            </div>
            <div className="text-white font-bold">
              {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ml-auto mr-4">
            <div className="flex items-center text-primary">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="text-sm md:text-base font-medium">Current Pot:</span>
            </div>
            <div className="text-white font-bold animate-pulse">
              {jackpotAmount.toLocaleString()} $DUEL
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/gambling')}
            className="btn-primary btn-sm py-1 flex items-center group"
          >
            Join Now
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JackpotBanner;
