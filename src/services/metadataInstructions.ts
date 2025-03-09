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
  
  // Create the buffer for instruction data
  const buffer = Buffer.alloc(2000); // Large buffer to be safe
  let cursor = 0;
  
  // Write instruction discriminator (33 = CreateMetadataAccountV3)
  buffer.writeUInt8(33, cursor);
  cursor += 1;
  
  // Name (string)
  const nameBuffer = Buffer.from(tokenName);
  buffer.writeUInt32LE(nameBuffer.length, cursor);
  cursor += 4;
  nameBuffer.copy(buffer, cursor);
  cursor += nameBuffer.length;
  
  // Symbol (string)
  const symbolBuffer = Buffer.from(tokenSymbol);
  buffer.writeUInt32LE(symbolBuffer.length, cursor);
  cursor += 4;
  symbolBuffer.copy(buffer, cursor);
  cursor += symbolBuffer.length;
  
  // URI (string)
  const uriBuffer = Buffer.from(TOKEN_METADATA_URL);
  buffer.writeUInt32LE(uriBuffer.length, cursor);
  cursor += 4;
  uriBuffer.copy(buffer, cursor);
  cursor += uriBuffer.length;
  
  // Seller fee basis points (u16)
  buffer.writeUInt16LE(0, cursor); // 0 fee
  cursor += 2;
  
  // Creators - Option<Vec<Creator>>
  buffer.writeUInt8(0, cursor); // None (0)
  cursor += 1;
  
  // Collection - Option<Collection>
  buffer.writeUInt8(0, cursor); // None (0)
  cursor += 1;
  
  // Uses - Option<Uses>
  buffer.writeUInt8(0, cursor); // None (0)
  cursor += 1;
  
  // Is mutable - boolean
  buffer.writeUInt8(0, cursor); // false
  cursor += 1;
  
  // Collection details - Option<CollectionDetails>
  buffer.writeUInt8(0, cursor); // None (0)
  cursor += 1;
  
  // Token standard - Option<TokenStandard>
  buffer.writeUInt8(1, cursor); // Some (1)
  cursor += 1;
  buffer.writeUInt8(2, cursor); // 2 = Fungible (not 1 = FungibleAsset)
  cursor += 1;
  
  console.log('Metadata instruction data cursor position:', cursor);
  
  // Set up the required accounts for the instruction
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
    data: buffer.slice(0, cursor), // Only use exactly what we need
  });
}
