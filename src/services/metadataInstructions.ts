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

// Utility function to write a string to a buffer
function writeString(buffer: Buffer, offset: number, string: string): number {
  // Write string length as u32 little-endian
  buffer.writeUInt32LE(string.length, offset);
  offset += 4;
  
  // Write string bytes
  buffer.write(string, offset, string.length, 'utf8');
  offset += string.length;
  
  return offset;
}

// Utility function to write Option<T> to a buffer
function writeOption<T>(
  buffer: Buffer, 
  offset: number, 
  value: T | null,
  writer: (buffer: Buffer, offset: number, value: T) => number
): number {
  if (value === null) {
    // Write None (0)
    buffer.writeUInt8(0, offset);
    offset += 1;
  } else {
    // Write Some (1)
    buffer.writeUInt8(1, offset);
    offset += 1;
    
    // Write the value
    offset = writer(buffer, offset, value);
  }
  
  return offset;
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
  
  // Create the buffer for instruction data
  const buffer = Buffer.alloc(1024); // Buffer large enough for our data
  let offset = 0;
  
  // Write instruction discriminator (10 = CreateMetadataAccountV2)
  // Using V2 instead of V3 as it has better compatibility
  buffer.writeUInt8(10, offset);
  offset += 1;
  
  // Write data struct for Metadata
  
  // Write name
  offset = writeString(buffer, offset, tokenName);
  
  // Write symbol
  offset = writeString(buffer, offset, tokenSymbol);
  
  // Write uri
  offset = writeString(buffer, offset, TOKEN_METADATA_URL);
  
  // Write seller fee basis points (0 for no fees)
  buffer.writeUInt16LE(0, offset);
  offset += 2;
  
  // Write creators option (None)
  buffer.writeUInt8(0, offset);
  offset += 1;
  
  // Write primary sale happened (false)
  buffer.writeUInt8(0, offset);
  offset += 1;
  
  // Write is mutable (false)
  buffer.writeUInt8(0, offset);
  offset += 1;
  
  // Skip optional fields in V2 which don't need to be included
  
  console.log('Metadata instruction data total size:', offset);
  
  // Set up the required accounts for the instruction (for V2 format)
  const keys = [
    { pubkey: metadataAccount, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: mintAuthority, isSigner: true, isWritable: false }, // Update authority
    { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }, // System program
    { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false }, // Rent sysvar
  ];
  
  return new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: buffer.slice(0, offset), // Only use exactly what we need
  });
}
