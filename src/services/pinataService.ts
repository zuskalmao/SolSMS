import axios from 'axios';

// Pinata API Credentials
const PINATA_API_KEY = '16b1dac1ef4154caf266';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMTcwMjEzNi03YWZlLTQ1ZDAtYmI3ZS0yM2ExYjQzNTEzYzciLCJlbWFpbCI6Inp1c2thbWFsb3ZpY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjE2YjFkYWMxZWY0MTU0Y2FmMjY2Iiwic2NvcGVkS2V5U2VjcmV0IjoiODYzNTAyNzM0ZDIyODQ5YWYzZWU3YWU0ZTkyMWExOTFiZjcyNDc3YmUzYjMyZTMxZTcxN2IwOTYzZDc0YzAxOSIsImV4cCI6MTc3MzA5NTE3M30.b4bNRMdmG2T3nvmxXwrJhfa6XQbNm_Z5hwvtRZsSzfM';

// The fixed SMS logo image on IPFS (already uploaded)
export const SMS_LOGO_IPFS_GATEWAY = 'https://ipfs.io/ipfs/bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe';
export const SMS_LOGO_IPFS_URI = 'ipfs://bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe';

// Headers for Pinata API requests using JWT
const headers = {
  'Authorization': `Bearer ${PINATA_JWT}`,
  'Content-Type': 'application/json'
};

/**
 * Creates metadata for the message token and pins it to IPFS
 * @param tokenName The token name (message content)
 * @param tokenSymbol The token symbol (subject)
 * @returns The IPFS URI for the metadata
 */
export async function uploadMetadataToIPFS(tokenName: string, tokenSymbol: string): Promise<string> {
  console.log('📤 Uploading metadata to IPFS for token:', tokenName);
  
  try {
    // Format the metadata according to the required structure
    const metadata = {
      name: tokenName,
      symbol: tokenSymbol,
      description: "Sent via $SMS.",
      image: SMS_LOGO_IPFS_GATEWAY, // Using the gateway URL for better compatibility
      showName: true,
      createdOn: "Solana Message Sender"
    };
    
    console.log('📋 Metadata content:', metadata);
    
    // Pin the metadata to IPFS using Pinata
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    
    const response = await axios.post(url, metadata, { headers });
    
    if (response.status === 200) {
      const ipfsHash = response.data.IpfsHash;
      console.log('✅ Metadata pinned to IPFS with hash:', ipfsHash);
      
      // Create the IPFS URI
      const ipfsUri = `ipfs://${ipfsHash}`;
      console.log('🔗 IPFS URI:', ipfsUri);
      
      return ipfsUri;
    } else {
      throw new Error(`Failed to pin to IPFS: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error uploading metadata to IPFS:', error);
    
    // In case of error, return a fallback URI to prevent the transaction from failing
    // This helps ensure the user doesn't lose their tokens if IPFS upload fails
    console.log('⚠️ Using fallback metadata URI');
    return SMS_LOGO_IPFS_URI;
  }
}

/**
 * Converts an IPFS URI to a gateway URL for browser display
 * @param ipfsUri The IPFS URI (ipfs://...)
 * @returns The gateway URL (https://ipfs.io/ipfs/...)
 */
export function ipfsUriToGatewayUrl(ipfsUri: string): string {
  if (!ipfsUri) return '';
  
  if (ipfsUri.startsWith('ipfs://')) {
    return ipfsUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  return ipfsUri;
}
