import {
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import BN from 'bn.js';

// Metaplex Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Custom token logo URL - using IPFS gateway URL instead of IPFS format
// Changed to use gateway URL instead of IPFS protocol to improve compatibility
export const TOKEN_LOGO_URL = "https://brown-worthwhile-guanaco-166.mypinata.cloud/ipfs/bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe";

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

// Create instruction to initialize token metadata - fixed to ensure proper logo display
export function createTokenMetadataInstruction(
  metadataAccount: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  tokenName: string,  // Message as token name
  tokenSymbol: string  // Subject as token symbol
): TransactionInstruction {
  console.log('Creating token metadata with message as name:', tokenName);
  console.log('Using logo URL:', TOKEN_LOGO_URL);
  
  // Create a simplified metadata structure
  const metadata = {
    name: tokenName,
    symbol: tokenSymbol,
    uri: TOKEN_LOGO_URL,  // Using the gateway URL instead of IPFS format
    sellerFeeBasisPoints: 0,
  };
  
  // Prepare data for the instruction - using more precise buffer layout
  const dataBuffer = Buffer.alloc(679); // Size of the data structure
  
  // Write data to buffer using a more precise approach
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
  
  // URI (String) - using the gateway URL format
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
  
  // Set up the keys for the instruction - important to include all required signers
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
    data: dataBuffer.slice(0, cursor),
  });
}
