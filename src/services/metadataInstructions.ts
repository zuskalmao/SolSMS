import {
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import { getStaticSmsLogo } from './pinataService';

// Metaplex Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// These will be set from the static logo info
let TOKEN_IMAGE_URL = "";
let TOKEN_METADATA_URL = "";
let TOKEN_IMAGE_GATEWAY_URL = "";
let TOKEN_METADATA_GATEWAY_URL = "";

// Initialize the token image URLs - should be called early in the application lifecycle
export async function initializeTokenImageUrls() {
  try {
    // Use the static logo instead of uploading
    const result = await getStaticSmsLogo();
    
    TOKEN_IMAGE_URL = result.ipfsUrl;
    TOKEN_IMAGE_GATEWAY_URL = result.gatewayUrl;
    
    console.log('📊 Initialized token image URLs:');
    console.log('IPFS URL:', TOKEN_IMAGE_URL);
    console.log('Gateway URL:', TOKEN_IMAGE_GATEWAY_URL);
    
    return result;
  } catch (error) {
    console.error('Failed to initialize token image URLs:', error);
    // Use the static URL directly if there's an error
    TOKEN_IMAGE_URL = "ipfs://bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe";
    TOKEN_IMAGE_GATEWAY_URL = "https://brown-worthwhile-guanaco-166.mypinata.cloud/ipfs/bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe";
    return {
      ipfsUrl: TOKEN_IMAGE_URL,
      gatewayUrl: TOKEN_IMAGE_GATEWAY_URL,
      ipfsHash: "bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe"
    };
  }
}

// Function to derive metadata account address
export async function getMetadataAddress(mint: PublicKey): Promise<PublicKey> {
  const [metadataAddress] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  
  return metadataAddress;
}

// Set the metadata URL for a specific token
export function setTokenMetadataUrl(metadataUrl: string, gatewayUrl: string) {
  TOKEN_METADATA_URL = metadataUrl;
  TOKEN_METADATA_GATEWAY_URL = gatewayUrl;
  console.log('Set token metadata URL:', TOKEN_METADATA_URL);
}

// Get the current token image gateway URL (for UI display)
export function getTokenImageGatewayUrl(): string {
  // If not yet initialized, return the static URL directly
  if (!TOKEN_IMAGE_GATEWAY_URL) {
    return "https://brown-worthwhile-guanaco-166.mypinata.cloud/ipfs/bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe";
  }
  return TOKEN_IMAGE_GATEWAY_URL;
}

// Create instruction to initialize token metadata for a fungible SPL token
export function createTokenMetadataInstruction(
  metadataAccount: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  tokenName: string,  // Message as token name
  tokenSymbol: string  // Subject as token symbol
): TransactionInstruction {
  console.log('Creating token metadata with message as name:', tokenName);
  console.log('Using metadata URI:', TOKEN_METADATA_URL);
  
  // Prepare data for the instruction with optimized size
  const dataBuffer = Buffer.alloc(500); // Standard buffer size for metadata
  
  let cursor = 0;
  
  // Write instruction index (33 = CreateMetadataAccountV3)
  dataBuffer.writeUInt8(33, cursor);
  cursor += 1;
  
  // Write the metadata
  // Name (String)
  const nameBuffer = Buffer.from(tokenName);
  const nameLength = Math.min(nameBuffer.length, 32); // Limit to 32 chars
  dataBuffer.writeUInt32LE(nameLength, cursor);
  cursor += 4;
  nameBuffer.copy(dataBuffer, cursor, 0, nameLength);
  cursor += nameLength;
  
  // Symbol (String)
  const symbolBuffer = Buffer.from(tokenSymbol);
  const symbolLength = Math.min(symbolBuffer.length, 10); // Limit to 10 chars
  dataBuffer.writeUInt32LE(symbolLength, cursor);
  cursor += 4;
  symbolBuffer.copy(dataBuffer, cursor, 0, symbolLength);
  cursor += symbolLength;
  
  // URI (String) - using IPFS metadata URL
  const uriBuffer = Buffer.from(TOKEN_METADATA_URL);
  const uriLength = Math.min(uriBuffer.length, 200);
  dataBuffer.writeUInt32LE(uriLength, cursor);
  cursor += 4;
  uriBuffer.copy(dataBuffer, cursor, 0, uriLength);
  cursor += uriLength;
  
  // Seller fee basis points (u16)
  dataBuffer.writeUInt16LE(0, cursor); // 0% royalty
  cursor += 2;
  
  // Creator array (Option<Vec<Creator>>)
  dataBuffer.writeUInt8(0, cursor); // Option::None (no creators)
  cursor += 1;
  
  // Collection (Option<Collection>)
  dataBuffer.writeUInt8(0, cursor); // Option::None (no collection)
  cursor += 1;
  
  // Uses (Option<Uses>)
  dataBuffer.writeUInt8(0, cursor); // Option::None (no uses)
  cursor += 1;
  
  // Is mutable (bool)
  dataBuffer.writeUInt8(1, cursor); // true
  cursor += 1;
  
  // Collection details (Option<CollectionDetails>)
  dataBuffer.writeUInt8(0, cursor); // Option::None (no collection details)
  cursor += 1;
  
  // TOKEN STANDARD - This is crucial for SPL Token vs NFT distinction
  // 0 = NonFungible, 1 = FungibleAsset, 2 = Fungible, 3 = NonFungibleEdition
  dataBuffer.writeUInt8(1, cursor); // 2 = Fungible (Standard SPL Token)
  cursor += 1;
  
  // Set up the keys for the instruction - optimized for SPL tokens
  const keys = [
    { pubkey: metadataAccount, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: mintAuthority, isSigner: true, isWritable: false }, // Update authority
    { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }, // System program
    { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false }, // SPL Token program
  ];
  
  console.log('Metadata instruction data length:', cursor);
  
  return new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: dataBuffer.slice(0, cursor), // Only use exactly what we need
  });
}
