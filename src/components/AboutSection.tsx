import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, Shield, Flame, Trophy, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AboutSection: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupAnimations = () => {
      if (sectionRef.current && headingRef.current && cardsContainerRef.current) {
        // Set initial states
        gsap.set(headingRef.current.querySelectorAll('.reveal-text'), { y: 50, opacity: 0 });
        gsap.set(".feature-card", { opacity: 0, y: 30, scale: 0.95 });
        
        // Create heading animation
        gsap.to(headingRef.current.querySelectorAll('.reveal-text'), {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });

        // Create cards animation
        gsap.to(".feature-card", {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        });
      }
    };

    // Allow time for DOM to render properly
    const timeoutId = setTimeout(setupAnimations, 100);
    
    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill(false));
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-background-dark">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background to-background-dark opacity-70"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 filter blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 filter blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading Section */}
        <div ref={headingRef} className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-block mb-3 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-1 rounded-full">
            <p className="text-white text-sm font-semibold tracking-wider reveal-text">NEXT-GEN MEMECOIN</p>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="block reveal-text">The <span className="gradient-text">Ultimate</span></span>
            <span className="block reveal-text">Memecoin Battle Platform</span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/70 mt-4 max-w-3xl mx-auto reveal-text">
            $DUEL is not just another memecoin. It's a battle platform where you can challenge others, 
            win big, and showcase your skills in epic duels on the Solana blockchain.
          </p>
        </div>

        {/* Feature Cards */}
        <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <FeatureCard 
            icon={<Sword className="w-8 h-8 text-primary" />}
            title="1v1 Battles"
            description="Challenge any holder to a duel and bet your $DUEL tokens. Winner takes all in these exciting head-to-head battles."
            delay={0}
          />
          <FeatureCard 
            icon={<Trophy className="w-8 h-8 text-accent" />}
            title="Jackpot Duels"
            description="Join the regularly scheduled jackpot duels that happen every 30 minutes. The more you stake, the better your chances."
            delay={1}
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-primary" />}
            title="Secure Platform"
            description="Built on Solana for lightning-fast transactions and minimal fees. Every duel is secured by the blockchain."
            delay={2}
          />
          <FeatureCard 
            icon={<Flame className="w-8 h-8 text-accent" />}
            title="Community Driven"
            description="Governance through token holdings. The community decides on new features and upgrades to the platform."
            delay={3}
          />
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <button 
            className="btn-gradient-shine text-lg px-8 py-3 group font-bold"
            onClick={() => navigate('/arena')}
          >
            Enter The Arena
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  return (
    <div 
      className="feature-card p-6 rounded-2xl border border-white/10 relative bg-gradient-to-br from-background-dark to-background hover:from-background-dark/80 hover:to-background/90 transition-all duration-500 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 group"
      style={{ transitionDelay: `${delay * 50}ms` }}
    >
      {/* Card glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity duration-700"></div>
      
      {/* Card content */}
      <div className="relative z-10">
        <div className="rounded-2xl w-16 h-16 flex items-center justify-center bg-background-dark border border-white/10 mb-6 group-hover:border-primary/30 transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-white/70">{description}</p>
      </div>
    </div>
  );
};

export default AboutSection;
