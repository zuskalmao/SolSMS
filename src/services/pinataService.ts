import axios from 'axios';
import FormData from 'form-data';

// Pinata API credentials
const PINATA_API_KEY = '16b1dac1ef4154caf266';
const PINATA_SECRET_API_KEY = '863502734d22849af3ee7ae4e921a191bf72477be3b32e31e717b0963d74c019';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMTcwMjEzNi03YWZlLTQ1ZDAtYmI3ZS0yM2ExYjQzNTEzYzciLCJlbWFpbCI6Inp1c2thbWFsb3ZpY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjE2YjFkYWMxZWY0MTU0Y2FmMjY2Iiwic2NvcGVkS2V5U2VjcmV0IjoiODYzNTAyNzM0ZDIyODQ5YWYzZWU3YWU0ZTkyMWExOTFiZjcyNDc3YmUzYjMyZTMxZTcxN2IwOTYzZDc0YzAxOSIsImV4cCI6MTc3MzA5NTE3M30.b4bNRMdmG2T3nvmxXwrJhfa6XQbNm_Z5hwvtRZsSzfM';

// Cache for the SMS logo IPFS hash to avoid re-uploading
let SMS_LOGO_IPFS_HASH: string | null = null;
let SMS_LOGO_IPFS_URL: string | null = null;
let SMS_LOGO_GATEWAY_URL: string | null = null;

/**
 * Upload a file to IPFS via Pinata
 * @param {Blob|File} file - The file to upload
 * @param {string} fileName - Name to use for the file
 * @returns {Promise<{ipfsHash: string, ipfsUrl: string, gatewayUrl: string}>} IPFS hash and URLs
 */
export async function uploadFileToPinata(file: Blob | File, fileName: string): Promise<{
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
}> {
  try {
    console.log(`🚀 Uploading ${fileName} to Pinata IPFS...`);
    
    const formData = new FormData();
    formData.append('file', file, { filename: fileName });
    
    // Add metadata for better organization in Pinata
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        app: 'SMS Token Messaging',
        type: fileName.endsWith('.json') ? 'metadata' : 'image'
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Configure pinning options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false
    });
    formData.append('pinataOptions', pinataOptions);
    
    // Make the API request
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders()
        }
      }
    );
    
    const ipfsHash = response.data.IpfsHash;
    console.log(`✅ Successfully uploaded to IPFS with hash: ${ipfsHash}`);
    
    // Construct the IPFS and gateway URLs
    const ipfsUrl = `ipfs://${ipfsHash}`;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    return {
      ipfsHash,
      ipfsUrl,
      gatewayUrl
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('Pinata API response:', error.response.data);
    }
    
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param {object} jsonData - The JSON data to upload
 * @param {string} fileName - Name to use for the JSON file
 * @returns {Promise<{ipfsHash: string, ipfsUrl: string, gatewayUrl: string}>} IPFS hash and URLs
 */
export async function uploadJsonToPinata(jsonData: any, fileName: string): Promise<{
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
}> {
  try {
    console.log(`📦 Uploading JSON metadata to Pinata: ${fileName}`);
    
    // Convert JSON to string
    const jsonString = JSON.stringify(jsonData);
    
    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Upload using the file upload function
    return await uploadFileToPinata(blob, fileName);
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Upload the SMS logo to IPFS (once) and cache the result
 * @returns {Promise<{ipfsHash: string, ipfsUrl: string, gatewayUrl: string}>} IPFS hash and URLs for the logo
 */
export async function uploadAndCacheSmsLogo(): Promise<{
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
}> {
  // Return cached values if available
  if (SMS_LOGO_IPFS_HASH && SMS_LOGO_IPFS_URL && SMS_LOGO_GATEWAY_URL) {
    return {
      ipfsHash: SMS_LOGO_IPFS_HASH,
      ipfsUrl: SMS_LOGO_IPFS_URL,
      gatewayUrl: SMS_LOGO_GATEWAY_URL
    };
  }
  
  try {
    console.log('🔄 Fetching and uploading SMS logo to IPFS...');
    
    // Fetch the logo from public assets
    const response = await fetch('/assets/nft-messaging.svg');
    const logoBlob = await response.blob();
    
    // Upload to Pinata
    const result = await uploadFileToPinata(logoBlob, 'sms-logo.svg');
    
    // Cache the results
    SMS_LOGO_IPFS_HASH = result.ipfsHash;
    SMS_LOGO_IPFS_URL = result.ipfsUrl;
    SMS_LOGO_GATEWAY_URL = result.gatewayUrl;
    
    console.log(`💾 Cached SMS logo IPFS hash: ${SMS_LOGO_IPFS_HASH}`);
    
    return result;
  } catch (error) {
    console.error('Error uploading SMS logo:', error);
    throw new Error(`Failed to upload SMS logo: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate and upload token metadata for a message token
 * @param {string} tokenName - The token name (message)
 * @param {string} tokenSymbol - The token symbol (subject)
 * @returns {Promise<{ipfsUrl: string, gatewayUrl: string}>} URLs for the uploaded metadata
 */
export async function createAndUploadTokenMetadata(
  tokenName: string,
  tokenSymbol: string
): Promise<{
  ipfsUrl: string;
  gatewayUrl: string;
}> {
  try {
    console.log(`🏗️ Creating metadata for token: ${tokenName} (${tokenSymbol})`);
    
    // First, ensure the logo is uploaded and get its IPFS URL
    const logoResult = await uploadAndCacheSmsLogo();
    
    // Create the metadata JSON object following Metaplex standards
    const metadata = {
      name: tokenName,
      symbol: tokenSymbol,
      description: `Message token created with $SMS token messaging service`,
      image: logoResult.ipfsUrl, // Use the IPFS URL for the image
      external_url: "https://smstoken.com",
      attributes: [
        {
          trait_type: "Token Type",
          value: "Message"
        },
        {
          trait_type: "Created With",
          value: "SMS Token Messaging"
        },
        {
          trait_type: "Timestamp",
          value: Date.now().toString()
        }
      ],
      properties: {
        files: [
          {
            uri: logoResult.ipfsUrl,
            type: "image/svg+xml"
          }
        ],
        category: "image",
        creators: []
      }
    };
    
    // Create a unique filename for this token's metadata
    const fileName = `${tokenSymbol.toLowerCase()}-${Date.now()}.json`;
    
    // Upload the metadata JSON
    const result = await uploadJsonToPinata(metadata, fileName);
    
    console.log(`✅ Metadata uploaded successfully to ${result.ipfsUrl}`);
    
    return {
      ipfsUrl: result.ipfsUrl,
      gatewayUrl: result.gatewayUrl
    };
  } catch (error) {
    console.error('Error creating and uploading token metadata:', error);
    throw new Error(`Failed to create token metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}
