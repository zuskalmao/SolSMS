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
  createBurnInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createInitializeMintInstruction
} from '@solana/spl-token';
import { getMetadataAddress, createNFTMetadataInstruction } from './metadataInstructions';
import { generateMessageImage, generateMetadata } from './imageGenerator';
import { uploadImage, uploadMetadata } from './arweaveSimulator';

// Token mint address for HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump
const TOKEN_MINT_ADDRESS = new PublicKey('HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump');
const TOKEN_MINT_ADDRESS_STRING = 'HauFsUDmrCgZaExDdUfdp2FC9udFTu7KVWTMPq73pump';

// Number of tokens to burn per message
const TOKENS_TO_BURN = 100;

// Solana Memo Program ID
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export interface NFTMessageParams {
  recipient: string;
  message: string;
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

export async function createNFTMessage({ 
  recipient, 
  message, 
  connection, 
  wallet
}: NFTMessageParams): Promise<{ success: boolean; txId?: string; error?: string }> {
  console.log('📤 Starting transaction to send NFT message');
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
    
    // Step 3: Generate the message image and metadata
    const timestamp = Date.now();
    console.log('🖼️ Generating message image...');
    
    // Generate the message image as data URL
    const imageDataUrl = await generateMessageImage(
      message, 
      wallet.publicKey.toString(), 
      timestamp
    );
    
    // In a real app, we would upload this to Arweave
    // Here we're simulating that with our simulator
    console.log('☁️ Uploading image to storage...');
    const imageUrl = await uploadImage(imageDataUrl);
    
    // Generate metadata and upload it
    console.log('📋 Generating metadata...');
    const metadata = generateMetadata(
      imageUrl,
      message,
      wallet.publicKey.toString(),
      recipientPublicKey.toString(),
      timestamp
    );
    
    console.log('☁️ Uploading metadata to storage...');
    const metadataUrl = await uploadMetadata(metadata);
    
    // PRODUCTION TRANSACTION CODE
    console.log('🚀 Preparing transaction...');
    
    // Create burn instruction
    const burnInstruction = createBurnInstruction(
      senderTokenAccount,
      TOKEN_MINT_ADDRESS,
      wallet.publicKey,
      TOKENS_TO_BURN
    );
    
    // Create a new transaction
    const transaction = new Transaction();
    
    // Add the burn instruction
    transaction.add(burnInstruction);
    
    // Create NFT Mint (generate keypair for the new NFT)
    console.log('🖼️ Creating NFT mint...');
    const nftMintKeypair = Keypair.generate();
    const nftMint = nftMintKeypair.publicKey;
    console.log('🔑 New NFT mint address:', nftMint.toString());
    
    // Get minimum lamports required for NFT mint account
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    
    // Create system instruction to create account for NFT mint
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: nftMint,
      space: 82, // Space for mint account
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID
    });
    
    // Initialize mint instruction
    const initMintInstruction = createInitializeMintInstruction(
      nftMint,
      0, // 0 decimals for NFT
      wallet.publicKey,
      wallet.publicKey,
      TOKEN_PROGRAM_ID
    );
    
    // Find recipient's associated token account for the NFT
    console.log('🔍 Deriving recipient token account...');
    const recipientTokenAccount = await getAssociatedTokenAddress(
      nftMint,
      recipientPublicKey
    );
    console.log('📫 Recipient token account:', recipientTokenAccount.toString());
    
    // Create recipient's associated token account if it doesn't exist
    const createRecipientATAInstruction = createAssociatedTokenAccountInstruction(
      wallet.publicKey, // Payer
      recipientTokenAccount, // Associated token account
      recipientPublicKey, // Owner
      nftMint, // Mint
      TOKEN_PROGRAM_ID
    );
    
    // Mint one token (NFT) to the recipient's token account
    const mintToInstruction = createMintToInstruction(
      nftMint,
      recipientTokenAccount,
      wallet.publicKey,
      1, // Just 1 for NFT
      [],
      TOKEN_PROGRAM_ID
    );
    
    // Create metadata for the NFT using Metaplex
    console.log('📝 Creating NFT metadata...');
    const metadataAddress = await getMetadataAddress(nftMint);
    console.log('📋 Metadata address:', metadataAddress.toString());
    
    // Create metadata instruction using fixed format
    const createMetadataInstruction = createNFTMetadataInstruction(
      metadataAddress,
      nftMint,
      wallet.publicKey,
      wallet.publicKey,
      metadataUrl
    );
    
    // Create memo instruction with the original message data as backup
    const messageData = JSON.stringify({
      message: message,
      sender: wallet.publicKey.toString(),
      recipient: recipientPublicKey.toString(),
      timestamp: timestamp,
      tokensBurned: TOKENS_TO_BURN,
      tokenMint: TOKEN_MINT_ADDRESS_STRING,
      imageUrl: imageUrl,
      metadataUrl: metadataUrl
    });
    
    // Create memo instruction with message data
    const memoInstruction = {
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(messageData)
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
    
    // Partially sign with the NFT mint keypair
    console.log('✍️ Partially signing transaction with NFT mint keypair...');
    transaction.partialSign(nftMintKeypair);
    
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
    console.error('❌ Error sending NFT message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
