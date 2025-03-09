import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  Keypair,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createInitializeMintInstruction,
  createBurnInstruction,
  getAccount,
  getMint
} from '@solana/spl-token';
import { getMetadataAddress, createTokenMetadataInstruction, DEFAULT_TOKEN_LOGO_URL } from './metadataInstructions';
import { uploadTokenMetadata } from './ipfsUploader';

// Token mint address for HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump
const TOKEN_MINT_ADDRESS = new PublicKey('HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump');
const TOKEN_MINT_ADDRESS_STRING = 'HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump';

// Number of tokens to burn per message (in whole tokens)
const TOKENS_TO_BURN = 10000; // Burn 10000 tokens per message

// Token decimals - SMS token has 6 decimals
const TOKEN_DECIMALS = 6;

// Calculate burn amount in raw units (TOKENS_TO_BURN * 10^TOKEN_DECIMALS)
const BURN_AMOUNT_RAW = BigInt(TOKENS_TO_BURN) * BigInt(10 ** TOKEN_DECIMALS);

// Number of tokens to mint to recipient (1 quintillion)
// Using BigInt to handle the large number
const TOKENS_TO_MINT_BIGINT = BigInt("1000000000000000000");

// Solana Memo Program ID
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Export the token logo URL for UI usage (browser-compatible)
export const TOKEN_LOGO_URL = DEFAULT_TOKEN_LOGO_URL;

export interface TokenMessageParams {
  recipient: string;
  message: string;
  subject: string;
  connection: Connection;
  wallet: any; // WalletContextState from @solana/wallet-adapter-react
}

// Advanced token account inspection for detailed diagnostics
async function inspectTokenAccount(connection: Connection, tokenAccount: PublicKey) {
  try {
    console.log('🔬 Inspecting token account in detail:', tokenAccount.toString());
    
    // Fetch the raw account info first
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    if (!accountInfo) {
      console.error('❌ Token account not found in ledger');
      return null;
    }
    
    console.log('📊 Token account data size:', accountInfo.data.length);
    console.log('🔐 Token account owner program:', accountInfo.owner.toString());
    
    // Use the proper SPL Token method to decode account info
    try {
      const tokenAccountInfo = await getAccount(connection, tokenAccount);
      console.log('💼 Token account details:', {
        mint: tokenAccountInfo.mint.toString(),
        owner: tokenAccountInfo.owner.toString(),
        amount: tokenAccountInfo.amount.toString(),
        delegate: tokenAccountInfo.delegate?.toString() || 'No delegate',
        delegatedAmount: tokenAccountInfo.delegatedAmount.toString(),
        isFrozen: tokenAccountInfo.isFrozen,
        closeAuthority: tokenAccountInfo.closeAuthority?.toString() || 'No close authority'
      });
      
      // Check if the amount matches what we expect
      console.log(`💰 Raw token amount in account: ${tokenAccountInfo.amount.toString()}`);
      
      // Also check the mint info
      try {
        const mintInfo = await getMint(connection, TOKEN_MINT_ADDRESS);
        console.log('🏦 Token mint details:', {
          decimals: mintInfo.decimals,
          freezeAuthority: mintInfo.freezeAuthority?.toString() || 'No freeze authority',
          mintAuthority: mintInfo.mintAuthority?.toString() || 'No mint authority',
          supply: mintInfo.supply.toString()
        });
      } catch (e) {
        console.error('Error fetching mint info:', e);
      }
      
      return tokenAccountInfo;
    } catch (e) {
      console.error('Error parsing token account data:', e);
      return null;
    }
  } catch (e) {
    console.error('Error in inspectTokenAccount:', e);
    return null;
  }
}

