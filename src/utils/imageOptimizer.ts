/**
 * High-Performance Client-Side Image Optimizer
 * Downscales and compresses large camera photos (e.g. 5-15MB phone photos)
 * into lightweight, high-fidelity WebP/JPEG images (~200KB-400KB) in milliseconds
 * before upload, eliminating serverless payload limits and mobile lag.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
  fallbackFileName?: string;
}

export interface OptimizedImageResult {
  file: File | Blob;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  isOptimized: boolean;
  originalSize: number;
  optimizedSize: number;
}

/**
 * Optimize an image File or Blob before uploading to R2.
 */
export async function optimizeImageForUpload(
  input: File | Blob,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const originalSize = input.size;
  const originalType = input.type || 'image/jpeg';
  const originalName =
    input instanceof File ? input.name : options.fallbackFileName || `image-${Date.now()}.jpg`;

  // Do not modify SVGs, animated GIFs, or non-images
  if (
    originalType === 'image/svg+xml' ||
    originalType === 'image/gif' ||
    !originalType.startsWith('image/')
  ) {
    return {
      file: input,
      fileName: originalName,
      mimeType: originalType,
      width: 0,
      height: 0,
      isOptimized: false,
      originalSize,
      optimizedSize: originalSize,
    };
  }

  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'image/webp',
  } = options;

  // If running in an environment without DOM/Canvas (e.g. SSR), return input
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      file: input,
      fileName: originalName,
      mimeType: originalType,
      width: 0,
      height: 0,
      isOptimized: false,
      originalSize,
      optimizedSize: originalSize,
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(input);
    const img = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      cleanup();
      // On load failure (e.g. unsupported camera format), return original
      resolve({
        file: input,
        fileName: originalName,
        mimeType: originalType,
        width: 0,
        height: 0,
        isOptimized: false,
        originalSize,
        optimizedSize: originalSize,
      });
    };

    img.onload = async () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // If the image is already small in dimensions and under 600KB, keep original
        if (width <= maxWidth && height <= maxHeight && originalSize < 600 * 1024) {
          cleanup();
          return resolve({
            file: input,
            fileName: originalName,
            mimeType: originalType,
            width,
            height,
            isOptimized: false,
            originalSize,
            optimizedSize: originalSize,
          });
        }

        // Calculate proportional scale down
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
          cleanup();
          return resolve({
            file: input,
            fileName: originalName,
            mimeType: originalType,
            width: img.naturalWidth,
            height: img.naturalHeight,
            isOptimized: false,
            originalSize,
            optimizedSize: originalSize,
          });
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob || blob.size === 0) {
              return resolve({
                file: input,
                fileName: originalName,
                mimeType: originalType,
                width,
                height,
                isOptimized: false,
                originalSize,
                optimizedSize: originalSize,
              });
            }

            // Only use optimized blob if it actually reduced or maintained size
            if (blob.size >= originalSize && width === img.naturalWidth && height === img.naturalHeight) {
              return resolve({
                file: input,
                fileName: originalName,
                mimeType: originalType,
                width,
                height,
                isOptimized: false,
                originalSize,
                optimizedSize: originalSize,
              });
            }

            const extension = format === 'image/webp' ? '.webp' : format === 'image/jpeg' ? '.jpg' : '.png';
            const baseName = originalName.replace(/\.[^/.]+$/, '');
            const newFileName = `${baseName}${extension}`;

            let finalFile: File | Blob = blob;
            if (input instanceof File && typeof File !== 'undefined') {
              try {
                finalFile = new File([blob], newFileName, { type: format });
              } catch {
                finalFile = blob;
              }
            }

            resolve({
              file: finalFile,
              fileName: newFileName,
              mimeType: format,
              width,
              height,
              isOptimized: true,
              originalSize,
              optimizedSize: blob.size,
            });
          },
          format,
          quality
        );
      } catch (err) {
        cleanup();
        console.warn('[ImageOptimizer] Optimization error, using original:', err);
        resolve({
          file: input,
          fileName: originalName,
          mimeType: originalType,
          width: 0,
          height: 0,
          isOptimized: false,
          originalSize,
          optimizedSize: originalSize,
        });
      }
    };

    img.src = objectUrl;
  });
}
