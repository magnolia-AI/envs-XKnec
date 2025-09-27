'use server';

import sharp from 'sharp';

// This function processes the image by adding a white background
export async function processImageWithWhiteBackground(fileBuffer: ArrayBuffer, filename: string) {
  try {
    // Convert the image to have a white background
    // This flattens any transparency and composites the image onto a white background
    const processedImageBuffer = await sharp(fileBuffer)
      .flatten({ background: '#FFFFFF' }) // Add white background
      .png() // Convert to PNG format
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

