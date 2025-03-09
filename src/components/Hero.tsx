import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, SendHorizonal } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-hero-pattern opacity-30"></div>
      
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl"></div>
      
      <motion.div 
        className="absolute top-40 right-20 text-primary opacity-20"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <MessageSquare size={120} />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-40 left-20 text-secondary opacity-20"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <SendHorizonal size={100} />
      </motion.div>
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="inline-block mb-4 px-4 py-1 bg-primary/10 text-primary rounded-full border border-primary/30">
              Revolutionary NFT Messaging on Solana
            </p>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Send Custom NFT Messages with 
            <span className="gradient-text"> $SMS</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            The first memecoin on Solana with a genuine utility: send personalized messages as NFTs. Express yourself on-chain with $SMS.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a href="#nft-messaging" className="btn btn-primary px-8 py-4 text-lg shadow-glow">
              Try Messaging
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a href="#features" className="btn btn-outline px-8 py-4 text-lg">
              Learn More
            </a>
          </motion.div>
        </div>
        
        {/* Hero Image */}
        <motion.div 
          className="mt-16 relative max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-primary/20 glow">
            <img 
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Solana NFT Messaging Platform" 
              className="w-full h-auto object-cover"
            />
            
            {/* Message Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent flex items-end justify-center pb-8">
              <div className="bg-dark-light/90 backdrop-blur-sm p-6 rounded-xl border border-primary/30 max-w-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold gradient-text">NFT Message</h3>
                </div>
                <p className="text-white/90 mb-3">Hey there! This is my first on-chain message sent as an NFT using $SMS. The future of messaging is here!</p>
                <div className="flex justify-between items-center text-sm text-white/60">
                  <span>Sent via $SMS</span>
                  <span>0x6F5...8a3F</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
