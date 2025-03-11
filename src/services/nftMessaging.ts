import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  Keypair,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  sendAndConfirmTransaction
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
import { getMetadataAddress, createTokenMetadataInstruction, TOKEN_LOGO_GATEWAY_URL } from './metadataInstructions';
import { uploadMetadataToIPFS, SMS_LOGO_IPFS_GATEWAY } from './pinataService';

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

// IMPORTANT: For message tokens, use 9 decimals to ensure they appear as regular tokens, not NFTs
// This helps wallets distinguish between NFTs (0 decimals, supply of 1) and fungible tokens
const MESSAGE_TOKEN_DECIMALS = 9;

// Solana Memo Program ID
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Export the token logo URL for UI usage (browser-compatible)
export const TOKEN_LOGO_URL = TOKEN_LOGO_GATEWAY_URL;

export interface TokenMessageParams {
  recipient: string;
  message: string;
  subject: string;
  connection: Connection;
  wallet: any; // WalletContextState from @solana/wallet-adapter-react
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

// Gets the phantom provider - following exact Phantom documentation
function getProvider() {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  // Explicitly handle the case where Phantom is not installed
  console.error("Phantom wallet not found. Please install Phantom.");
  throw new Error("Phantom wallet not found. Please install Phantom.");
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
    
    // Debug wallet provider info
    const providerName = wallet.adapter?.name || 'Unknown wallet';
    console.log('📱 Wallet provider:', providerName);
    
    const recipientPublicKey = new PublicKey(recipient);
    console.log('📬 Recipient address:', recipientPublicKey.toString());
    
    // Step 1: Find the user's token account (using ATA)
    const senderTokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT_ADDRESS,
      wallet.publicKey
    );
    console.log('💰 Sender token account:', senderTokenAccount.toString());
    
    // Step 2: Check the token balance 
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
    
    // Sanitize message to ensure it's not too long for on-chain storage
    const sanitizedMessage = message.length > 32 ? message.substring(0, 32) + '...' : message;
    
    // Validate and sanitize the subject/symbol
    const sanitizedSymbol = subject.toUpperCase();
    
    // Create a new transaction
    const transaction = new Transaction();
    
    // Add ComputeBudgetProgram instruction to optimize fees
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 200000 // Standard compute unit limit
    });
    
    // Add compute budget instruction
    transaction.add(modifyComputeUnits);
    
    // Create burn instruction using the BigInt value
    const burnInstruction = createBurnInstruction(
      senderTokenAccount,           // Account to burn from
      TOKEN_MINT_ADDRESS,           // Token mint
      wallet.publicKey,             // Authority
      BURN_AMOUNT_RAW               // Amount to burn
    );
    
    transaction.add(burnInstruction);
    
    // Create a new token mint for the message
    console.log('🏭 Creating new message token mint...');
    
    // Create new keypair for the message token mint
    const messageTokenMintKeypair = Keypair.generate();
    const messageTokenMint = messageTokenMintKeypair.publicKey;
    console.log('🔑 New message token mint address:', messageTokenMint.toString());
    
    // Get minimum lamports required for token mint account
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    
    // Create system instruction to create account for message token mint
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: messageTokenMint,
      space: 82, // Space for mint account
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID
    });
    
    // Initialize mint with MESSAGE_TOKEN_DECIMALS (9)
    const initMintInstruction = createInitializeMintInstruction(
      messageTokenMint,
      MESSAGE_TOKEN_DECIMALS, // Using 9 decimals ensures it's treated as a fungible token, not an NFT
      wallet.publicKey,
      wallet.publicKey,
      TOKEN_PROGRAM_ID
    );
    
    // Find recipient's associated token account for the new token
    const recipientTokenAccount = await getAssociatedTokenAddress(
      messageTokenMint,
      recipientPublicKey
    );
    
    // Create recipient's associated token account if it doesn't exist
    const createRecipientATAInstruction = createAssociatedTokenAccountInstruction(
      wallet.publicKey, // Payer
      recipientTokenAccount, // Associated token account
      recipientPublicKey, // Owner
      messageTokenMint, // Mint
      TOKEN_PROGRAM_ID
    );
    
    // Adjust minting amount for the new decimals
    const scaledMintAmount = TOKENS_TO_MINT_BIGINT * BigInt(10 ** MESSAGE_TOKEN_DECIMALS);
    
    // Mint tokens to the recipient's token account with adjusted amount
    const mintToInstruction = createMintToInstruction(
      messageTokenMint,
      recipientTokenAccount,
      wallet.publicKey,
      scaledMintAmount, // Scaled amount that accounts for decimals
      [],
      TOKEN_PROGRAM_ID
    );
    
    // Upload token metadata to IPFS via Pinata
    console.log('📤 Uploading token metadata to IPFS...');
    let metadataUri;
    try {
      metadataUri = await uploadMetadataToIPFS(sanitizedMessage, sanitizedSymbol);
      console.log('📋 Metadata uploaded to IPFS:', metadataUri);
    } catch (error) {
      console.error('❌ Error uploading to IPFS (using fallback):', error);
      metadataUri = `https://ipfs.io/ipfs/QmMetadataFallback${Date.now()}`;
    }
    
    // Create metadata address for the token
    const metadataAddress = await getMetadataAddress(messageTokenMint);
    
    // Create metadata instruction using the IPFS metadata URI
    const createMetadataInstruction = createTokenMetadataInstruction(
      metadataAddress,
      messageTokenMint,
      wallet.publicKey,
      wallet.publicKey,
      sanitizedMessage, // Message as token name
      sanitizedSymbol,  // Subject as token symbol
      metadataUri       // IPFS URI to the metadata JSON
    );
    
    // Create simplified memo instruction with message data
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
    
    // Set the fee payer 
    transaction.feePayer = wallet.publicKey;
    
    // Get a recent blockhash
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    transaction.recentBlockhash = blockhash;
    
    // Sign only with the keypair that needs to be signed by us
    transaction.partialSign(messageTokenMintKeypair);
    console.log('✅ Transaction partially signed with mint keypair only');
    
    // --------------------------------
    // PHANTOM WALLET TRANSACTION HANDLING 
    // FOLLOWING PHANTOM DOCUMENTATION EXACTLY
    // --------------------------------
    try {
      // Get the provider as specified in Phantom docs
      console.log('🔍 Getting Phantom provider...');
      const provider = getProvider();
      console.log('✅ Phantom provider found');
      
      // Use ONLY signAndSendTransaction as advised by Phantom
      console.log('📡 Using provider.signAndSendTransaction method per Phantom docs...');
      const { signature } = await provider.signAndSendTransaction(transaction);
      console.log('✅ Transaction sent via signAndSendTransaction:', signature);
      
      // Wait for confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      try {
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        
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
          txId: signature,
        };
      } catch (confirmError) {
        console.error('Error confirming transaction:', confirmError);
        return {
          success: true,
          txId: signature,
          error: 'Transaction sent, but confirmation status unknown'
        };
      }
    } catch (signError) {
      console.error('❌ Error in transaction handling:', signError);
      const errorMessage = signError instanceof Error ? signError.message : String(signError);
      
      // Provide more user-friendly error message for Lighthouse issues
      if (errorMessage.includes('Lighthouse')) {
        return {
          success: false,
          error: 'Phantom security system (Lighthouse) blocked this transaction. This is likely because the transaction is too complex or Lighthouse needs more space. Please contact Phantom support.'
        };
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    console.error('❌ Error sending token message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
