import {
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import { uploadAndCacheSmsLogo } from './pinataService';

// Metaplex Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// These will be dynamically set during runtime from Pinata uploads
let TOKEN_IMAGE_URL = "";
let TOKEN_METADATA_URL = "";
let TOKEN_IMAGE_GATEWAY_URL = "";
let TOKEN_METADATA_GATEWAY_URL = "";

// Initialize the token image URLs - should be called early in the application lifecycle
export async function initializeTokenImageUrls() {
  try {
    const result = await uploadAndCacheSmsLogo();
    
    TOKEN_IMAGE_URL = result.ipfsUrl;
    TOKEN_IMAGE_GATEWAY_URL = result.gatewayUrl;
    
    console.log('📊 Initialized token image URLs:');
    console.log('IPFS URL:', TOKEN_IMAGE_URL);
    console.log('Gateway URL:', TOKEN_IMAGE_GATEWAY_URL);
    
    return result;
  } catch (error) {
    console.error('Failed to initialize token image URLs:', error);
    // Fallback to hardcoded URLs if upload fails
    TOKEN_IMAGE_URL = "ipfs://QmXKrJoZXFVxYfjXH1KgRPU8yhyhvtLyAJd1XbJq9qxHud";
    TOKEN_IMAGE_GATEWAY_URL = "https://ipfs.io/ipfs/QmXKrJoZXFVxYfjXH1KgRPU8yhyhvtLyAJd1XbJq9qxHud";
    return {
      ipfsUrl: TOKEN_IMAGE_URL,
      gatewayUrl: TOKEN_IMAGE_GATEWAY_URL,
      ipfsHash: ""
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
  return TOKEN_IMAGE_GATEWAY_URL;
}

// Create instruction to initialize token metadata with optimized buffer usage
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
  
  // Create a simplified metadata structure following Metaplex standards exactly
  const metadata = {
    name: tokenName,
    symbol: tokenSymbol,
    uri: TOKEN_METADATA_URL,  // Using the dynamically set metadata URL
    sellerFeeBasisPoints: 0,
  };
  
  // Prepare data for the instruction with optimized size
  const dataBuffer = Buffer.alloc(500); // Standard buffer size for metadata
  
  let cursor = 0;
  
  // Write instruction index (33 = CreateMetadataAccountV3)
  dataBuffer.writeUInt8(33, cursor);
  cursor += 1;
  
  // Write the metadata
  // Name (String)
  const nameBuffer = Buffer.from(metadata.name);
  const nameLength = Math.min(nameBuffer.length, 32); // Limit to 32 chars
  dataBuffer.writeUInt32LE(nameLength, cursor);
  cursor += 4;
  nameBuffer.copy(dataBuffer, cursor, 0, nameLength);
  cursor += nameLength;
  
  // Symbol (String)
  const symbolBuffer = Buffer.from(metadata.symbol);
  const symbolLength = Math.min(symbolBuffer.length, 10); // Limit to 10 chars
  dataBuffer.writeUInt32LE(symbolLength, cursor);
  cursor += 4;
  symbolBuffer.copy(dataBuffer, cursor, 0, symbolLength);
  cursor += symbolLength;
  
  // URI (String) - using IPFS metadata URL
  const uriBuffer = Buffer.from(metadata.uri);
  const uriLength = Math.min(uriBuffer.length, 200);
  dataBuffer.writeUInt32LE(uriLength, cursor);
  cursor += 4;
  uriBuffer.copy(dataBuffer, cursor, 0, uriLength);
  cursor += uriLength;
  
  // Seller fee basis points (u16)
  dataBuffer.writeUInt16LE(metadata.sellerFeeBasisPoints, cursor);
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
  
  // Set up the keys for the instruction - optimized to only include required signers
  const keys = [
    { pubkey: metadataAccount, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: mintAuthority, isSigner: true, isWritable: false }, // Update authority
    { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }, // System program
  ];
  
  // Log the final data for debugging
  console.log('Metadata instruction data length:', cursor);
  
  return new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: dataBuffer.slice(0, cursor), // Only use exactly what we need
  });
}
