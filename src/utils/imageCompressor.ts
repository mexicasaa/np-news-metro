/**
 * Image Compressor & Optimizer
 * Converts uploaded photos to lightweight, high-fidelity Base64 DataURLs.
 * Prevents LocalStorage QuotaExceededError and ensures lightning-fast rendering.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export const compressImageFile = (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1280,
    maxHeight = 960,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('Empty image file'));
        return;
      }

      // If it's a small SVG or GIF, don't recompress via canvas
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        resolve(src);
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Scale down maintaining aspect ratio
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to lightweight Base64 DataURL
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression failed, falling back to original DataURL:', err);
          resolve(src);
        }
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
};

export const compressAvatarFile = (file: File): Promise<string> => {
  return compressImageFile(file, {
    maxWidth: 320,
    maxHeight: 320,
    quality: 0.85,
    mimeType: 'image/jpeg',
  });
};
