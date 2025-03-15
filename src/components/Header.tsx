import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sword, Wallet, Clock, TrendingUp, ArrowRight } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 0, seconds: 0 });
  const [jackpotAmount, setJackpotAmount] = useState(25000);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Calculate time until next half-hour mark
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Calculate minutes and seconds until next 30-minute mark
      let minutesUntilNext;
      if (minutes < 30) {
        minutesUntilNext = 30 - minutes - 1;
      } else {
        minutesUntilNext = 60 - minutes - 1;
      }
      
      const secondsUntilNext = 60 - seconds;
      
      setTimeRemaining({
        minutes: minutesUntilNext,
        seconds: secondsUntilNext
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
    <div className="fixed top-0 left-0 w-full z-40 flex flex-col">
      {/* Main Header - reduced z-index to fix cursor issue */}
      <header className={`transition-all duration-300 ${
        isScrolled ? 'py-2 bg-background/90 backdrop-blur-md shadow-lg' : 'py-3 bg-background'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo - Left Side */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Sword className="w-7 h-7 text-primary mr-2" />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary">$</span>DUEL
            </span>
          </div>

          {/* Navigation Links - Center */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-4">
            <div className="flex items-center space-x-10">
              <a 
                href="/#about" 
                className="text-white/80 hover:text-primary transition-colors text-base font-medium"
              >
                About
              </a>
              <div 
                className={`cursor-pointer text-white/80 hover:text-primary transition-colors text-base font-medium ${
                  location.pathname === '/arena' ? 'text-primary' : ''
                }`}
                onClick={() => navigate('/arena')}
              >
                Arena
              </div>
            </div>
          </nav>

          {/* Connect Wallet - Right Side */}
          <div className="hidden md:block">
            <button className="btn-primary whitespace-nowrap">
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Jackpot Banner */}
      <div className="bg-gradient-to-r from-background-dark via-background to-background-dark border-b border-white/10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-primary">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-sm md:text-base font-medium">Next Jackpot:</span>
              </div>
              <div className="text-white font-bold">
                {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
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
              onClick={() => navigate('/arena')}
              className="btn-shine flex items-center group"
            >
              Join Now
              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden absolute w-full bg-background/95 backdrop-blur-md transition-all duration-300 ${
        isMobileMenuOpen ? 'max-h-[300px] py-4 opacity-100' : 'max-h-0 py-0 opacity-0 overflow-hidden'
      }`} style={{ top: '100%' }}>
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <a 
            href="/#about" 
            className="text-white/80 hover:text-primary transition-colors py-2"
          >
            About
          </a>
          <div 
            className={`cursor-pointer text-white/80 hover:text-primary transition-colors py-2 ${
              location.pathname === '/arena' ? 'text-primary' : ''
            }`}
            onClick={() => navigate('/arena')}
          >
            Arena
          </div>
          <button className="btn-primary w-full">
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
