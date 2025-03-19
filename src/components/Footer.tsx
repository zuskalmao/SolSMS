import { MessageSquare } from 'lucide-react';

// Twitter URL for reuse
const TWITTER_URL = "https://twitter.com/SMStoken";
const TELEGRAM_URL = "https://t.me/SMStoken";

const Footer = () => {
  return (
    <footer className="bg-dark-light py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-hero-pattern opacity-5"></div>
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-2 text-2xl font-bold mb-4">
              <MessageSquare className="text-primary h-8 w-8" />
              <span className="gradient-text">$SMS</span>
            </a>
            <p className="text-white/70 mb-6 max-w-md">
              The first memecoin on Solana with a genuine utility: send personalized messages as NFTs. Express yourself on-chain with $SMS.
            </p>
            <div className="flex gap-4">
              <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark flex items-center justify-center text-white/70 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
              </a>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark flex items-center justify-center text-white/70 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a></li>
              <li><a href="#token-messaging" className="text-white/70 hover:text-white transition-colors">NFT Messaging</a></li>
              <li><a href="#tokenomics" className="text-white/70 hover:text-white transition-colors">About $SMS</a></li>
              <li><a href="#community" className="text-white/70 hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">Twitter</a></li>
              <li><a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">Telegram</a></li>
              <li><a href="#token-messaging" className="text-white/70 hover:text-white transition-colors">Try Messaging</a></li>
              <li><a href="#tokenomics" className="text-white/70 hover:text-white transition-colors">Tokenomics</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} $SMS Token. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-white/50 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/50 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
