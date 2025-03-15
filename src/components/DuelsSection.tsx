import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Swords, User, Award, ArrowRight, Sparkles, Shield, Target, Flame } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DuelsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState('active');
  
  // Generate stable duel IDs
  const duelIds = useMemo(() => {
    return {
      duel1: Math.floor(1000 + Math.random() * 9000),
      duel2: Math.floor(1000 + Math.random() * 9000),
      duel3: Math.floor(1000 + Math.random() * 9000),
      duel4: Math.floor(1000 + Math.random() * 9000),
      duel5: Math.floor(1000 + Math.random() * 9000),
      duel6: Math.floor(1000 + Math.random() * 9000),
      duel7: Math.floor(1000 + Math.random() * 9000),
      duel8: Math.floor(1000 + Math.random() * 9000),
      duel9: Math.floor(1000 + Math.random() * 9000)
    };
  }, []);
  
  // Initialize animations once when component mounts
  useEffect(() => {
    // Preload any duel cards that might be shown initially to prevent loading issues
    const preloadCards = document.querySelectorAll('.duel-card');
    if (preloadCards.length > 0) {
      gsap.set(preloadCards, { opacity: 0, y: 40 });
    }

    // Set up animations with delay to ensure DOM is ready
    const setupAnimations = () => {
      if (titleRef.current && tabsRef.current && contentRef.current) {
        ScrollTrigger.refresh();
        
        gsap.to(titleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });
        
        gsap.to(tabsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });
        
        gsap.to(".duel-card", {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 90%",
            toggleActions: "play none none none"
          }
        });
      }
    };

    // Allow time for DOM to render properly
    const timeoutId = setTimeout(setupAnimations, 100);
    
    return () => {
      clearTimeout(timeoutId);
      // Clean up any ScrollTrigger instances to prevent memory leaks
      ScrollTrigger.getAll().forEach(trigger => trigger.kill(false));
    };
  }, []);
  
  return (
    <section id="duels" ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden">
      {/* Static swords background with fixed positioning */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <Swords className="absolute text-white/[0.015] w-48 h-48 top-20 left-10 rotate-12" />
        <Swords className="absolute text-white/[0.02] w-32 h-32 bottom-40 right-20 -rotate-15" />
        <Swords className="absolute text-white/[0.01] w-40 h-40 top-1/3 right-1/4 rotate-45" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          ref={titleRef} 
          className="text-center max-w-4xl mx-auto mb-16"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          {/* Simplified, cleaner title */}
          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="relative inline-block mr-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">1v1</span>
            </span>
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/80">DUELS</span>
              <Sparkles className="absolute -top-2 -right-4 w-4 h-4 text-accent/80" />
            </span>
          </h2>
          
          {/* Animated Line Under Title */}
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6 rounded-full"></div>
          
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Challenge other $DUEL holders to epic one-on-one battles. Stake your tokens and fight for glory and rewards!
          </p>
        </div>
        
        <div 
          ref={tabsRef} 
          className="flex justify-center mb-12"
          style={{ opacity: 0, transform: 'translateY(20px)' }}
        >
          <div className="backdrop-blur-md rounded-full p-1 inline-flex border border-white/10">
            <button 
              className={`px-6 py-2 rounded-full transition-all ${
                selectedTab === 'active' 
                  ? 'bg-primary text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
              onClick={() => setSelectedTab('active')}
            >
              Active Duels
            </button>
            <button 
              className={`px-6 py-2 rounded-full transition-all ${
                selectedTab === 'completed' 
                  ? 'bg-primary text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
              onClick={() => setSelectedTab('completed')}
            >
              Completed
            </button>
            <button 
              className={`px-6 py-2 rounded-full transition-all ${
                selectedTab === 'my' 
                  ? 'bg-primary text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
              onClick={() => setSelectedTab('my')}
            >
              My Duels
            </button>
          </div>
        </div>
        
        <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedTab === 'active' && (
            <>
              <DuelCard 
                duelId={duelIds.duel1}
                player1="CryptoKing"
                player2="WaitingForOpponent"
                amount={500}
                timeRemaining="Wait for opponent"
                status="open"
              />
              <DuelCard 
                duelId={duelIds.duel2}
                player1="SolWarrior"
                player2="MoonShot"
                amount={1200}
                timeRemaining="03:45"
                status="active"
              />
              <DuelCard 
                duelId={duelIds.duel3}
                player1="DiamondHands"
                player2="WaitingForOpponent"
                amount={800}
                timeRemaining="Wait for opponent"
                status="open"
              />
                            <DuelCard 
                duelId={duelIds.duel4}
                player1="TradeMaster"
                player2="TokenWhale"
                amount={2500}
                timeRemaining="08:12"
                status="active"
              />
              <DuelCard 
                duelId={duelIds.duel5}
                player1="SolanaFan"
                player2="WaitingForOpponent"
                amount={350}
                timeRemaining="Wait for opponent"
                status="open"
              />
              <DuelCard 
                duelId={duelIds.duel6}
                player1="BlockchainBaron"
                player2="CryptoNinja"
                amount={1800}
                timeRemaining="01:30"
                status="active"
              />
            </>
          )}
          
          {selectedTab === 'completed' && (
            <>
              <DuelCard 
                duelId={duelIds.duel7}
                player1="SolWarrior"
                player2="MoonShot"
                amount={1200}
                winner="SolWarrior"
                status="completed"
              />
              <DuelCard 
                duelId={duelIds.duel8}
                player1="DiamondHands"
                player2="TokenWhale"
                amount={3600}
                winner="TokenWhale"
                status="completed"
              />
              <DuelCard 
                duelId={duelIds.duel9}
                player1="CryptoKing"
                player2="BlockchainBaron"
                amount={950}
                winner="CryptoKing" 
                status="completed"
              />
            </>
          )}
          
          {selectedTab === 'my' && (
            <div className="col-span-full text-center py-10">
              <p className="text-white/70 mb-4">Connect your wallet to view your duels</p>
              <button className="btn-primary mx-auto">
                Connect Wallet
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <button className="btn-outline group">
            View All Duels
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

interface DuelCardProps {
  duelId: number;
  player1: string;
  player2: string;
  amount: number;
  timeRemaining?: string;
  winner?: string;
  status: 'open' | 'active' | 'completed';
}

const DuelCard: React.FC<DuelCardProps> = ({ duelId, player1, player2, amount, timeRemaining, winner, status }) => {
  return (
    <div className="duel-card relative overflow-hidden">
      {/* Enhanced translucent glass background */}
      <div className="absolute inset-0 bg-background-dark/30 backdrop-blur-md z-0 rounded-2xl"></div>
      
      {/* Subtle gradient overlay based on status */}
      <div className={`absolute inset-0 opacity-20 z-0 rounded-2xl ${
        status === 'active' ? 'bg-gradient-to-br from-accent/30 to-transparent' : 
        status === 'completed' ? 'bg-gradient-to-br from-green-500/30 to-transparent' : 
        'bg-gradient-to-br from-primary/30 to-transparent'
      }`}></div>
      
      {/* Card content */}
      <div className="relative z-10 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/20 hover:translate-y-[-4px]">
        {/* Status color indicator */}
        <div className={`absolute -top-1 -right-1 -left-1 h-1 rounded-t-2xl ${
          status === 'active' ? 'bg-accent' : 
          status === 'completed' ? 'bg-green-500' : 
          'bg-primary'
        }`}></div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Swords className="w-5 h-5 text-primary/80 mr-2" />
            <span className="font-medium">Duel #{duelId}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'active' ? 'bg-accent/10 text-accent border border-accent/20' : 
            status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
            'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {status === 'active' ? (
              <div className="flex items-center">
                <Flame className="w-3 h-3 mr-1" />
                In Progress
              </div>
            ) : status === 'completed' ? (
              <div className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Completed
              </div>
            ) : (
              <div className="flex items-center">
                <Target className="w-3 h-3 mr-1" />
                Open Challenge
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 border border-white/10">
              <User className="w-6 h-6 text-white/70" />
            </div>
            <p className="text-sm font-medium truncate max-w-[100px]">{player1}</p>
            {status === 'completed' && winner === player1 && (
              <Award className="w-5 h-5 text-yellow-500 mx-auto mt-1" />
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-primary">{amount}</div>
            <div className="text-xs text-white/50">$DUEL</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 border border-white/10">
              <User className="w-6 h-6 text-white/70" />
            </div>
            <p className="text-sm font-medium truncate max-w-[100px]">{player2}</p>
            {status === 'completed' && winner === player2 && (
              <Award className="w-5 h-5 text-yellow-500 mx-auto mt-1" />
            )}
          </div>
        </div>
        
        <div className="mt-4 border-t border-white/10 pt-4 flex justify-between items-center">
          {status === 'completed' ? (
            <div className="text-sm text-white/70">
              Winner: <span className="text-green-500 font-medium">{winner}</span>
            </div>
          ) : (
            <div className="text-sm text-white/70">
              {status === 'active' ? 'Ends in:' : 'Status:'} <span className="text-white font-medium">{timeRemaining}</span>
            </div>
          )}
          
          {status === 'open' && (
            <button className="btn-primary py-1 px-4 text-sm relative overflow-hidden group">
              <span className="relative z-10">Join Duel</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary via-accent to-primary bg-size-200 transition-opacity duration-300"></div>
            </button>
          )}
          
          {status === 'active' && (
            <button className="btn-outline py-1 px-4 text-sm group">
              <Flame className="w-3 h-3 inline mr-1 text-accent" />
              Watch
            </button>
          )}
          
          {status === 'completed' && (
            <button className="btn-outline py-1 px-4 text-sm">
              Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuelsSection;
