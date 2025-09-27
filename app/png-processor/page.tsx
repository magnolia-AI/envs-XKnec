'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { processImageWithWhiteBackground } from '@/app/actions/image-processing';

interface ProcessedImage {
  id: number;
  originalFile: File;
  processedUrl: string;
  name: string;
  processed: boolean;
}

export default function PNGProcessor() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Filter only PNG files
    const pngFiles = Array.from(files).filter(file => 
      file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
    );

    if (pngFiles.length === 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload only PNG files.',
        variant: 'destructive'
      });
      return;
    }

    // Check if we exceed the limit of 10 images
    if (images.length + pngFiles.length > 10) {
      toast({
        title: 'Too many files',
        description: `You can only process up to 10 images. You currently have ${images.length} images selected.`,
        variant: 'destructive'
      });
      return;
    }

    // Create preview URLs for the new images
    const newImages = pngFiles.map((file, index) => ({
      id: Date.now() + index,
      originalFile: file,
      processedUrl: URL.createObjectURL(file),
      name: file.name,
      processed: false
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: number) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.processedUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const processImages = async () => {
    if (images.length === 0) {
      toast({
        title: 'No images selected',
        description: 'Please upload at least one PNG image to process.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process each image with white background
      const processedImages = await Promise.all(images.map(async (image) => {
        try {
          // Convert file to ArrayBuffer
          const buffer = await image.originalFile.arrayBuffer();
          
          // Process the image
          const result = await processImageWithWhiteBackground(buffer, image.name);
          
          if (result.success) {
            return {
              ...image,
              processedUrl: result.data,
              processed: true
            };
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error(`Error processing image ${image.name}:`, error);
          return {
            ...image,
            processed: false
          };
        }
      }));
      
      setImages(processedImages);
      
      const successful = processedImages.filter(img => img.processed).length;
      const failed = processedImages.length - successful;
      
      if (successful > 0) {
        toast({
          title: 'Images processed',
          description: `Successfully processed ${successful} images.` + (failed > 0 ? ` Failed to process ${failed} images.` : '')
        });
      } else {
        toast({
          title: 'Processing failed',
          description: 'Failed to process all images. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: 'There was an error processing your images. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (url: string, name: string) => {
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = name.replace(/\.[^/.]+$/, '') + '_white_bg.png'; // Replace extension with _white_bg.png
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    if (images.length === 0) {
      toast({
        title: 'No images to download',
        description: 'Please process some images first.',
        variant: 'destructive'
      });
      return;
    }
    
    // Download each processed image
    images.forEach((image, index) => {
      if (image.processed) {
        // Add a small delay between downloads to prevent browser issues
        setTimeout(() => {
          downloadImage(image.processedUrl, image.name);
        }, index * 500);
      }
    });
    
    toast({
      title: 'Download started',
      description: `Downloading ${images.filter(img => img.processed).length} images...`
    });
  };

  const resetAll = () => {
    // Revoke object URLs
    images.forEach(image => {
      if (image.processedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(image.processedUrl);
      }
    });
    setImages([]);
  };

  return (
    <div className="min-h-full py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
              PNG Background Processor
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload up to 10 PNG images and add a white background to each one. Download your processed images individually or all at once.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload PNG Images</CardTitle>
              <CardDescription>
                Select up to 10 PNG files to process. Each image will have a white background added.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".png,image/png"
                  multiple
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 10}
                >
                  Select PNG Files
                </Button>
                <p className="text-sm text-muted-foreground">
                  {images.length} of 10 images selected
                </p>
              </div>
            </CardContent>
          </Card>

          {images.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Selected Images</CardTitle>
                <CardDescription>
                  Your selected images are shown below. Click "Process Images" to add white backgrounds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="w-32 h-32 border rounded-lg overflow-hidden">
                        <img
                          src={image.processedUrl}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${image.name}`}
                      >
                        ×
                      </button>
                      <p className="text-xs mt-1 truncate w-32">{image.name}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={processImages} 
                    disabled={isProcessing}
                    className="flex-1 min-w-[150px]"
                  >
                    {isProcessing ? 'Processing...' : 'Process Images'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetAll}
                    className="flex-1 min-w-[150px]"
                  >
                    Reset All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Images</CardTitle>
                <CardDescription>
                  Download your processed images with white backgrounds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  {images.map((image) => (
                    <div key={`processed-${image.id}`} className="relative group">
                      <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img
                          src={image.processedUrl}
                          alt={`Processed ${image.name}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button
                        onClick={() => downloadImage(image.processedUrl, image.name)}
                        size="sm"
                        className="w-full mt-2"
                        disabled={!image.processed}
                      >
                        {image.processed ? 'Download' : 'Processing...'}
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={downloadAll}
                  className="w-full"
                  disabled={images.filter(img => img.processed).length === 0}
                >
                  Download All Images
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


