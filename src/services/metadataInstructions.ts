import {
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import { SMS_LOGO_IPFS_GATEWAY } from './pinataService';

// Metaplex Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Using IPFS gateway URL for UI display
export const TOKEN_LOGO_GATEWAY_URL = SMS_LOGO_IPFS_GATEWAY;

// Function to derive metadata account address - standard Metaplex pattern
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

// Create metadata instruction - MAXIMALLY SIMPLIFIED for Blowfish compliance
export function createTokenMetadataInstruction(
  metadataAccount: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  tokenName: string,  
  tokenSymbol: string,  
  metadataUri: string   
): TransactionInstruction {
  // Strictly limit to minimum required fields
  const dataBuffer = Buffer.alloc(200); // Even smaller buffer
  
  let cursor = 0;
  
  // Instruction index (33 = CreateMetadataAccountV3)
  dataBuffer.writeUInt8(33, cursor);
  cursor += 1;
  
  // Name - severely limited for safety
  const nameBuffer = Buffer.from(tokenName);
  const nameLength = Math.min(nameBuffer.length, 30); // Less than 32
  dataBuffer.writeUInt32LE(nameLength, cursor);
  cursor += 4;
  nameBuffer.copy(dataBuffer, cursor, 0, nameLength);
  cursor += nameLength;
  
  // Symbol - severely limited for safety
  const symbolBuffer = Buffer.from(tokenSymbol);
  const symbolLength = Math.min(symbolBuffer.length, 8); // Less than 10
  dataBuffer.writeUInt32LE(symbolLength, cursor);
  cursor += 4;
  symbolBuffer.copy(dataBuffer, cursor, 0, symbolLength);
  cursor += symbolLength;
  
  // URI - severely limited for safety
  const uriBuffer = Buffer.from(metadataUri);
  const uriLength = Math.min(uriBuffer.length, 80); // Even shorter
  dataBuffer.writeUInt32LE(uriLength, cursor);
  cursor += 4;
  uriBuffer.copy(dataBuffer, cursor, 0, uriLength);
  cursor += uriLength;
  
  // Seller fee basis points - always 0
  dataBuffer.writeUInt16LE(0, cursor);
  cursor += 2;
  
  // All options set to None - minimal data
  dataBuffer.writeUInt8(0, cursor); // No creators
  cursor += 1;
  dataBuffer.writeUInt8(0, cursor); // No collection
  cursor += 1;
  dataBuffer.writeUInt8(0, cursor); // No uses
  cursor += 1;
  
  // Is mutable
  dataBuffer.writeUInt8(1, cursor);
  cursor += 1;
  
  // No collection details
  dataBuffer.writeUInt8(0, cursor);
  cursor += 1;
  
  // Minimum required keys - standard Metaplex pattern
  const keys = [
    { pubkey: metadataAccount, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false },
  ];
  
  // Return exactly what we need, no extra bytes
  return new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: dataBuffer.slice(0, cursor),
  });
}
