import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageSquare, Zap, Lock, Code, TrendingUp, Coins } from 'lucide-react';

const features = [
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "NFT Messaging",
    description: "Send custom text messages as NFTs to any Solana wallet address. Express yourself on-chain."
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Lightning Fast",
    description: "Powered by Solana's blazing-fast blockchain for near-instant messaging and low transaction fees."
  },
  {
    icon: <Lock className="h-8 w-8 text-primary" />,
    title: "Secure & Permanent",
    description: "Your messages are securely stored on the blockchain forever, creating a permanent record."
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Growing Ecosystem",
    description: "Join a rapidly expanding community of users and developers building on Solana."
  },
  {
    icon: <Coins className="h-8 w-8 text-primary" />,
    title: "Token Utility",
    description: "Each message costs $SMS tokens, creating real utility and sustainable tokenomics."
  },
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: "Open Source",
    description: "Built on open standards with transparent code, allowing developers to extend functionality."
  }
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="features" className="section bg-dark-light relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full bg-hero-pattern opacity-10"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-secondary/10 blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <motion.p 
            className="text-primary mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            WHY CHOOSE $SMS
          </motion.p>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Features & <span className="gradient-text">Benefits</span>
          </motion.h2>
          <motion.p 
            className="text-white/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            $SMS is more than just a memecoin. It's a revolutionary messaging platform that combines the fun of memecoins with actual utility on Solana.
          </motion.p>
        </div>
        
        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="card card-hover p-8 flex flex-col items-start"
              variants={itemVariants}
            >
              <div className="mb-4 p-3 bg-primary/10 rounded-xl">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
