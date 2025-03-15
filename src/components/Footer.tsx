import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, Twitter, MessageSquare, Send, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="bg-background-dark pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <Sword className="w-8 h-8 text-primary mr-2" />
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-primary">$</span>DUEL
              </span>
            </div>
            <p className="text-white/60 mb-6 max-w-md">
              The ultimate memecoin battle platform on Solana. Challenge others, win tokens, and join the revolution in crypto gaming.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-primary transition-colors">
                <Twitter />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-primary transition-colors">
                <MessageSquare />
              </a>
              <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-primary transition-colors">
                <Send />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-primary transition-colors">
                <Github />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <div
                  onClick={() => navigate('/')} 
                  className="text-white/60 hover:text-primary transition-colors cursor-pointer"
                >
                  Home
                </div>
              </li>
              <li>
                <a href="/#about" className="text-white/60 hover:text-primary transition-colors">About</a>
              </li>
              <li>
                <div
                  onClick={() => navigate('/gambling')} 
                  className="text-white/60 hover:text-primary transition-colors cursor-pointer"
                >
                  Arena
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-primary transition-colors">Whitepaper</a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-primary transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-primary transition-colors">Roadmap</a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-primary transition-colors">Token Info</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/40 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} $DUEL. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
