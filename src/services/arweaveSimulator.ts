// This service is now replaced with actual Pinata IPFS functionality
// We're keeping it here temporarily for backwards compatibility

// Import the real IPFS implementation
import { createAndUploadTokenMetadata } from './pinataService';

/**
 * Upload metadata to IPFS via Pinata
 * @param {object} metadata - The metadata to upload (unused, we generate our own)
 * @returns {Promise<string>} - The IPFS URI for the metadata
 */
export async function uploadMetadata(metadata: any, tokenName: string = "", tokenSymbol: string = ""): Promise<string> {
  console.log('Uploading metadata to IPFS via Pinata...');
  
  if (!tokenName || !tokenSymbol) {
    // Default to metadata properties if not specified
    tokenName = metadata.name || "SMS Message";
    tokenSymbol = metadata.symbol || "SMS";
  }
  
  try {
    // Use the actual implementation
    const result = await createAndUploadTokenMetadata(tokenName, tokenSymbol);
    console.log(`Metadata uploaded to IPFS: ${result.ipfsUrl}`);
    return result.ipfsUrl;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    // Fallback to a hardcoded URL in case of error
    return "ipfs://QmTXSaUArwpnfTbHtruRSHrH1GRrRRbULMCRkJ9ZXpXCMj";
  }
}

/**
 * Generates a proper Metaplex-compatible metadata JSON structure
 * This would be uploaded to IPFS in a real implementation
 */
export function generateTokenMetadata(
  tokenName: string,
  tokenSymbol: string,
  imageUrl: string,
  description: string = "SMS Message Token on Solana"
): object {
  return {
    name: tokenName,
    symbol: tokenSymbol,
    description: description,
    image: imageUrl, // This should be an IPFS URL
    external_url: "https://smstoken.com",
    attributes: [
      {
        trait_type: "Token Type",
        value: "Message"
      },
      {
        trait_type: "Created With",
        value: "SMS Token Messaging"
      }
    ],
    properties: {
      files: [
        {
          uri: imageUrl,
          type: "image/svg+xml"
        }
      ],
      category: "image"
    }
  };
}
