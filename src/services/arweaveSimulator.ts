/**
 * This file simulates Arweave storage since we cannot use actual Arweave in this environment.
 * In a production app, you would use a real storage solution like Arweave or IPFS.
 */

// In-memory storage map to simulate Arweave
const storedFiles = new Map<string, string>();

/**
 * Upload an image to our simulated storage and return a URL
 */
export async function uploadImage(imageDataUrl: string): Promise<string> {
  // Generate a random ID for the image
  const id = Math.random().toString(36).substring(2, 15);
  
  // Store the dataURL in our in-memory storage
  storedFiles.set(id, imageDataUrl);
  
  // Return a simulated Arweave URL
  // In production, this would be a real Arweave URL
  return `https://arweave.net/${id}`;
}

/**
 * Upload metadata to our simulated storage and return a URL
 */
export async function uploadMetadata(metadata: any): Promise<string> {
  // Generate a random ID for the metadata
  const id = Math.random().toString(36).substring(2, 15);
  
  // Store the JSON metadata in our in-memory storage
  storedFiles.set(id, JSON.stringify(metadata));
  
  // Return a simulated Arweave URL
  return `https://arweave.net/${id}`;
}

/**
 * Get a file from our simulated storage
 * This is used for testing purposes
 */
export async function getFile(id: string): Promise<string | undefined> {
  return storedFiles.get(id);
}
