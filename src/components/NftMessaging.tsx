import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MessageSquare, Send, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { createNFTMessage, checkTokenBalance } from '../services/nftMessaging';
import { PublicKey } from '@solana/web3.js';
import ImageWithFallback from './ui/ImageWithFallback';
import { generateMessageImage } from '../services/imageGenerator';

const NftMessaging = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    txId?: string;
    error?: string;
  } | null>(null);

  // Token mint address
  const TOKEN_MINT_ADDRESS = 'HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump';
  const TOKENS_TO_BURN = 100;

  useEffect(() => {
    // Fetch token balance when wallet connects
    const fetchTokenBalance = async () => {
      if (!connected || !publicKey) {
        setTokenBalance(null);
        return;
      }

      try {
        setIsLoadingBalance(true);
        
        console.log('Starting token balance check for address:', publicKey.toString());
        
        // Use the improved checkTokenBalance function from our service
        const balance = await checkTokenBalance(          connection, publicKey);
        
        console.log('Token balance result:', balance);
        setTokenBalance(balance);
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setTokenBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchTokenBalance();
    
    // Refresh balance every 30 seconds when connected
    const intervalId = connected ? setInterval(fetchTokenBalance, 30000) : null;
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connected, publicKey, connection]);

  // Generate preview image when message changes or preview is toggled
  useEffect(() => {
    const generatePreview = async () => {
      if (isPreview && message && publicKey) {
        try {
          const imageDataUrl = await generateMessageImage(
            message,
            publicKey.toString(),
            Date.now()
          );
          setPreviewImage(imageDataUrl);
        } catch (error) {
          console.error('Error generating preview image:', error);
        }
      }
    };

    generatePreview();
  }, [isPreview, message, publicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !recipient || !message) return;
    
    setIsSubmitting(true);
    setTransactionResult(null);
    
    try {
      // Validate recipient address
      if (!recipient.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        throw new Error('Invalid Solana wallet address');
      }

      // Check token balance
      if (tokenBalance !== null && tokenBalance < TOKENS_TO_BURN) {
        throw new Error(`Insufficient tokens. You need at least ${TOKENS_TO_BURN} $SMS tokens.`);
      }
      
      // Send the NFT message in a single transaction
      const result = await createNFTMessage({
        recipient,
        message,
        connection,
        wallet
      });
      
      setTransactionResult(result);
      
      if (result.success) {
        // Update token balance after successful transaction
        if (tokenBalance !== null) {
          setTokenBalance(tokenBalance - TOKENS_TO_BURN);
        }
        
        // Clear form after successful transaction
        setTimeout(() => {
          setMessage('');
          setRecipient('');
          setIsPreview(false);
          setTransactionResult(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setTransactionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="nft-messaging" className="section relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-hero-pattern opacity-10"></div>
      <div className="absolute top-20 left-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 rounded-full bg-secondary/10 blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <motion.p 
            className="text-primary mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            UTILITY SHOWCASE
          </motion.p>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            NFT <span className="gradient-text">Messaging</span> Platform
          </motion.h2>
          <motion.p 
            className="text-white/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Send custom text messages as NFTs by burning $SMS tokens. Your messages are permanently stored on the Solana blockchain.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Messaging Interface */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="bg-dark-light p-8 rounded-2xl border border-gray/10 gradient-border">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <MessageSquare className="text-primary h-6 w-6" />
                Create Your NFT Message
              </h3>
              
              {!connected ? (
                <div className="text-center py-10">
                  <p className="text-white/70 mb-6">Connect your wallet to send NFT messages</p>
                  <WalletMultiButton className="!bg-primary hover:!bg-primary-light !transition-all !rounded-full !h-auto !py-3" />
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Token Balance Info */}
                  <div className="mb-6 p-4 rounded-lg bg-dark/50 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">$</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-1">Your Token Balance</h4>
                        {isLoadingBalance ? (
                          <p className="text-white/60 text-sm flex items-center">
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Loading balance...
                          </p>
                        ) : tokenBalance === null ? (
                          <p className="text-white/60 text-sm">Unknown balance</p>
                        ) : (
                          <p className={`text-sm ${tokenBalance < TOKENS_TO_BURN ? 'text-red-400' : 'text-primary'}`}>
                            {tokenBalance} $SMS tokens
                            {tokenBalance < TOKENS_TO_BURN && (
                              <span className="ml-2 flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Insufficient balance
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                
                  {transactionResult && (
                    <div className={`mb-6 p-4 rounded-lg ${transactionResult.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                      <div className="flex items-start gap-3">
                        {transactionResult.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className={`font-medium ${transactionResult.success ? 'text-green-500' : 'text-red-500'}`}>
                            {transactionResult.success ? 'NFT Message sent successfully!' : 'Failed to send message'}
                          </h4>
                          <p className="text-white/70 text-sm">
                            {transactionResult.success 
                              ? `Transaction ID: ${transactionResult.txId}` 
                              : transactionResult.error || 'Unknown error occurred'}
                          </p>
                          {transactionResult.success && (
                            <p className="text-white/70 text-sm mt-1">
                              Your message has been minted as an NFT and sent to the recipient
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                
                  <div className="mb-6">
                    <label className="block text-white/70 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Solana wallet address"
                      className="w-full bg-dark p-3 rounded-lg border border-gray/30 focus:border-primary outline-none transition-colors"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-white/70 mb-2">Your Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full bg-dark p-3 rounded-lg border border-gray/30 focus:border-primary outline-none transition-colors min-h-[120px]"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70">Transaction Fee:</span>
                      <span className="font-semibold">0.000005 SOL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">$SMS to Burn:</span>
                      <span className="font-semibold text-primary">{TOKENS_TO_BURN} $SMS</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPreview(!isPreview)}
                      className="btn btn-outline flex-1"
                      disabled={isSubmitting}
                    >
                      {isPreview ? "Edit Message" : "Preview"}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      disabled={isSubmitting || (tokenBalance !== null && tokenBalance < TOKENS_TO_BURN)}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
          
          {/* Preview or NFT Message Preview Box */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <AnimatePresence mode="wait">
              {isPreview && message ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-dark-light p-8 rounded-2xl border border-primary/30 shadow-glow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold gradient-text">NFT Message Preview</h3>
                      <p className="text-sm text-white/60">Will be sent to: {recipient || "Recipient Address"}</p>
                    </div>
                  </div>
                  
                  {/* NFT Image Preview - Dynamic using canvas rendering */}
                  <div className="mb-4 rounded-xl overflow-hidden">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="NFT Message" 
                        className="w-full aspect-square object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-dark/70 flex items-center justify-center rounded-xl">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>Sent via $SMS</span>
                    <span>Your wallet • {new Date().toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="blank-preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-dark-light p-8 rounded-2xl border border-gray/30 h-[400px] flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">NFT Message Preview</h3>
                      <p className="text-sm text-white/60">Connect wallet and create a message to preview</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center p-6 border border-dashed border-gray/20 rounded-xl bg-dark/30 w-full">
                      <MessageSquare className="h-10 w-10 text-white/20 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-white/60 mb-2">Your message will appear here</h4>
                      <p className="text-sm text-white/40">
                        Write a message and click "Preview" to see how your NFT message will look
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray/10 flex justify-between items-center text-sm text-white/40">
                    <span>Powered by $SMS</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NftMessaging;
