import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sword } from 'lucide-react';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 flex justify-center items-center overflow-hidden opacity-30">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full filter blur-3xl animate-pulse-slow absolute"></div>
        <div className="w-[600px] h-[600px] bg-accent/20 rounded-full filter blur-3xl animate-pulse-slow absolute -right-1/4 top-1/4"></div>
      </div>
      
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text content */}
          <div>
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Added line-height adjustment to ensure proper spacing */}
              <span className="animated-gradient-text duel-text">DUEL</span>{" "}
              your way<br/>
              <span>to </span> 
              <span className="animated-gradient-text victory-text inline-block leading-[1.2]">victory</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/80 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              The first Solana memecoin with real dueling utility. Stake your $DUEL tokens and challenge others in 1v1 battles or join the jackpot.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button 
                className="btn-primary text-lg px-8 py-4 font-bold"
                onClick={() => navigate('/arena')}
              >
                <Sword className="w-5 h-5 mr-2" />
                Enter Arena
              </button>
              <a 
                href="#about" 
                className="btn-outline text-lg px-8 py-4 font-bold"
              >
                Learn More
              </a>
            </motion.div>
          </div>
          
          {/* 3D Sword or Battle Illustration */}
          <motion.div 
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-primary/20 to-transparent rounded-full filter blur-2xl opacity-70 animate-pulse-slow"></div>
              
              {/* This would be replaced with an actual 3D sword model or better illustration */}
              <div className="relative aspect-square flex items-center justify-center animate-float">
                <div className="w-64 h-64 bg-gradient-to-br from-primary to-accent rounded-full opacity-90 flex items-center justify-center">
                  <Sword className="w-32 h-32 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
