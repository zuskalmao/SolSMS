import axios from 'axios';

// Pinata API Credentials
const PINATA_API_KEY = '16b1dac1ef4154caf266';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMTcwMjEzNi03YWZlLTQ1ZDAtYmI3ZS0yM2ExYjQzNTEzYzciLCJlbWFpbCI6Inp1c2thbWFsb3ZpY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjE2YjFkYWMxZWY0MTU0Y2FmMjY2Iiwic2NvcGVkS2V5U2VjcmV0IjoiODYzNTAyNzM0ZDIyODQ5YWYzZWU3YWU0ZTkyMWExOTFiZjcyNDc3YmUzYjMyZTMxZTcxN2IwOTYzZDc0YzAxOSIsImV4cCI6MTc3MzA5NTE3M30.b4bNRMdmG2T3nvmxXwrJhfa6XQbNm_Z5hwvtRZsSzfM';

// The fixed SMS logo image on IPFS (already uploaded)
export const SMS_LOGO_IPFS_GATEWAY = 'https://ipfs.io/ipfs/bafkreia34wgsqy7ur5a2f2nt3fhz7l3nmw4nrlh47fpp4tele27jzansoe';

// Headers for Pinata API requests using JWT
const headers = {
  'Authorization': `Bearer ${PINATA_JWT}`,
  'Content-Type': 'application/json'
};

/**
 * Creates metadata for the message token and pins it to IPFS - SIMPLIFIED for Blowfish
 */
export async function uploadMetadataToIPFS(tokenName: string, tokenSymbol: string): Promise<string> {
  try {
    // Create basic, predictable metadata for Blowfish compliance
    const metadata = {
      name: tokenName,
      symbol: tokenSymbol,
      description: "Solana Message Token - Safe messaging application",
      image: SMS_LOGO_IPFS_GATEWAY,
      properties: {
        category: "messaging", // Making purpose clear for Blowfish
        source: "SMS Token Messenger" // Identifying application for transparency
      }
    };
    
    // Use Pinata to upload
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    
    const response = await axios.post(url, metadata, { headers });
    
    if (response.status === 200) {
      const ipfsHash = response.data.IpfsHash;
      return `https://ipfs.io/ipfs/${ipfsHash}`; // Using HTTPS format for safety
    } else {
      // Use the fixed SMS logo gateway as fallback
      return SMS_LOGO_IPFS_GATEWAY;
    }
  } catch (error) {
    // On error, use the fixed SMS logo gateway as fallback
    return SMS_LOGO_IPFS_GATEWAY;
  }
}
