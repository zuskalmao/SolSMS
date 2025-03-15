import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import JackpotSection from '../components/JackpotSection';
import DuelsSection from '../components/DuelsSection';
import { Zap, Sparkles } from 'lucide-react';
import gsap from 'gsap';

const GamblingPage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const embersContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // Create and animate the ember particles
  useEffect(() => {
    if (!embersContainerRef.current) return;
    
    // Create ember particles
    const createEmbers = () => {
      const emberCount = window.innerWidth < 768 ? 50 : 100;
      
      // Clear any existing embers
      while (embersContainerRef.current?.firstChild) {
        embersContainerRef.current.removeChild(embersContainerRef.current.firstChild);
      }
      
      // Create new ember elements
      for (let i = 0; i < emberCount; i++) {
        createEmber();
      }
    };
    
    const createEmber = () => {
      if (!embersContainerRef.current) return;
      
      // Create ember element
      const ember = document.createElement('div');
      ember.classList.add('ember');
      
      // Random properties
      const size = Math.random() * 6 + 2; // 2-8px
      const posX = Math.random() * 100; // 0-100%
      const delay = Math.random() * 10; // 0-10s
      const duration = Math.random() * 10 + 15; // 15-25s
      const type = Math.random() > 0.7 ? 'accent' : 'primary'; // 70% primary, 30% accent
      
      // Apply styles
      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;
      ember.style.left = `${posX}%`;
      ember.style.bottom = '-20px';
      ember.style.opacity = `${Math.random() * 0.5 + 0.1}`; // 0.1-0.6
      ember.style.animationDelay = `${delay}s`;
      ember.style.animationDuration = `${duration}s`;
      
      // Add color class
      ember.classList.add(type === 'accent' ? 'ember-accent' : 'ember-primary');
      
      // Add to container
      embersContainerRef.current.appendChild(ember);
      
      // Remove after animation completes
      setTimeout(() => {
        ember && ember.parentNode && ember.parentNode.removeChild(ember);
        // Create a new ember to replace this one
        createEmber();
      }, (delay + duration) * 1000);
    };
    
    // Initial creation
    createEmbers();
    
    // Handle window resize
    const handleResize = () => {
      createEmbers();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Title animation
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
      });
      
      // Continuous glow animation
      gsap.to(titleRef.current.querySelector('.title-glow'), {
        opacity: 0.6,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <motion.div
      ref={pageRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Modern, sleek background with animated gradients */}
      <div className="fixed inset-0 bg-background-dark overflow-hidden z-0">
        {/* Base gradient layer */}
        <div className="absolute inset-0 bg-gradient-radial from-background-dark to-background-dark/90 z-0"></div>
        
        {/* Subtle animated gradient orbs */}
        <div className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 rounded-full bg-gradient-radial from-primary/10 to-transparent blur-3xl animate-float-slow"></div>
        <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 rounded-full bg-gradient-radial from-accent/10 to-transparent blur-3xl animate-float-slow-reverse"></div>
        <div className="absolute left-1/2 top-1/4 w-1/3 h-1/3 rounded-full bg-gradient-radial from-yellow-500/5 to-transparent blur-3xl animate-float-slow-alt"></div>
        
        {/* Animated ember particles container */}
        <div 
          ref={embersContainerRef} 
          className="embers-container absolute inset-0 z-10 pointer-events-none overflow-hidden"
        ></div>
        
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.03] z-20"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 pt-16">
        {/* Elegant, modern hero section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4">
            {/* Main title with modern design and subtle animation */}
            <div className="max-w-4xl mx-auto text-center mb-20">
              <div className="inline-block relative">
                <h1 
                  ref={titleRef} 
                  className="text-6xl md:text-7xl font-bold relative z-10"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/80">The</span>
                  {" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent relative">
                    $DUEL Arena
                    <Sparkles className="absolute -top-6 -right-8 w-6 h-6 text-accent animate-twinkle" />
                  </span>
                  
                  {/* Subtle glow effect */}
                  <div className="title-glow absolute -inset-10 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full blur-2xl opacity-40 z-0"></div>
                </h1>
              </div>
              
              <p className="text-xl text-white/70 mt-6 max-w-2xl mx-auto">
                Welcome to the ultimate battleground. Stake your tokens, challenge opponents, 
                and compete for massive rewards.
              </p>
            </div>
            
            {/* Sleek feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Daily Jackpot Card */}
              <motion.div 
                className="feature-card rounded-2xl overflow-hidden relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/5 group-hover:opacity-90 transition-opacity duration-500 z-0"></div>
                <div className="relative z-10 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden h-full">
                  {/* Card Header */}
                  <div className="p-8 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -right-16 -bottom-16 w-32 h-32 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl"></div>
                    
                    <div className="flex items-center mb-4">
                      <div className="mr-4 rounded-full bg-primary/10 p-3">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Daily Jackpot</h2>
                    </div>
                    
                    <p className="text-white/70 mb-8">
                      Enter the daily 8PM EST jackpot draw with your $DUEL tokens. The more you stake, the higher your chances to win big.
                    </p>
                    
                    <motion.button 
                      className="btn-primary py-3 px-8 w-full relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => document.getElementById('jackpot')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <span className="relative z-10">Enter Today's Jackpot</span>
                    </motion.button>
                  </div>
                  
                  {/* Stat Bar */}
                  <div className="bg-black/30 backdrop-blur-md px-8 py-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white/60 text-sm">Current Pot</p>
                        <p className="text-white font-bold text-xl">98,712 $DUEL</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Next Draw</p>
                        <p className="text-white font-bold">8:00 PM EST</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* 1v1 Duels Card */}
              <motion.div 
                className="feature-card rounded-2xl overflow-hidden relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/5 group-hover:opacity-90 transition-opacity duration-500 z-0"></div>
                <div className="relative z-10 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden h-full">
                  {/* Card Header */}
                  <div className="p-8 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -right-16 -bottom-16 w-32 h-32 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 blur-2xl"></div>
                    
                    <div className="flex items-center mb-4">
                      <div className="mr-4 rounded-full bg-accent/10 p-3">
                        <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path>
                          <path d="M13 19l6-6"></path>
                          <path d="M16 16l4 4"></path>
                          <path d="M19 21l2-2"></path>
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">1v1 Duels</h2>
                    </div>
                    
                    <p className="text-white/70 mb-8">
                      Challenge opponents to one-on-one battles. Stake your tokens, prove your skill, and claim your rival's stake.
                    </p>
                    
                    <motion.button 
                      className="btn-primary py-3 px-8 w-full relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => document.getElementById('duels')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <span className="relative z-10">Find a Duel</span>
                    </motion.button>
                  </div>
                  
                  {/* Stat Bar */}
                  <div className="bg-black/30 backdrop-blur-md px-8 py-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white/60 text-sm">Active Duels</p>
                        <p className="text-white font-bold text-xl">24</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Total Staked</p>
                        <p className="text-white font-bold">45,600 $DUEL</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Content sections */}
        <JackpotSection />
        <DuelsSection />
      </div>
      
      {/* Styles for the ember animations and other effects */}
      <style jsx>{`
        /* Ember animations */
        @keyframes float-ember {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: var(--initial-opacity, 0.3);
          }
          20% {
            opacity: var(--initial-opacity, 0.3);
          }
          90%, 100% {
            transform: translateY(-100vh) rotate(var(--rotation, 720deg));
            opacity: 0;
          }
        }
        
        .ember {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: float-ember var(--duration, 20s) ease-out forwards;
          animation-delay: var(--delay, 0s);
          filter: blur(1px);
          --initial-opacity: 0.3;
          --rotation: 720deg;
        }
        
        .ember-primary {
          background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
          box-shadow: 0 0 10px 2px rgba(138, 43, 226, 0.3);
        }
        
        .ember-accent {
          background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
          box-shadow: 0 0 10px 2px rgba(255, 105, 180, 0.3);
        }
        
        /* Floating animations for background elements */
        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-5%, -5%);
          }
        }
        
        @keyframes float-slow-reverse {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(5%, 5%);
          }
        }
        
        @keyframes float-slow-alt {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(5%, -5%);
          }
        }
        
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        
        .animate-float-slow-reverse {
          animation: float-slow-reverse 20s ease-in-out infinite;
        }
        
        .animate-float-slow-alt {
          animation: float-slow-alt 17s ease-in-out infinite;
        }
        
        /* Noise texture */
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px 200px;
        }
        
        /* Twinkle animation for sparkles */
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default GamblingPage;
