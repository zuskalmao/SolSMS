// Client-side image generator for NFT messages
// This creates a canvas element, renders text on it, and returns a data URL

/**
 * Generate an image with the message text styled similar to the preview
 */
export async function generateMessageImage(
  message: string,
  sender: string,
  timestamp: number
): Promise<string> {
  // Create a canvas element to draw on
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions (square format)
  const size = 800;
  canvas.width = size;
  canvas.height = size;
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0F172A'); // dark blue
  gradient.addColorStop(1, '#1E293B'); // slightly lighter blue
  
  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add subtle pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add a glowing border
  ctx.strokeStyle = '#7C3AED'; // primary color
  ctx.lineWidth = 12;
  ctx.shadowColor = '#7C3AED';
  ctx.shadowBlur = 20;
  ctx.strokeRect(20, 20, size - 40, size - 40);
  
  // Add header with SMS logo
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SMS Message NFT', size / 2, 80);
  
  // Draw message icon (purple circle)
  ctx.fillStyle = '#7C3AED';
  ctx.beginPath();
  ctx.arc(size / 2, 130, 30, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw chat icon instead of white rectangle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  
  // Chat bubble coordinates
  const centerX = size / 2;
  const centerY = 130;
  const bubbleWidth = 30;
  const bubbleHeight = 24;
  
  // Draw rounded rectangle for chat bubble
  const radius = 6;
  ctx.beginPath();
  ctx.moveTo(centerX - bubbleWidth/2 + radius, centerY - bubbleHeight/2);
  ctx.lineTo(centerX + bubbleWidth/2 - radius, centerY - bubbleHeight/2);
  ctx.quadraticCurveTo(centerX + bubbleWidth/2, centerY - bubbleHeight/2, centerX + bubbleWidth/2, centerY - bubbleHeight/2 + radius);
  ctx.lineTo(centerX + bubbleWidth/2, centerY + bubbleHeight/2 - radius);
  ctx.quadraticCurveTo(centerX + bubbleWidth/2, centerY + bubbleHeight/2, centerX + bubbleWidth/2 - radius, centerY + bubbleHeight/2);
  ctx.lineTo(centerX - bubbleWidth/2 + radius, centerY + bubbleHeight/2);
  ctx.quadraticCurveTo(centerX - bubbleWidth/2, centerY + bubbleHeight/2, centerX - bubbleWidth/2, centerY + bubbleHeight/2 - radius);
  ctx.lineTo(centerX - bubbleWidth/2, centerY - bubbleHeight/2 + radius);
  ctx.quadraticCurveTo(centerX - bubbleWidth/2, centerY - bubbleHeight/2, centerX - bubbleWidth/2 + radius, centerY - bubbleHeight/2);
  ctx.closePath();
  ctx.fill();
  
  // Add small triangle at the bottom for chat pointer
  ctx.beginPath();
  ctx.moveTo(centerX - 5, centerY + bubbleHeight/2);
  ctx.lineTo(centerX, centerY + bubbleHeight/2 + 6);
  ctx.lineTo(centerX + 5, centerY + bubbleHeight/2);
  ctx.closePath();
  ctx.fill();
  
  // Message box background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(80, 180, size - 160, size - 300);
  
  // Wrap and render message text - now center aligned
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '22px Arial, sans-serif';
  ctx.textAlign = 'center';
  
  // Text wrapping function for center-aligned text
  const wrapText = (text: string, maxWidth: number, lineHeight: number) => {
    const centerX = size / 2;
    const y = 220;
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineCount = 0;
    
    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, centerX, y + (lineCount * lineHeight));
        line = words[n] + ' ';
        lineCount++;
        
        // Prevent too many lines
        if (lineCount > 10) {
          line += '...';
          ctx.fillText(line, centerX, y + (lineCount * lineHeight));
          break;
        }
      } else {
        line = testLine;
      }
    }
    
    // Final line
    if (line.trim() !== '') {
      ctx.fillText(line, centerX, y + (lineCount * lineHeight));
    }
    
    return lineCount;
  };
  
  // Render message with wrapping - using center alignment
  const lineHeight = 30;
  const maxWidth = size - 200;
  
  const lines = wrapText(message, maxWidth, lineHeight);
  
  // Add sender and date info at bottom
  const dateString = new Date(timestamp).toLocaleDateString();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '16px Arial, sans-serif';
  
  // Left-aligned sender info
  ctx.textAlign = 'left';
  ctx.fillText(`From: ${sender.slice(0, 6)}...${sender.slice(-4)}`, 80, size - 80);
  
  // Right-aligned date
  ctx.textAlign = 'right';
  ctx.fillText(dateString, size - 80, size - 80);
  
  // Add a "Powered by SMS" watermark - center aligned
  ctx.font = '14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('Powered by SMS Token', size / 2, size - 40);
  
  // Convert to data URL and return
  return canvas.toDataURL('image/png');
}

/**
 * Convert a Data URL to a File object
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  // Convert base64 to raw binary data
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Generate metadata for the NFT
 */
export function generateMetadata(
  imageUrl: string,
  message: string,
  sender: string,
  recipient: string,
  timestamp: number
) {
  return {
    name: "SMS Message NFT",
    symbol: "SMS",
    description: `Message from ${sender} sent on ${new Date(timestamp).toLocaleString()}`,
    image: imageUrl,
    attributes: [
      { trait_type: 'Sender', value: sender },
      { trait_type: 'Recipient', value: recipient },
      { trait_type: 'Timestamp', value: timestamp.toString() },
      { trait_type: 'Message', value: message }
    ],
    properties: {
      files: [{ uri: imageUrl, type: 'image/png' }],
      category: 'image',
    }
  };
}
