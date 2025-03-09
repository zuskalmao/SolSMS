/**
 * This service handles image generation/preparation for token metadata
 * We'll use the pre-existing SMS logo SVG for simplicity and consistent branding
 */

// SVG logo for SMS token
const SMS_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="#2e1a47" rx="400" ry="400"/>
  <path d="M600 350 Q 600 250 500 250 L 300 250 Q 200 250 200 350 L 200 450 Q 200 550 300 550 L 450 550 L 600 650 L 600 550 L 600 350 Z" fill="#ffffff"/>
  <text x="400" y="435" font-family="Arial, sans-serif" font-size="170" font-weight="bold" text-anchor="middle" fill="#6341a8">sms</text>
</svg>`;

/**
 * Get the SMS logo as a Blob
 * This is useful when needing to upload the logo to IPFS
 * 
 * @returns {Promise<Blob>} The logo as a Blob
 */
export async function getSmsLogoAsBlob(): Promise<Blob> {
  const blob = new Blob([SMS_LOGO_SVG], { type: 'image/svg+xml' });
  return blob;
}

/**
 * Get the SMS logo as a base64 data URL
 * This is useful for displaying in the UI
 * 
 * @returns {string} The logo as a base64 data URL
 */
export function getSmsLogoAsDataUrl(): string {
  const base64 = btoa(SMS_LOGO_SVG);
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Create an object URL for the SMS logo
 * This is useful for local preview
 * 
 * @returns {Promise<string>} The object URL for the logo
 */
export async function createSmsLogoObjectUrl(): Promise<string> {
  const blob = await getSmsLogoAsBlob();
  return URL.createObjectURL(blob);
}