// Simple and robust token balance check following Solana best practices
export async function checkTokenBalance(connection: Connection, walletPublicKey: PublicKey): Promise<number> {
  console.log('🔍 Checking token balance for wallet:', walletPublicKey.toString());
  console.log('🔍 Using token mint:', TOKEN_MINT_ADDRESS.toString());
  
  try {
    // Step 1: Derive the ATA address
    const ataAddress = await getAssociatedTokenAddress(
      TOKEN_MINT_ADDRESS,
      walletPublicKey
    );
    
    console.log('🔑 Derived ATA address:', ataAddress.toString());
    
    // Step 2: Get the balance with proper error handling
    try {
      const balance = await connection.getTokenAccountBalance(ataAddress);
      const amount = balance.value.uiAmount || 0;
      console.log(`✅ Token balance found: ${amount}`);
      return amount;
    } catch (error) {
      // Handle the specific case where the account doesn't exist yet
      if (error.message && error.message.includes("could not find account")) {
        console.log('ℹ️ ATA not created yet, returning 0 balance');
        return 0; // ATA doesn't exist, so balance is 0
      }
      
      // Log other errors but don't throw
      console.error('Error getting token balance:', error);
      return 0;
    }
  } catch (error) {
    console.error('Error in checkTokenBalance:', error);
    return 0;
  }
}

