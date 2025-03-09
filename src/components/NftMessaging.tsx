import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MessageSquare, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, Coins } from 'lucide-react';
import { createTokenMessage, checkTokenBalance, TOKEN_LOGO_GATEWAY_URL } from '../services/nftMessaging';
import ImageWithFallback from './ui/ImageWithFallback';

const TokenMessaging = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    txId?: string;
    error?: string;
  } | null>(null);

  // Token mint address
  const TOKEN_MINT_ADDRESS = 'HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump';
  // IMPORTANT: This is temporarily reduced for testing
  const TOKENS_TO_BURN = 100; // Temporarily reduced for testing
  const TOKENS_TO_MINT = 1000000000000000000; // 1 quintillion
  
  // Token name character limit (Solana standard)
  const MAX_TOKEN_NAME_LENGTH = 32;
  const MAX_TOKEN_SYMBOL_LENGTH = 10;

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
        const balance = await checkTokenBalance(connection, publicKey);
        
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !recipient || !message || !subject) return;
    
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
      
      // Send the token message in a single transaction
      const result = await createTokenMessage({
        recipient,
        message,
        subject: subject.toUpperCase(), // Convert to uppercase for token symbol
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
          setSubject('');
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

  // Calculate remaining characters
  const remainingChars = MAX_TOKEN_NAME_LENGTH - message.length;
  const remainingSymbolChars = MAX_TOKEN_SYMBOL_LENGTH - subject.length;

  // Format token amount for display - handling very large numbers
  const formatTokenAmount = (amount: number | bigint): string => {
    let amountStr = amount.toString();
    
    // Add commas for readability
    return amountStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Format with abbreviation for extremely large numbers
  const formatLargeNumber = (num: number | bigint): string => {
    const trillion = 1000000000000;
    const billion = 1000000000;
    const million = 1000000;
    
    let numValue = typeof num === 'bigint' ? Number(num) : num;
    
    // Handle cases where the number is too large for precise representation
    if (numValue > Number.MAX_SAFE_INTEGER) {
      return "1 quintillion";
    }
    
    if (numValue >= trillion) {
      return (numValue / trillion).toFixed(2) + ' trillion';
    } else if (numValue >= billion) {
      return (numValue / billion).toFixed(2) + ' billion';
    } else if (numValue >= million) {
      return (numValue / million).toFixed(2) + ' million';
    } else {
      return formatTokenAmount(numValue);
    }
  };

  return (
    <section id="token-messaging" className="section relative overflow-hidden">
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
            Token <span className="gradient-text">Messaging</span> Platform
          </motion.h2>
          <motion.p 
            className="text-white/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Send custom text messages as tokens by burning $SMS. Your messages are permanently stored on the Solana blockchain as token names.
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
                Create Your Message Token
              </h3>
              
              {!connected ? (
                <div className="text-center py-10">
                  <p className="text-white/70 mb-6">Connect your wallet to send token messages</p>
                  <WalletMultiButton className="!bg-primary hover:!bg-primary-light !transition-all !rounded-full !h-auto !py3" />
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
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0                           <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className={`font-medium ${transactionResult.success ? 'text-green-500' : 'text-red-500'}`}>
                            {transactionResult.success ? 'Message Token Sent Successfully!' : 'Failed to send message'}
                          </h4>
                          <p className="text-white/70 text-sm">
                            {transactionResult.success 
                              ? `Transaction ID: ${transactionResult.txId}` 
                              : transactionResult.error || 'Unknown error occurred'}
                          </p>
                          {transactionResult.success && (
                            <p className="text-white/70 text-sm mt-1">
                              Your message has been created as a token and sent to the recipient
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
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-white/70">Subject (Token Symbol)</label>
                      <span className={`text-xs ${remainingSymbolChars <= 2 ? 'text-orange-400' : remainingSymbolChars <= 0 ? 'text-red-400' : 'text-white/50'}`}>
                        {remainingSymbolChars} characters remaining
                      </span>
                    </div>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter a subject (e.g., HELLO)"
                      className="w-full bg-dark p-3 rounded-lg border border-gray/30 focus:border-primary outline-none transition-colors"
                      required
                      disabled={isSubmitting}
                      maxLength={MAX_TOKEN_SYMBOL_LENGTH}
                    />
                    <p className="text-xs text-white/50 mt-1">
                      This will be used as the token symbol (e.g., $HELLO)
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-white/70">Your Message</label>
                      <span className={`text-xs ${remainingChars <= 5 ? 'text-orange-400' : remainingChars <= 0 ? 'text-red-400' : 'text-white/50'}`}>
                        {remainingChars} characters remaining
                      </span>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full bg-dark p-3 rounded-lg border border-gray/30 focus:border-primary outline-none transition-colors min-h-[120px]"
                      required
                      disabled={isSubmitting}
                      maxLength={MAX_TOKEN_NAME_LENGTH}
                    />
                    <p className="text-xs text-white/50 mt-1">
                      This message will be used as the token name
                    </p>
                  </div>
                  
                  <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70">Transaction Fee:</span>
                      <span className="font-semibold">~0.00002 SOL</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70">$SMS to Burn:</span>
                      <span className="font-semibold text-primary">{TOKENS_TO_BURN} $SMS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Tokens to Mint to Recipient:</span>
                      <span className="font-semibold text-green-500">1 quintillion ${subject || "SUBJECT"}</span>
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
                      disabled={isSubmitting || (tokenBalance !== null && tokenBalance < TOKENS_TO_BURN) || !subject}
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
          
          {/* Message Token Preview */}
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
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold gradient-text">Message Token Preview</h3>
                      <p className="text-sm text-white/60">Will be sent to: {recipient || "Recipient Address"}</p>
                    </div>
                  </div>
                  
                  {/* Token Preview - Simple Rectangle Format */}
                  <div className="mb-4 p-6 bg-dark/80 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Show custom token logo */}
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={TOKEN_LOGO_GATEWAY_URL}
                          fallbackSrc="/assets/nft-messaging.svg"
                          alt={`${subject || "TOKEN"} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold">{message}</h4>
                          <span className="text-xs text-white/40 px-2 py-1 bg-white/5 rounded-full">
                            1 quintillion ${subject.toUpperCase() || "SUBJECT"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray/10 mt-4 pt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Sender</span>
                        <span className="text-white/80">{publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Your Wallet'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-white/60">Date</span>
                        <span className="text-white/80">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-white/60 mt-4 pt-4 border-t border-gray/10">
                    <span>Powered by $SMS</span>
                    <span>Burns {TOKENS_TO_BURN} $SMS tokens</span>
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
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={TOKEN_LOGO_GATEWAY_URL}
                        fallbackSrc="/assets/nft-messaging.svg"
                        alt="Token logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Message Token Preview</h3>
                      <p className="text-sm text-white/60">Connect wallet and create a message to preview</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center p-6 border border-dashed border-gray/20 rounded-xl bg-dark/30 w-full">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full overflow-hidden">
                        <ImageWithFallback
                          src={TOKEN_LOGO_GATEWAY_URL}
                          fallbackSrc="/assets/nft-messaging.svg"
                          alt="Token logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="text-lg font-medium text-white/60 mb-2">Your message token will appear here</h4>
                      <p className="text-sm text-white/40">
                        Write a message and click "Preview" to see how your token will look in the recipient's wallet
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

export default TokenMessaging;
