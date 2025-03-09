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
  createBurnInstruction,
  getAccount,
  getMint
} from '@solana/spl-token';
import { getMetadataAddress, createTokenMetadataInstruction } from './metadataInstructions';
import { uploadMetadata } from './arweaveSimulator';

// Token mint address for HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump
const TOKEN_MINT_ADDRESS = new PublicKey('HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump');
const TOKEN_MINT_ADDRESS_STRING = 'HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump';

// Number of tokens to burn per message (in whole tokens)
// REDUCED FOR TESTING - will change back to 10000 later
const TOKENS_TO_BURN = 100; // Reduced to 100 tokens for testing

// Token decimals - SMS token has 9 decimals
const TOKEN_DECIMALS = 9;

// Calculate burn amount in raw units (TOKENS_TO_BURN * 10^TOKEN_DECIMALS)
const BURN_AMOUNT_RAW = BigInt(TOKENS_TO_BURN) * BigInt(10 ** TOKEN_DECIMALS);

// Number of tokens to mint to recipient (1 quintillion)
// Using BigInt to handle the large number
const TOKENS_TO_MINT_BIGINT = BigInt("1000000000000000000");

// Solana Memo Program ID
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Custom token logo URL - now using IPFS URI format
export const TOKEN_LOGO_URL = "ipfs://bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe";

// For display in the UI, use a gateway URL
export const TOKEN_LOGO_GATEWAY_URL = "https://brown-worthwhile-guanaco-166.mypinata.cloud/ipfs/bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe";

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
    
    // Create a new transaction
    const transaction = new Transaction();
    
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
    
    // Initialize mint instruction with 9 decimals (standard for fungible tokens)
    const initMintInstruction = createInitializeMintInstruction(
      messageTokenMint,
      9, // 9 decimals for standard token (unlike NFT which uses 0)
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
    
    // Convert the BigInt to a format that can be used in the instruction
    // The SPL token library expects a BigInt or a number that's appropriately sized
    const mintAmount = TOKENS_TO_MINT_BIGINT;
    
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
    const createMetadataInstruction = createTokenMetadataInstruction(
      metadataAddress,
      messageTokenMint,
      wallet.publicKey,
      wallet.publicKey,
      sanitizedMessage, // Message as token name
      sanitizedSymbol   // Subject as token symbol
    );
    
    // Create simplified memo instruction with message data
    const essentialMessageData = JSON.stringify({
      m: message, // Full message in memo (not truncated)
      t: Date.now(),
      s: wallet.publicKey.toString().substring(0, 10) + '...',
      r: recipientPublicKey.toString().substring(0, 10) + '...'
    });
    
    // Create memo instruction with message data
    const memoInstruction = {
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(essentialMessageData)
    };
    
    // Add all instructions to the transaction
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
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Partially sign with the message token mint keypair
    console.log('✍️ Partially signing transaction with token mint keypair...');
    transaction.partialSign(messageTokenMintKeypair);
    
    // Request wallet signature from the user
    console.log('🖋️ Requesting wallet signature...');
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send the transaction
    console.log('📡 Sending transaction to network...');
    const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
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
