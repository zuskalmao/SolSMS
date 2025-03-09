import axios from 'axios';
import { generateMessageImage, dataURLtoFile } from './imageGenerator';

// Pinata API credentials
const PINATA_API_KEY = "16b1dac1ef4154caf266";
const PINATA_API_SECRET = "863502734d22849af3ee7ae4e921a191bf72477be3b32e31e717b0963d74c019";
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMTcwMjEzNi03YWZlLTQ1ZDAtYmI3ZS0yM2ExYjQzNTEzYzciLCJlbWFpbCI6Inp1c2thbWFsb3ZpY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjE2YjFkYWMxZWY0MTU0Y2FmMjY2Iiwic2NvcGVkS2V5U2VjcmV0IjoiODYzNTAyNzM0ZDIyODQ5YWYzZWU3YWU0ZTkyMWExOTFiZjcyNDc3YmUzYjMyZTMxZTcxN2IwOTYzZDc0YzAxOSIsImV4cCI6MTc3MzA5NTE3M30.b4bNRMdmG2T3nvmxXwrJhfa6XQbNm_Z5hwvtRZsSzfM";

// Base URLs for Pinata API
const PINATA_API_URL = "https://api.pinata.cloud";

// Default logo URL to use if we can't generate or upload a custom image
// This is a fallback to ensure tokens always have an image
const DEFAULT_LOGO_IPFS_URL = "ipfs://QmXKrJoZXFVxYfjXH1KgRPU8yhyhvtLyAJd1XbJq9qxHud";
const DEFAULT_LOGO_GATEWAY_URL = "https://ipfs.io/ipfs/QmXKrJoZXFVxYfjXH1KgRPU8yhyhvtLyAJd1XbJq9qxHud";

// Cache for recently uploaded images to avoid duplicates
// Key is message content hash, value is IPFS hash
const imageCache: Record<string, { ipfsUrl: string, gatewayUrl: string }> = {};
const metadataCache: Record<string, { ipfsUrl: string, gatewayUrl: string }> = {};

/**
 * Simple hash function for message caching
 */
