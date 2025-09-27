'use server';

import sharp from 'sharp';

// This function processes the image by adding a white background
export async function processImageWithWhiteBackground(fileBuffer: ArrayBuffer, filename: string) {
  try {
    // First, resize the image if it's too large to keep payload manageable
    const sharpInstance = sharp(fileBuffer);
    const metadata = await sharpInstance.metadata();
    
    // Resize if width or height exceeds 2048 pixels to keep file size reasonable
    let processedImage = sharpInstance;
    if (metadata.width && metadata.height) {
      const maxDimension = Math.max(metadata.width, metadata.height);
      if (maxDimension > 2048) {
        const scale = 2048 / maxDimension;
        processedImage = sharpInstance.resize(
          Math.floor(metadata.width * scale),
          Math.floor(metadata.height * scale),
          { fit: 'inside', withoutEnlargement: true }
        );
      }
    }
    
    // Convert the image to have a white background
    // This flattens any transparency and composites the image onto a white background
    const processedImageBuffer = await processedImage
      .flatten({ background: '#FFFFFF' }) // Add white background
      .png({ quality: 90, compressionLevel: 8 }) // Optimize PNG with good quality and compression
      .toBuffer();
    
    // Convert buffer to base64 for returning to client
    const base64Image = processedImageBuffer.toString('base64');
    
    return {
      success: true,
      data: `data:image/png;base64,${base64Image}`,
      filename: filename
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      success: false,
      error: 'Failed to process image'
    };
  }
}


