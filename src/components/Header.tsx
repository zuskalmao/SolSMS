import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { MessageSquare, Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { wallet } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark/90 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-2xl font-bold">
          <MessageSquare className="text-primary h-8 w-8" />
          <span className="gradient-text">$SMS</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
          <a href="#nft-messaging" className="text-white/80 hover:text-white transition-colors">NFT Messaging</a>
          <a href="#tokenomics" className="text-white/80 hover:text-white transition-colors">About</a>
          <a href="#community" className="text-white/80 hover:text-white transition-colors">Community</a>
        </nav>

        {/* Wallet Button */}
        <div className="hidden md:block">
          <WalletMultiButton className="!bg-primary hover:!bg-primary-light !transition-all !rounded-full !h-auto !py-2" />
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden absolute top-full left-0 right-0 bg-dark-light shadow-lg border-t border-gray/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container py-4 flex flex-col gap-4">
            <a 
              href="#features" 
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#nft-messaging" 
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              NFT Messaging
            </a>
            <a 
              href="#tokenomics" 
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a 
              href="#community" 
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </a>
            <div className="pt-2">
              <WalletMultiButton className="!bg-primary hover:!bg-primary-light !transition-all !rounded-full !h-auto !py-2 w-full" />
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