export async function createTokenMessage({ 
  recipient, 
  message,
  subject,
  connection, 
  wallet
}: TokenMessageParams): Promise<{ success: boolean; txId?: string; error?: string }> {
  console.log('📤 Starting transaction to send token message');
  try {
    if (!wallet.publicKey) {
      return { 
        success: false, 
        error: 'Wallet not connected' 
      };
    }

    const recipientPublicKey = new PublicKey(recipient);
    console.log('📬 Recipient address:', recipientPublicKey.toString());
    
    // Step 1: Find the user's token account (using ATA)
    const senderTokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT_ADDRESS,
      wallet.publicKey
    );
    console.log('💰 Sender token account:', senderTokenAccount.toString());
    
    // Step 2: Check the token balance using the improved ATA method
    const balance = await checkTokenBalance(connection, wallet.publicKey);
    console.log(`💲 Current token balance: ${balance}`);
    
    if (balance < TOKENS_TO_BURN) {
      return {
        success: false,
        error: `Insufficient tokens. You need at least ${TOKENS_TO_BURN} $SMS tokens to send a message. Current balance: ${balance}`
      };
    }
    
    // Verify token account exists before proceeding
    console.log('🔍 Getting token account info to verify ownership...');
    try {
      const accountInfo = await connection.getAccountInfo(senderTokenAccount);
      if (!accountInfo) {
        return {
          success: false,
          error: 'Token account not found. Please ensure you have tokens in your wallet.'
        };
      }
      console.log(`Token account exists and has data length: ${accountInfo.data.length}`);
    } catch (error) {
      console.error('Error checking token account:', error);
      return {
        success: false,
        error: 'Error verifying token account'
      };
    }
    
    // Step 3: Generate and upload message image and metadata to IPFS
    console.log('🖼️ Generating and uploading message token metadata...');
    let metadataURI: string;
    try {
      // Upload token metadata to IPFS
      const metadataResult = await uploadTokenMetadata(
        // For token name, use the message content (truncated if necessary)
        message.length > 32 ? message.substring(0, 32) + '...' : message,
        // For token symbol, use the subject
        subject.toUpperCase(),
        // Full message for the image generation
        message,
        // Wallet addresses and timestamp
        wallet.publicKey.toString(),
        recipient,
        Date.now()
      );
      
      metadataURI = metadata      metadataURI = metadataResult.ipfsUrl;
      console.log('✅ Successfully uploaded metadata to IPFS:', metadataURI);
    } catch (error) {
      console.error('❌ Error uploading metadata to IPFS:', error);
      return {
        success: false,
        error: 'Failed to upload message image and metadata. Please try again.'
      };
    }
    
    // Create a new transaction
    const transaction = new Transaction();
    
    // Add ComputeBudgetProgram instruction to optimize fees
    // This increases the compute unit limit while keeping overall fees lower
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000 // Optimized compute unit limit
    });
    
    // Set lower priority fee to reduce transaction cost
    const setComputeUnitPrice = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1 // Low priority fee (reduces cost)
    });
    
    // Add compute budget instructions
    transaction.add(modifyComputeUnits, setComputeUnitPrice);
    
    // Use BigInt for precise amount representation
    console.log(`🔥 Burning tokens: ${TOKENS_TO_BURN} tokens with ${TOKEN_DECIMALS} decimals`);
    console.log(`🔥 Raw burn amount as BigInt: ${BURN_AMOUNT_RAW.toString()}`);
    
    // Create burn instruction using the BigInt value
    const burnInstruction = createBurnInstruction(
      senderTokenAccount,           // Account to burn from
      TOKEN_MINT_ADDRESS,           // Token mint
      wallet.publicKey,             // Authority
      BURN_AMOUNT_RAW               // Amount to burn
    );
    
    // Log the burn instruction for debugging
    console.log('🔄 Created burn instruction with BigInt amount:', BURN_AMOUNT_RAW.toString());
    
    transaction.add(burnInstruction);
    
    // Create a new token mint for the message
    console.log('🏭 Creating new message token mint...');
    const messageTokenMintKeypair = Keypair.generate();
    const messageTokenMint = messageTokenMintKeypair.publicKey;
    console.log('🔑 New message token mint address:', messageTokenMint.toString());
    
    // Get minimum lamports required for token mint account (optimized space)
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    
    // Create system instruction to create account for message token mint
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: messageTokenMint,
      space: 82, // Space for mint account
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID
    });
    
    // Initialize mint instruction with 0 decimals (reduces storage needs)
    const initMintInstruction = createInitializeMintInstruction(
      messageTokenMint,
      0, // 0 decimals for message tokens (reduces storage costs)
      wallet.publicKey,
      wallet.publicKey,
      TOKEN_PROGRAM_ID
    );
    
    // Find recipient's associated token account for the new token
    console.log('🔍 Deriving recipient token account...');
    const recipientTokenAccount = await getAssociatedTokenAddress(
      messageTokenMint,
      recipientPublicKey
    );
    console.log('📫 Recipient token account:', recipientTokenAccount.toString());
    
    // Create recipient's associated token account if it doesn't exist
    const createRecipientATAInstruction = createAssociatedTokenAccountInstruction(
      wallet.publicKey, // Payer
      recipientTokenAccount, // Associated token account
      recipientPublicKey, // Owner
      messageTokenMint, // Mint
      TOKEN_PROGRAM_ID
    );
    
    // As requested, restore original amount of 1 quintillion tokens
    const mintAmount = TOKENS_TO_MINT_BIGINT; // 1,000,000,000,000,000,000 tokens
    
    console.log(`💰 Minting ${mintAmount.toString()} tokens to recipient`);
    
    // Mint tokens to the recipient's token account
    const mintToInstruction = createMintToInstruction(
      messageTokenMint,
      recipientTokenAccount,
      wallet.publicKey,
      mintAmount, // Mint 1 quintillion tokens to recipient
      [],
      TOKEN_PROGRAM_ID
    );
    
    // Create metadata address for the token
    console.log('📝 Creating token metadata...');
    const metadataAddress = await getMetadataAddress(messageTokenMint);
    console.log('📋 Metadata address:', metadataAddress.toString());
    
    // Sanitize message to ensure it's not too long for on-chain storage
    // The message will be the token name, so we need to keep it reasonable
    const sanitizedMessage = message.length > 32 ? message.substring(0, 32) + '...' : message;
    
    // Validate and sanitize the subject/symbol
    // Token symbols should be uppercase and typically 3-6 characters
    const sanitizedSymbol = subject.toUpperCase();
    
    // Create metadata instruction for a token with custom logo
    // The message is the token name, and the subject is the symbol
    // Now using the real IPFS metadata URI that we uploaded
    const createMetadataInstruction = createTokenMetadataInstruction(
      metadataAddress,
      messageTokenMint,
      wallet.publicKey,
      wallet.publicKey,
      sanitizedMessage,    // Message as token name
      sanitizedSymbol,     // Subject as token symbol
      metadataURI         // IPFS metadata URI with image reference
    );
    
    // Create simplified memo instruction with message data
    // Store only essential data to reduce size
    const essentialMessageData = JSON.stringify({
      m: message, // Full message in memo
      s: subject,
      t: Date.now()
    });
    
    // Create memo instruction with message data
    const memoInstruction = {
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(essentialMessageData)
    };
    
    // Add all instructions to the transaction in optimal order
    console.log('📦 Adding all instructions to transaction...');
    transaction.add(
      createAccountInstruction,
      initMintInstruction,
      createRecipientATAInstruction,
      mintToInstruction,
      createMetadataInstruction,
      memoInstruction
    );
    
    // Set the fee payer and get a recent blockhash
    transaction.feePayer = wallet.publicKey;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
    transaction.recentBlockhash = blockhash;
    
    // Partially sign with the message token mint keypair
    console.log('✍️ Partially signing transaction with token mint keypair...');
    transaction.partialSign(messageTokenMintKeypair);
    
    // Request wallet signature from the user
    console.log('🖋️ Requesting wallet signature...');
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send the transaction with preflight disabled to save compute units
    console.log('📡 Sending transaction to network...');
    const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: true, // Skip preflight to reduce compute units used
      preflightCommitment: 'confirmed'
    });
    
    // Confirm the transaction
    console.log('⏳ Confirming transaction...');
    const confirmation = await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature: txid
    });
    
    if (confirmation.value.err) {
      console.error('❌ Transaction confirmed but has errors:', confirmation.value.err);
      return {
        success: false,
        error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
      };
    }
    
    console.log('✅ Transaction confirmed successfully!');
    return {
      success: true,
      txId: txid,
    };
  } catch (error) {
    console.error('❌ Error sending token message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

<boltAction type="file" filePath="src/components/NftMessaging.tsx">import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MessageSquare, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, Coins, Copy, ExternalLink } from 'lucide-react';
import { createTokenMessage, checkTokenBalance, TOKEN_LOGO_URL } from '../services/nftMessaging';
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
  const [copySuccess, setCopySuccess] = useState(false);

  // Token mint address
  const TOKEN_MINT_ADDRESS = 'HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump';
  // IMPORTANT: This is temporarily reduced for testing
  const TOKENS_TO_BURN = 10000;
  
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

  // Copy transaction ID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
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
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 overflow-hidden">
                          <h4 className={`font-medium ${transactionResult.success ? 'text-green-500' : 'text-red-500'}`}>
                            {transactionResult.success ? 'Message Token Sent Successfully!' : 'Failed to send message'}
                          </h4>
                          {transactionResult.success && transactionResult.txId ? (
                            <div className="text-white/70 text-sm">
                              <div className="flex items-center mt-1">
                                <span className="font-medium mr-2">Transaction ID:</span>
                                <div className="flex-1 flex items-center">
                                  <span className="truncate">{transactionResult.txId}</span>
                                </div>
                              </div>
                              <div className="flex items-center mt-2 space-x-2">
                                <button 
                                  onClick={() => copyToClipboard(transactionResult.txId || '')}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-dark/50 hover:bg-dark rounded text-xs text-white/80 hover:text-white transition-colors"
                                >
                                  <Copy className="h-3 w-3" />
                                  {copySuccess ? 'Copied!' : 'Copy ID'}
                                </button>
                                <a 
                                  href={`https://solscan.io/tx/${transactionResult.txId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-dark/50 hover:bg-dark rounded text-xs text-white/80 hover:text-white transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  View on Explorer
                                </a>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white/70 text-sm break-words">
                              {transactionResult.error || 'Unknown error occurred'}
                            </p>
                          )}
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
                          src={TOKEN_LOGO_URL}
                          fallbackSrc="/assets/nft-messaging.svg"
                          alt={`${subject || "TOKEN"} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold">{message}</h4>
                          <span className="text-xs text-white/40 px-2 py-1 bg-white/5 rounded-full">
                            ${subject.toUpperCase() || "SUBJECT"}
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
                        <span className="text-white/80">{new                        <span className="text-white/80">{new Date().toLocaleDateString()}</span>
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
                        src={TOKEN_LOGO_URL}
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
                          src={TOKEN_LOGO_URL}
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
