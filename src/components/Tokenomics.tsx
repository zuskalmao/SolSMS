import { motion } from 'framer-motion';
import { Zap, Shield, TrendingUp, Globe } from 'lucide-react';

const Tokenomics = () => {
  return (
    <section id="tokenomics" className="section bg-dark-light relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-hero-pattern opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-secondary/10 blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Token Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary mb-3">ABOUT THE TOKEN</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The <span className="gradient-text">$SMS</span> Token
            </h2>
            <p className="text-white/70 mb-8">
              $SMS is a utility-focused memecoin on the Solana blockchain. While most memecoins lack real-world use cases, $SMS incorporates genuine utility through its NFT messaging platform.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Built on Solana</h3>
                  <p className="text-white/70">
                    Leveraging Solana's lightning-fast transactions and low fees for an optimal user experience.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Zap className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Deflationary Mechanism</h3>
                  <p className="text-white/70">
                    Each message sent burns $SMS tokens, creating a deflationary pressure that can benefit holders over time.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Real Utility</h3>
                  <p className="text-white/70">
                    Unlike most memecoins, $SMS has a clear use case that drives token demand and engagement.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Globe className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Community Governed</h3>
                  <p className="text-white/70">
                    Future development and improvements will be guided by community input and governance.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Token Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="bg-dark p-8 rounded-2xl border border-primary/30 shadow-glow mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold gradient-text">$SMS Token</h3>
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    SPL Token
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray/10">
                    <span className="text-white/70">Network</span>
                    <span className="font-medium">Solana</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray/10">
                    <span className="text-white/70">Ticker</span>
                    <span className="font-medium text-primary">$SMS</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray/10">
                    <span className="text-white/70">Token Type</span>
                    <span className="font-medium">SPL (Solana Program Library)</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-white/70">Utility</span>
                    <span className="font-medium">NFT Messaging</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-dark p-8 rounded-2xl border border-secondary/30 shadow-glow-secondary">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <span className="gradient-text">Deflationary</span> 
                  <span className="ml-2 px-2 py-0.5 bg-secondary/20 text-secondary rounded-full text-xs">
                    Burn Mechanism
                  </span>
                </h3>
                
                <div className="flex items-center gap-8 mb-6">
                  <div className="text-center flex-1">
                    <div className="text-3xl font-bold gradient-text mb-1">10</div>
                    <p className="text-white/70 text-sm">$SMS per Message</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-3xl font-bold gradient-text mb-1">100%</div>
                    <p className="text-white/70 text-sm">Burn Rate</p>
                  </div>
                </div>
                
                <p className="text-white/70 text-sm">
                  Every time a user sends an NFT message, the required $SMS tokens are permanently removed from circulation, creating a steadily decreasing supply.
                </p>
              </div>
            </div>
            
            {/* Visual Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10"></div>
            
            <motion.div 
              className="absolute -right-6 -top-6 text-secondary opacity-30"
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
              </svg>
            </motion.div>
            
            <motion.div 
              className="absolute -left-4 -bottom-4 text-primary opacity-30"
              animate={{ 
                rotate: [360, 0],
              }}
              transition={{ 
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Tokenomics;