function hashMessage(message: string, sender: string): string {
  // Simple hash function for caching purposes
  let hash = 0;
  const str = message + sender;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

/**
 * Upload an image file to IPFS using Pinata
 */
async function uploadImageToPinata(imageFile: File): Promise<{ ipfsUrl: string, gatewayUrl: string }> {
  console.log('📤 Uploading image to IPFS via Pinata...');
  
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Add pinata metadata
    const metadata = JSON.stringify({
      name: `SMS-Message-${Date.now()}`,
      keyvalues: {
        type: 'message-image',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Set pinning options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
      customPinPolicy: {
        regions: [
          {
            id: 'FRA1',
            desiredReplicationCount: 1
          },
          {
            id: 'NYC1',
            desiredReplicationCount: 1
          }
        ]
      }
    });
    formData.append('pinataOptions', pinataOptions);
    
    // Make API request
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data;`,
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    );
    
    if (response.status === 200) {
      const ipfsHash = response.data.IpfsHash;
      console.log('✅ Image uploaded successfully to IPFS with hash:', ipfsHash);
      
      // Return both IPFS and gateway URLs
      return {
        ipfsUrl: `ipfs://${ipfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      };
    } else {
      console.error('❌ Failed to upload image to IPFS:', response.statusText);
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error uploading image to IPFS:', error);
    
    // Fall back to default image if upload fails
    return {
      ipfsUrl: DEFAULT_LOGO_IPFS_URL,
      gatewayUrl: DEFAULT_LOGO_GATEWAY_URL
    };
  }
}

/**
 * Upload JSON metadata to IPFS using Pinata
 */
async function uploadMetadataToPinata(metadata: object): Promise<{ ipfsUrl: string, gatewayUrl: string }> {
  console.log('📤 Uploading metadata to IPFS via Pinata...');
  
  try {
    // Make API request
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    );
    
    if (response.status === 200) {
      const ipfsHash = response.data.IpfsHash;
      console.log('✅ Metadata uploaded successfully to IPFS with hash:', ipfsHash);
      
      // Return both IPFS and gateway URLs
      return {
        ipfsUrl: `ipfs://${ipfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      };
    } else {
      console.error('❌ Failed to upload metadata to IPFS:', response.statusText);
      throw new Error(`Failed to upload metadata: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error uploading metadata to IPFS:', error);
    throw error;
  }
}

/**
 * Generate and upload message image to IPFS
 */
export async function uploadMessageImage(
  message: string,
  sender: string,
  timestamp: number
): Promise<{ ipfsUrl: string, gatewayUrl: string }> {
  console.log('🖼️ Generating message image...');
  
  // Check if this message is already cached
  const messageHash = hashMessage(message, sender);
  if (imageCache[messageHash]) {
    console.log('🔍 Found cached image for this message');
    return imageCache[messageHash];
  }
  
  try {
    // Generate the image
    const imageDataUrl = await generateMessageImage(message, sender, timestamp);
    
    // Convert to file
    const imageFile = dataURLtoFile(
      imageDataUrl, 
      `sms-message-${Date.now()}.png`
    );
    
    // Upload to IPFS
    const result = await uploadImageToPinata(imageFile);
    
    // Cache the result
    imageCache[messageHash] = result;
    
    return result;
  } catch (error) {
    console.error('❌ Error generating or uploading message image:', error);
    
    // Fall back to default image if anything fails
    return {
      ipfsUrl: DEFAULT_LOGO_IPFS_URL,
      gatewayUrl: DEFAULT_LOGO_GATEWAY_URL
    };
  }
}

/**
 * Generate and upload token metadata to IPFS
 * This creates a proper Metaplex-compatible metadata JSON structure
 */
export async function uploadTokenMetadata(
  tokenName: string,
  tokenSymbol: string,
  message: string,
  sender: string,
  recipient: string,
  timestamp: number = Date.now()
): Promise<{ ipfsUrl: string, gatewayUrl: string }> {
  console.log('📑 Generating token metadata...');
  
  // Check if this metadata is already cached
  const metadataHash = hashMessage(`${tokenName}${tokenSymbol}${message}${sender}${recipient}`, timestamp.toString());
  if (metadataCache[metadataHash]) {
    console.log('🔍 Found cached metadata for this message');
    return metadataCache[metadataHash];
  }
  
  try {
    // First, upload the image for this message
    const imageUrls = await uploadMessageImage(message, sender, timestamp);
    
    // Create metadata object following Metaplex standards
    const metadata = {
      name: tokenName,
      symbol: tokenSymbol,
      description: `Message from ${sender.slice(0, 4)}...${sender.slice(-4)} sent on ${new Date(timestamp).toLocaleString()}`,
      image: imageUrls.ipfsUrl, // Use IPFS URL for image reference
      external_url: "https://smstoken.com",
      attributes: [
        {
          trait_type: "Token Type",
          value: "Message"
        },
        {
          trait_type: "Sender",
          value: sender
        },
        {
          trait_type: "Recipient",
          value: recipient
        },
        {
          trait_type: "Timestamp",
          value: timestamp.toString()
        },
        {
          trait_type: "Message",
          value: message.length > 50 ? message.substring(0, 47) + "..." : message
        }
      ],
      properties: {
        files: [
          {
            uri: imageUrls.ipfsUrl,
            type: "image/png"
          }
        ],
        category: "image",
        creators: []
      }
    };
    
    // Upload metadata to IPFS
    const result = await uploadMetadataToPinata(metadata);
    
    // Cache the result
    metadataCache[metadataHash] = result;
    
    return result;
  } catch (error) {
    console.error('❌ Error generating or uploading token metadata:', error);
    throw error;
  }
}

/**
 * Export gateway URL for the default logo, for UI usage
 */
export const DEFAULT_TOKEN_LOGO_URL = DEFAULT_LOGO_GATEWAY_URL;
