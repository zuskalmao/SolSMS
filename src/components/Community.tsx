import { motion } from 'framer-motion';
import { Twitter, Globe, Send, MessageSquare } from 'lucide-react';

const Community = () => {
  return (
    <section id="community" className="section relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-hero-pattern opacity-10"></div>
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-secondary/10 blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.p 
            className="text-primary mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            JOIN THE MOVEMENT
          </motion.p>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Be Part of the <span className="gradient-text">$SMS</span> Community
          </motion.h2>
          <motion.p 
            className="text-white/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join thousands of $SMS enthusiasts who are pioneering the future of on-chain communication. Connect, engage, and grow with us.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Twitter */}
          <motion.a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover p-8 flex flex-col items-center text-center group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center mb-6 group-hover:bg-[#1DA1F2]/20 transition-colors">
              <Twitter className="h-8 w-8 text-[#1DA1F2]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Twitter</h3>
            <p className="text-white/70 mb-4">Follow us for the latest updates, announcements, and community activities.</p>
            <span className="text-primary font-medium group-hover:underline">@SMStoken</span>
          </motion.a>
          
          {/* Telegram */}
          <motion.a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover p-8 flex flex-col items-center text-center group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="w-16 h-16 rounded-full bg-[#0088cc]/10 flex items-center justify-center mb-6 group-hover:bg-[#0088cc]/20 transition-colors">
              <Send className="h-8 w-8 text-[#0088cc]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Telegram</h3>
            <p className="text-white/70 mb-4">Join our Telegram group to chat with the community and team members.</p>
            <span className="text-primary font-medium group-hover:underline">t.me/SMStoken</span>
          </motion.a>
          
          {/* Discord */}
          <motion.a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover p-8 flex flex-col items-center text-center group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="w-16 h-16 rounded-full bg-[#5865F2]/10 flex items-center justify-center mb-6 group-hover:bg-[#5865F2]/20 transition-colors">
              <MessageSquare className="h-8 w-8 text-[#5865F2]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Discord</h3>
            <p className="text-white/70 mb-4">Dive deeper into discussions, development updates, and community initiatives.</p>
            <span className="text-primary font-medium group-hover:underline">discord.gg/SMStoken</span>
          </motion.a>
          
          {/* Website */}
          <motion.a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover p-8 flex flex-col items-center text-center group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
              <Globe className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Website</h3>
            <p className="text-white/70 mb-4">Explore our official website for comprehensive information about $SMS.</p>
            <span className="text-primary font-medium group-hover:underline">smstoken.xyz</span>
          </motion.a>
        </div>
        
        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-10 max-w-4xl mx-auto border border-primary/30">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to join the $SMS revolution?</h3>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              Be among the first to experience the future of on-chain messaging and become part of the growing $SMS ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#nft-messaging" className="btn btn-primary">
                Try Messaging
              </a>
              <a href="#" className="btn btn-outline">
                Join Community
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Community;
