import React, { useRef, useEffect, useState } from 'react';
import { Clock, TrendingUp, Users, Zap, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const JackpotSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [participants, setParticipants] = useState(467);
  const [jackpotAmount, setJackpotAmount] = useState(98712);
  const [stakeAmount, setStakeAmount] = useState('');
  
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
  
  // Simulate growing jackpot and participants
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAmount = Math.floor(Math.random() * 240);
      setJackpotAmount(prev => prev + randomAmount);
      
      if (Math.random() > 0.7) {
        setParticipants(prev => prev + 1);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Animations
  useEffect(() => {
    if (sectionRef.current) {
      // Title animations
      gsap.from(".jackpot-title", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
      
      // Card animation
      gsap.from(".jackpot-card", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        scrollTrigger: {
          trigger: ".jackpot-card",
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });
      
      // Floating particles
      gsap.to(".jackpot-particle", {
        y: -20,
        x: 10,
        opacity: 0.8,
        duration: 3,
        ease: "power1.inOut",
        stagger: 0.2,
        repeat: -1,
        yoyo: true
      });
      
      // Card elements
      gsap.from(".card-content > *", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".card-content",
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });
    }
  }, []);
  
  return (
    <section id="jackpot" ref={sectionRef} className="py-20 md:py-32 relative">
      {/* Subtle animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="jackpot-particle absolute w-1.5 h-1.5 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${i % 2 ? 'var(--primary)' : 'var(--accent)'}, transparent 70%)`,
              boxShadow: `0 0 10px 2px ${i % 2 ? 'rgba(138, 43, 226, 0.2)' : 'rgba(255, 105, 180, 0.2)'}`
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Title */}
        <div className="jackpot-title text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 inline-block">
            <span className="text-white">DAILY </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">JACKPOT</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6 rounded-full"></div>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Join our massive daily jackpot event at 8PM EST! Stake your tokens to win the largest pot in the $DUEL ecosystem.
          </p>
        </div>
        
        {/* Main Jackpot Card */}
        <div className="jackpot-card max-w-4xl mx-auto rounded-3xl overflow-hidden relative">
          {/* Card Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-background to-pink-900/30 backdrop-blur-sm z-0"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(138,43,226,0.15),transparent_70%)] z-0"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,105,180,0.15),transparent_70%)] z-0"></div>
          
          {/* Card Content */}
          <div className="card-content relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
              {/* Jackpot Amount */}
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h3 className="text-xl text-white/80 font-medium mb-2">Today's Jackpot</h3>
                <div className="text-5xl md:text-6xl font-bold mb-2 relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent animate-pulse-slow">
                    {jackpotAmount.toLocaleString()} $DUEL
                  </span>
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl rounded-full opacity-40 animate-pulse-slow -z-10"></div>
                </div>
              </div>
              
              {/* Countdown */}
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 z-0"></div>
                <div className="relative z-10">
                  <div className="flex justify-center items-center text-white/70 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Next Draw at 8PM EST</span>
                  </div>
                  
                  <div className="flex gap-2 justify-center items-center">
                    {/* Hours */}
                    <div className="flex flex-col items-center">
                      <div className="text-4xl font-bold text-white">{String(timeRemaining.hours).padStart(2, '0')}</div>
                      <div className="text-xs text-white/50 mt-1">HOURS</div>
                    </div>
                    
                    <div className="text-2xl font-bold text-white/50 pb-4">:</div>
                    
                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <div className="text-4xl font-bold text-white">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                      <div className="text-xs text-white/50 mt-1">MINUTES</div>
                    </div>
                    
                    <div className="text-2xl font-bold text-white/50 pb-4">:</div>
                    
                    {/* Seconds */}
                    <div className="flex flex-col items-center">
                      <div className="text-4xl font-bold text-white">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                      <div className="text-xs text-white/50 mt-1">SECONDS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Participants Info */}
            <div className="flex justify-between items-center mb-10">
              <div className="text-lg">
                <span className="text-white/60">Current Participants:</span> <span className="font-bold text-white">{participants}</span>
              </div>
              <div className="text-lg">
                <span className="text-white/60">Min Entry:</span> <span className="font-bold text-white">100 $DUEL</span>
              </div>
            </div>
            
            {/* Entry Form */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  type="number" 
                  placeholder="Enter amount to stake" 
                  className="w-full bg-black/30 border border-white/10 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-primary transition-colors"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">$DUEL</div>
              </div>
              <button className="h-14 btn-primary text-lg font-medium px-8 relative overflow-hidden group transition-all duration-300">
                <span className="relative z-10">Enter Jackpot</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary via-accent to-primary bg-size-200 transition-opacity duration-300"></div>
              </button>
            </div>
            
            <div className="mt-6 text-white/50 text-sm">
              * The more tokens you stake, the higher your chances of winning. Entries remain locked until the daily 8PM EST draw.
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <StatCard 
            icon={<Clock className="w-6 h-6 text-primary" />}
            title="Daily at 8PM EST"
            description="One massive jackpot draw every day at a fixed time"
          />
          <StatCard 
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            title="Massive Prize Pool"
            description="Growing jackpots that accumulate throughout the day"
          />
          <StatCard 
            icon={<Users className="w-6 h-6 text-primary" />}
            title="Community Event"
            description="Connect with fellow token holders at draw time"
          />
          <StatCard 
            icon={<Zap className="w-6 h-6 text-primary" />}
            title="Instant Rewards"
            description="Winners receive payouts immediately after the draw"
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .bg-size-200 {
          background-size: 200% 200%;
        }
      `}</style>
    </section>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, description }) => {
  return (
    <div className="p-6 rounded-xl border border-white/5 transition-all duration-300 hover:border-white/20 backdrop-blur-sm bg-white/5">
      <div className="flex items-start">
        <div className="mr-4 mt-1">{icon}</div>
        <div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-white/60 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default JackpotSection;
