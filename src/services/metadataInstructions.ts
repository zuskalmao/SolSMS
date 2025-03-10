import {
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import BN from 'bn.js';
import { SMS_LOGO_IPFS_GATEWAY } from './pinataService';

// Metaplex Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Using IPFS gateway URL for UI display (since browsers can't directly display ipfs:// links)
export const TOKEN_LOGO_GATEWAY_URL = SMS_LOGO_IPFS_GATEWAY;

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

// Create instruction to initialize token metadata with dynamically generated metadata URI
export function createTokenMetadataInstruction(
  metadataAccount: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  tokenName: string,  // Message as token name
  tokenSymbol: string,  // Subject as token symbol
  metadataUri: string   // IPFS URL to the metadata JSON
): TransactionInstruction {
  console.log('Creating token metadata with message as name:', tokenName);
  console.log('Using metadata URI:', metadataUri);
  
  // First creator is hardcoded to the payer for simplicity
  const creatorAddress = payer;
  
  // Prepare data for the instruction with optimized size
  const dataBuffer = Buffer.alloc(500); // Standard buffer size for metadata
  
  let cursor = 0;
  
  // Write instruction index (33 = CreateMetadataAccountV3)
  dataBuffer.writeUInt8(33, cursor);
  cursor += 1;
  
  // Write the metadata data
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
  
  // URI (String) - using HTTPS URL for the metadata JSON (gateway URL)
  const uriBuffer = Buffer.from(metadataUri);
  const uriLength = Math.min(uriBuffer.length, 200);
  dataBuffer.writeUInt32LE(uriLength, cursor);
  cursor += 4;
  uriBuffer.copy(dataBuffer, cursor, 0, uriLength);
  cursor += uriLength;
  
  // Seller fee basis points (u16)
  dataBuffer.writeUInt16LE(0, cursor); // 0% royalty
  cursor += 2;
  
  // Creator array (Option<Vec<Creator>>)
  dataBuffer.writeUInt8(1, cursor); // Option::Some - We DO have creators
  cursor += 1;
  
  // Number of creators
  dataBuffer.writeUInt32LE(1, cursor); // Only one creator
  cursor += 4;
  
  // Creator 1 - the payer/sender
  const creatorAddressBuffer = creatorAddress.toBuffer();
  creatorAddressBuffer.copy(dataBuffer, cursor);
  cursor += 32;
  
  // Creator 1 - verified (bool) - not verified
  dataBuffer.writeUInt8(0, cursor);
  cursor += 1;
  
  // Creator 1 - share (u8) - 100%
  dataBuffer.writeUInt8(100, cursor);
  cursor += 1;
  
  // Collection (Option<Collection>)
  dataBuffer.writeUInt8(0, cursor); // Option::None (no collection)
  cursor += 1;
  
  // Uses (Option<Uses>)
  dataBuffer.writeUInt8(0, cursor); // Option::None (no uses)
  cursor += 1;
  
  // Is mutable (bool) - IMPORTANT: Set to 0 (false) to match example
  dataBuffer.writeUInt8(0, cursor); // false - not mutable
  cursor += 1;
  
  // Collection details (Option<CollectionDetails>)
  dataBuffer.writeUInt8(0, cursor); // Option::None (no collection details)
  cursor += 1;
  
  // Token Standard - IMPORTANT: Set to 2 as in the example
  dataBuffer.writeUInt8(1, cursor); // 1 = Option::Some
  cursor += 1;
  dataBuffer.writeUInt8(2, cursor); // 2 = FungibleAsset
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
