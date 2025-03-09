import {
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import BN from 'bn.js';

// Metaplex Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Custom token logo URL - now using IPFS URI format
export const TOKEN_LOGO_URL = "ipfs://bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe";

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

// Create instruction to initialize token metadata
export function createTokenMetadataInstruction(
  metadataAccount: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  tokenName: string,  // Message as token name
  tokenSymbol: string  // Subject as token symbol
): TransactionInstruction {
  console.log('Creating token metadata with message as name:', tokenName);
  
  // Create a simplified metadata structure
  const metadata = {
    name: tokenName,
    symbol: tokenSymbol,
    uri: TOKEN_LOGO_URL,  // Using the IPFS URI for the token logo
    sellerFeeBasisPoints: 0,
  };
  
  // Prepare data for the instruction
  const dataBuffer = Buffer.alloc(679); // Size of the data structure
  
  // Write data to buffer
  let cursor = 0;
  
  // Write instruction index (10 = CreateMetadataAccountV3)
  dataBuffer.writeUInt8(33, cursor); // Updated to 33 for CreateMetadataAccountV3
  cursor += 1;
  
  // Write the metadata
  const nameBuffer = Buffer.from(metadata.name);
  const nameLength = nameBuffer.length < 32 ? nameBuffer.length : 32; // Limit to 32 chars
  dataBuffer.writeUInt32LE(nameLength, cursor);
  cursor += 4;
  nameBuffer.copy(dataBuffer, cursor, 0, nameLength);
  cursor += nameLength;
  
  const symbolBuffer = Buffer.from(metadata.symbol);
  const symbolLength = symbolBuffer.length < 10 ? symbolBuffer.length : 10; // Limit to 10 chars
  dataBuffer.writeUInt32LE(symbolLength, cursor);
  cursor += 4;
  symbolBuffer.copy(dataBuffer, cursor, 0, symbolLength);
  cursor += symbolLength;
  
  const uriBuffer = Buffer.from(metadata.uri);
  const uriLength = uriBuffer.length < 200 ? uriBuffer.length : 200; // Limit URI length
  dataBuffer.writeUInt32LE(uriLength, cursor);
  cursor += 4;
  uriBuffer.copy(dataBuffer, cursor, 0, uriLength);
  cursor += uriLength;
  
  // Seller fee basis points (0)
  dataBuffer.writeUInt16LE(metadata.sellerFeeBasisPoints, cursor);
  cursor += 2;
  
  // Creator array length (0 = no creators)
  dataBuffer.writeUInt8(0, cursor);
  cursor += 1;
  
  // Collection: None
  dataBuffer.writeUInt8(0, cursor); // No collection
  cursor += 1;
  
  // Uses: None
  dataBuffer.writeUInt8(0, cursor); // No uses
  cursor += 1;
  
  // Is mutable (true)
  dataBuffer.writeUInt8(1, cursor);
  cursor += 1;
  
  // Collection details: None
  dataBuffer.writeUInt8(0, cursor);
  cursor += 1;
  
  // Create instruction with prepared data
  const keys = [
    { pubkey: metadataAccount, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false },
  ];
  
  return new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: dataBuffer.slice(0, cursor),
  });
}
