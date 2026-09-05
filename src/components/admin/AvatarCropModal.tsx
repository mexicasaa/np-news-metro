import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Check, RotateCw, RotateCcw, ZoomIn, ZoomOut, Crop, 
  User, RefreshCw, AlertCircle
} from 'lucide-react';
import { uploadArticleImage } from '../../services/mediaService';

interface AvatarCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (croppedImageUrl: string) => void;
}

export const AvatarCropModal: React.FC<AvatarCropModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onSave,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  
  // Crop box coordinates (percentages 0-100 relative to rendered image)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, size: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Load image safely
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setIsLoading(true);
    setLoadError(null);
    setRotation(0);
    setZoom(1);
    setCropBox({ x: 10, y: 10, size: 80 });

    let isMounted = true;

    const prepareImage = async () => {
      try {
        if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
          if (isMounted) {
            blobUrlRef.current = imageUrl;
            setIsLoading(false);
          }
          return;
        }

        try {
          const resp = await fetch(imageUrl, { mode: 'cors', cache: 'no-cache' });
          if (resp.ok) {
            const blob = await resp.blob();
            const objectUrl = URL.createObjectURL(blob);
            if (isMounted) {
              blobUrlRef.current = objectUrl;
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {}

        // Fallback to same-origin image proxy
        try {
          const proxyUrl = `/api/image?url=${encodeURIComponent(imageUrl)}&width=1000&quality=95`;
          const resp = await fetch(proxyUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            const objectUrl = URL.createObjectURL(blob);
            if (isMounted) {
              blobUrlRef.current = objectUrl;
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {}

        if (isMounted) {
          blobUrlRef.current = imageUrl;
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setLoadError('Failed to load author photo.');
          setIsLoading(false);
        }
      }
    };

    prepareImage();

    return () => {
      isMounted = false;
      if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [isOpen, imageUrl]);

  const handleRotateLeft = () => setRotation((prev) => (prev - 90) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);

  const handleDragStartCoord = (clientX: number, clientY: number, handle: string | null = null) => {
    setIsDragging(true);
    setActiveHandle(handle);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseDown = (e: React.MouseEvent, handle: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragStartCoord(e.clientX, e.clientY, handle);
  };

  const handleTouchStart = (e: React.TouchEvent, handle: string | null = null) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      handleDragStartCoord(e.touches[0].clientX, e.touches[0].clientY, handle);
    }
  };

  const updateAvatarCropPosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaXPercent = ((clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((clientY - dragStart.y) / rect.height) * 100;

    setCropBox((prev) => {
      let { x, y, size } = prev;

      if (!activeHandle) {
        // Drag entire crop box
        const nextX = Math.max(0, Math.min(100 - size, x + deltaXPercent));
        const nextY = Math.max(0, Math.min(100 - size, y + deltaYPercent));
        return { x: nextX, y: nextY, size };
      }

      // Resize handle (maintain 1:1 aspect ratio)
      const delta = (deltaXPercent + deltaYPercent) / 2;
      if (activeHandle === 'se') {
        size = Math.max(20, Math.min(100 - x, 100 - y, size + delta));
      } else if (activeHandle === 'nw') {
        const nextSize = Math.max(20, Math.min(x + size, y + size, size - delta));
        const diff = size - nextSize;
        x = Math.max(0, x + diff);
        y = Math.max(0, y + diff);
        size = nextSize;
      }

      return { x, y, size };
    });

    setDragStart({ x: clientX, y: clientY });
  }, [dragStart, activeHandle]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    updateAvatarCropPosition(e.clientX, e.clientY);
  }, [isDragging, updateAvatarCropPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    if (e.cancelable) e.preventDefault();
    updateAvatarCropPosition(e.touches[0].clientX, e.touches[0].clientY);
  }, [isDragging, updateAvatarCropPosition]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleDragEnd);
        window.removeEventListener('touchcancel', handleDragEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  const handleSaveAndExport = async () => {
    if (!imageRef.current) return;

    setIsProcessing(true);
    try {
      // Load into full-res image element safely with proxy fallback
      const loadImageElement = async (src: string): Promise<HTMLImageElement> => {
        const isBlobOrData = src.startsWith('blob:') || src.startsWith('data:');
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          if (!isBlobOrData) {
            img.crossOrigin = 'anonymous';
          }
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load image element'));
          img.src = src;
        });
      };

      let fullImg: HTMLImageElement;
      const targetSrc = blobUrlRef.current || imageUrl;

      try {
        fullImg = await loadImageElement(targetSrc);
      } catch (loadErr) {
        // Fallback: fetch via same-origin proxy
        try {
          const proxyUrl = `/api/image?url=${encodeURIComponent(imageUrl)}&width=1000&quality=95`;
          const pResp = await fetch(proxyUrl);
          if (pResp.ok) {
            const pBlob = await pResp.blob();
            const pObjUrl = URL.createObjectURL(pBlob);
            fullImg = await loadImageElement(pObjUrl);
          } else {
            throw new Error('Proxy load failed');
          }
        } catch (proxyErr) {
          throw new Error('Image failed to load in avatar canvas.');
        }
      }

      const naturalW = fullImg.naturalWidth || 800;
      const naturalH = fullImg.naturalHeight || 800;

      // 1. Intermediate canvas for rotation
      const transformCanvas = document.createElement('canvas');
      const isQuarterRotated = Math.abs(rotation % 180) === 90;
      transformCanvas.width = isQuarterRotated ? naturalH : naturalW;
      transformCanvas.height = isQuarterRotated ? naturalW : naturalH;

      const tCtx = transformCanvas.getContext('2d');
      if (!tCtx) throw new Error('Could not get canvas context.');

      tCtx.save();
      tCtx.translate(transformCanvas.width / 2, transformCanvas.height / 2);
      tCtx.rotate((rotation * Math.PI) / 180);
      tCtx.drawImage(fullImg, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
      tCtx.restore();

      // 2. Final 1:1 Avatar Canvas
      const finalCanvas = document.createElement('canvas');
      const outputSize = 512; // Crisp 512x512 avatar
      finalCanvas.width = outputSize;
      finalCanvas.height = outputSize;

      const fCtx = finalCanvas.getContext('2d');
      if (!fCtx) throw new Error('Could not get final canvas context.');

      const cropPxX = (cropBox.x / 100) * transformCanvas.width;
      const cropPxY = (cropBox.y / 100) * transformCanvas.height;
      const cropPxSize = (cropBox.size / 100) * Math.min(transformCanvas.width, transformCanvas.height);

      fCtx.imageSmoothingEnabled = true;
      fCtx.imageSmoothingQuality = 'high';

      fCtx.drawImage(
        transformCanvas,
        cropPxX,
        cropPxY,
        cropPxSize,
        cropPxSize,
        0,
        0,
        outputSize,
        outputSize
      );

      // Export as Blob and upload directly to Cloudflare R2 with SHA-256 deduplication
      await new Promise<void>((resolve, reject) => {
        finalCanvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Canvas export failed to produce avatar image.'));
            return;
          }

          try {
            // Deduplicate: if identical avatar already exists in R2, reuse URL
            const uploadRes = await uploadArticleImage(blob, 'avatars', 'avatar-crop.jpg');
            if (uploadRes.url) {
              onSave(uploadRes.url);
              onClose();
              resolve();
            } else {
              reject(new Error(uploadRes.error || 'Failed to save cropped avatar to Cloudflare R2'));
            }
          } catch (uploadErr) {
            reject(uploadErr);
          }
        }, 'image/jpeg', 0.92);
      });
    } catch (err: any) {
      console.error('Error cropping avatar:', err);
      alert(`Could not crop avatar: ${err?.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl sm:rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[96vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-sm sm:text-base font-bold text-white truncate">
                Crop Author Avatar (अवतार क्रॉप)
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:block sm:block truncate">
                Position and frame author face for bylines and profile cards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas / Viewport */}
        <div className="p-3 sm:p-6 bg-slate-950 flex items-center justify-center relative overflow-hidden h-[36vh] min-h-[200px] sm:min-h-[260px] max-h-[360px] shrink-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs">Loading photo...</span>
            </div>
          ) : loadError ? (
            <div className="text-center text-red-400 text-xs p-4">
              <AlertCircle className="w-7 h-7 mx-auto mb-2" />
              <span>{loadError}</span>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="relative max-w-full max-h-full flex items-center justify-center"
              style={{
                transform: `scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <img
                ref={imageRef}
                src={blobUrlRef.current || imageUrl}
                alt="Author avatar workspace"
                className="max-h-[30vh] sm:max-h-[260px] max-w-full object-contain pointer-events-none rounded-sm"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              />

              {/* Dimmed backdrop */}
              <div 
                className="absolute inset-0 bg-black/60 pointer-events-none"
                style={{
                  clipPath: `polygon(
                    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                    ${cropBox.x}% ${cropBox.y}%,
                    ${cropBox.x}% ${cropBox.y + cropBox.size}%,
                    ${cropBox.x + cropBox.size}% ${cropBox.y + cropBox.size}%,
                    ${cropBox.x + cropBox.size}% ${cropBox.y}%,
                    ${cropBox.x}% ${cropBox.y}%
                  )`,
                }}
              />

              {/* 1:1 Crop Box with Circular Avatar Preview Mask */}
              <div
                onMouseDown={(e) => handleMouseDown(e, null)}
                onTouchStart={(e) => handleTouchStart(e, null)}
                className="absolute border-2 border-amber-400 shadow-[0_0_0_1px_rgba(0,0,0,0.8)] cursor-move transition-shadow touch-none"
                style={{
                  left: `${cropBox.x}%`,
                  top: `${cropBox.y}%`,
                  width: `${cropBox.size}%`,
                  height: `${cropBox.size}%`,
                }}
              >
                {/* Circular Mask Outline */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/80 pointer-events-none shadow-xs" />

                {/* Corner Resize Handles */}
                <div 
                  onMouseDown={(e) => handleMouseDown(e, 'nw')}
                  onTouchStart={(e) => handleTouchStart(e, 'nw')}
                  className="absolute -top-2 -left-2 sm:-top-1.5 sm:-left-1.5 w-4.5 h-4.5 sm:w-3.5 sm:h-3.5 bg-amber-400 border border-slate-900 cursor-nwse-resize rounded-xs touch-none shadow-sm"
                />
                <div 
                  onMouseDown={(e) => handleMouseDown(e, 'se')}
                  onTouchStart={(e) => handleTouchStart(e, 'se')}
                  className="absolute -bottom-2 -right-2 sm:-bottom-1.5 sm:-right-1.5 w-4.5 h-4.5 sm:w-3.5 sm:h-3.5 bg-amber-400 border border-slate-900 cursor-nwse-resize rounded-xs touch-none shadow-sm"
                />

                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white font-mono text-[9px] px-1.5 py-0.2 rounded pointer-events-none whitespace-nowrap">
                  1:1 Avatar Circle
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 space-y-2.5 sm:space-y-3 text-xs overflow-y-auto">
          
          {/* Zoom Slider */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <span>Zoom</span>
              <span className="font-mono text-amber-400">{zoom.toFixed(1)}x</span>
            </span>
            <div className="flex items-center gap-2 flex-1 max-w-[240px]">
              <ZoomOut className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer h-5 py-1"
              />
              <ZoomIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Rotate Actions */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase shrink-0">Rotate:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRotateLeft}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-[10px] sm:text-[11px] flex items-center gap-1 transition-colors cursor-pointer touch-manipulation"
              >
                <RotateCcw className="w-3 h-3 text-slate-300" />
                <span>-90°</span>
              </button>
              <button
                type="button"
                onClick={handleRotateRight}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-[10px] sm:text-[11px] flex items-center gap-1 transition-colors cursor-pointer touch-manipulation"
              >
                <RotateCw className="w-3 h-3 text-slate-300" />
                <span>+90°</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRotation(0);
                  setZoom(1);
                  setCropBox({ x: 10, y: 10, size: 80 });
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md text-[10px] sm:text-[11px] transition-colors cursor-pointer touch-manipulation"
              >
                Reset
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndExport}
            disabled={isProcessing || isLoading}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:bg-slate-700 text-slate-950 font-bold rounded-lg text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Cropping...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>Apply & Save Avatar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
