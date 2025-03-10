import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Function to derive metadata account address
export async function getMetadataAddress(mint: PublicKey): Promise<PublicKey> {
  const metadataBytes = new TextEncoder().encode('metadata');
  
  const [metadataAddress] = await PublicKey.findProgramAddress(
    [
      metadataBytes,
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return metadataAddress;
}

// Create metadata instruction using a simpler approach
export function createNFTMetadataInstruction(
  metadataAddress: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  uri: string
): TransactionInstruction {
  // Required accounts according to Metaplex docs
  const accounts = [
    { pubkey: metadataAddress, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: mintAuthority, isSigner: false, isWritable: false }, // Update authority (same as mint authority)
    { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }, // System Program
    { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false }, // Token Program
  ];

  // Name and symbol with proper padding
  const name = "SMS Message NFT";
  const symbol = "SMS";
  
  // Fixed length buffers for name and symbol
  const nameBuffer = Buffer.alloc(32);
  const symbolBuffer = Buffer.alloc(10);
  
  // Write name and symbol to buffers with padding
  nameBuffer.write(name);
  symbolBuffer.write(symbol);
  
  // Create metadata
  const nameLength = Math.min(name.length, 32);
  const symbolLength = Math.min(symbol.length, 10);
  const uriLength = Math.min(uri.length, 200);
  
  // Calculate total size for instruction data
  const instructionDataSize = 
    4 + // discriminator
    4 + nameLength +
    4 + symbolLength +
    4 + uriLength +
    2 + // seller fee basis points
    1 + // creator option
    1 + // creators length
    32 + // creator address
    1 + // creator verified
    1 + // creator share
    1 + // collection option
    1 + // uses option
    1 + // collection details option
    1;  // is mutable
  
  // Allocate buffer for instruction data
  const instructionData = Buffer.alloc(instructionDataSize);
  let offset = 0;
  
  // Write discriminator for CreateMetadataAccountV3 (0x21)
  instructionData.writeUInt8(0x21, offset);
  offset += 1;
  instructionData.writeUInt8(0, offset);
  offset += 1;
  instructionData.writeUInt8(0, offset);
  offset += 1;
  instructionData.writeUInt8(0, offset);
  offset += 1;
  
  // Write name
  instructionData.writeUInt32LE(nameLength, offset);
  offset += 4;
  Buffer.from(name.slice(0, nameLength)).copy(instructionData, offset);
  offset += nameLength;
  
  // Write symbol
  instructionData.writeUInt32LE(symbolLength, offset);
  offset += 4;
  Buffer.from(symbol.slice(0, symbolLength)).copy(instructionData, offset);
  offset += symbolLength;
  
  // Write URI
  instructionData.writeUInt32LE(uriLength, offset);
  offset += 4;
  Buffer.from(uri.slice(0, uriLength)).copy(instructionData, offset);
  offset += uriLength;
  
  // Write seller fee basis points (0)
  instructionData.writeUInt16LE(0, offset);
  offset += 2;
  
  // Write creator option (true)
  instructionData.writeUInt8(1, offset);
  offset += 1;
  
  // Write creators length (1)
  instructionData.writeUInt8(1, offset);
  offset += 1;
  
  // Write creator address
  mintAuthority.toBuffer().copy(instructionData, offset);
  offset += 32;
  
  // Write creator verified (true)
  instructionData.writeUInt8(1, offset);
  offset += 1;
  
  // Write creator share (100%)
  instructionData.writeUInt8(100, offset);
  offset += 1;
  
  // Write collection option (false)
  instructionData.writeUInt8(0, offset);
  offset += 1;
  
  // Write uses option (false)
  instructionData.writeUInt8(0, offset);
  offset += 1;
  
  // Write collection details option (false)
  instructionData.writeUInt8(0, offset);
  offset += 1;
  
  // Write is mutable (true)
  instructionData.writeUInt8(1, offset);
  
  return new TransactionInstruction({
    keys: accounts,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: instructionData
  });
}
