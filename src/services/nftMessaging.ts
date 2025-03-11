import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createInitializeMintInstruction,
  createBurnInstruction
} from '@solana/spl-token';
import { getMetadataAddress, createTokenMetadataInstruction, TOKEN_LOGO_GATEWAY_URL } from './metadataInstructions';
import { uploadMetadataToIPFS, SMS_LOGO_IPFS_GATEWAY } from './pinataService';

// Token mint address for HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump
const TOKEN_MINT_ADDRESS = new PublicKey('HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump');

// Number of tokens to burn per message (in whole tokens)
const TOKENS_TO_BURN = 10000; // Burn 10000 tokens per message

// Token decimals - SMS token has 6 decimals
const TOKEN_DECIMALS = 6;

// Calculate burn amount in raw units (TOKENS_TO_BURN * 10^TOKEN_DECIMALS)
const BURN_AMOUNT_RAW = BigInt(TOKENS_TO_BURN) * BigInt(10 ** TOKEN_DECIMALS);

// Number of tokens to mint to recipient (1 quintillion)
const TOKENS_TO_MINT_BIGINT = BigInt("1000000000000000000");

// For message tokens, use 9 decimals 
const MESSAGE_TOKEN_DECIMALS = 9;

// Export the token logo URL for UI usage
export const TOKEN_LOGO_URL = TOKEN_LOGO_GATEWAY_URL;

export interface TokenMessageParams {
  recipient: string;
  message: string;
  subject: string;
  connection: Connection;
  wallet: any; // WalletContextState from @solana/wallet-adapter-react
}

// Simple token balance check
export async function checkTokenBalance(connection: Connection, walletPublicKey: PublicKey): Promise<number> {
  try {
    const ataAddress = await getAssociatedTokenAddress(
      TOKEN_MINT_ADDRESS,
      walletPublicKey
    );
    
    try {
      const balance = await connection.getTokenAccountBalance(ataAddress);
      return balance.value.uiAmount || 0;
    } catch (error) {
      if (error.message && error.message.includes("could not find account")) {
        return 0;
      }
      return 0;
    }
  } catch (error) {
    return 0;
  }
}

// Standard Phantom provider function - directly from their docs
function getProvider() {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  throw new Error("Phantom wallet not found");
}

export async function createTokenMessage({ 
  recipient, 
  message,
  subject,
  connection, 
  wallet
}: TokenMessageParams): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    if (!wallet.publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    const recipientPublicKey = new PublicKey(recipient);
    
    // Get sender's token account
    const senderTokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT_ADDRESS,
      wallet.publicKey
    );
    
    // Check token balance
    const balance = await checkTokenBalance(connection, wallet.publicKey);
    if (balance < TOKENS_TO_BURN) {
      return {
        success: false,
        error: `Insufficient tokens. You need at least ${TOKENS_TO_BURN} $SMS tokens.`
      };
    }
    
    // Sanitize inputs - limit lengths for Blowfish compliance
    const sanitizedMessage = message.substring(0, 30); // Shorter than 32 for safety
    const sanitizedSymbol = subject.toUpperCase().substring(0, 8); // Shorter than 10 for safety
    
    // Create empty transaction - MAXIMIZING SPACE for Lighthouse/Blowfish
    const transaction = new Transaction();
    
    // FIRST INSTRUCTION: Burn tokens - standard SPL token burn
    const burnInstruction = createBurnInstruction(
      senderTokenAccount,
      TOKEN_MINT_ADDRESS,
      wallet.publicKey,
      BURN_AMOUNT_RAW
    );
    transaction.add(burnInstruction);
    
    // Create a new token mint with a predictable pattern
    const messageTokenMintKeypair = Keypair.generate();
    const messageTokenMint = messageTokenMintKeypair.publicKey;
    
    // Get minimum rent
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    
    // Create account for token mint - standard Solana pattern
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: messageTokenMint,
      space: 82,
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID
    });
    
    // Initialize mint - standard SPL token pattern
    const initMintInstruction = createInitializeMintInstruction(
      messageTokenMint,
      MESSAGE_TOKEN_DECIMALS,
      wallet.publicKey,
      wallet.publicKey
    );
    
    // Get recipient token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      messageTokenMint,
      recipientPublicKey
    );
    
    // Create recipient token account - standard SPL token pattern
    const createRecipientATAInstruction = createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      recipientTokenAccount,
      recipientPublicKey,
      messageTokenMint
    );
    
    // Mint tokens to recipient - standard SPL token pattern
    // Scale for decimals
    const mintAmount = TOKENS_TO_MINT_BIGINT * BigInt(10 ** MESSAGE_TOKEN_DECIMALS);
    const mintToInstruction = createMintToInstruction(
      messageTokenMint,
      recipientTokenAccount,
      wallet.publicKey,
      mintAmount
    );
    
    // Upload metadata - simplified for Blowfish
    let metadataUri;
    try {
      metadataUri = await uploadMetadataToIPFS(sanitizedMessage, sanitizedSymbol);
    } catch (error) {
      // Use a static fallback that's predictable for Blowfish
      metadataUri = SMS_LOGO_IPFS_GATEWAY;
    }
    
    // Create metadata for the token - standard Metaplex pattern
    const metadataAddress = await getMetadataAddress(messageTokenMint);
    const createMetadataInstruction = createTokenMetadataInstruction(
      metadataAddress,
      messageTokenMint,
      wallet.publicKey,
      wallet.publicKey,
      sanitizedMessage,
      sanitizedSymbol,
      metadataUri
    );
    
    // Add instructions in standard order - following typical token creation pattern
    transaction.add(
      createAccountInstruction,
      initMintInstruction,
      createRecipientATAInstruction,
      mintToInstruction,
      createMetadataInstruction
    );
    
    // Set fee payer
    transaction.feePayer = wallet.publicKey;
    
    // Get recent blockhash - using finalized for stability
    const { blockhash } = await connection.getLatestBlockhash("processed");
    transaction.recentBlockhash = blockhash;
    
    // Sign with the mint keypair only
    transaction.partialSign(messageTokenMintKeypair);
    
    // BLOWFISH-COMPLIANT: Use Phantom's signAndSendTransaction exactly as documented
    try {
      const provider = getProvider();
      const { signature } = await provider.signAndSendTransaction(transaction);
      
      // Only do a simple confirmation check
      try {
        await connection.confirmTransaction(signature, 'confirmed');
        return {
          success: true,
          txId: signature,
        };
      } catch (confirmError) {
        // Transaction was sent but confirmation status is unknown
        return {
          success: true,
          txId: signature,
          error: 'Transaction sent, confirmation status unknown'
        };
      }
    } catch (signError) {
      const errorMessage = signError instanceof Error ? signError.message : String(signError);
      
      // Improved error messaging for Blowfish/Lighthouse errors
      if (errorMessage.includes('Lighthouse') || errorMessage.includes('simulated') || errorMessage.includes('Blowfish')) {
        return {
          success: false,
          error: 'Transaction blocked by Phantom security. Please try a shorter message.'
        };
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
