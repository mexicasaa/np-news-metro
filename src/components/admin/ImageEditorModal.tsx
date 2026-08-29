import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Check, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, 
  ZoomIn, ZoomOut, Sun, Contrast, Droplet, Sparkles, RefreshCw, 
  Crop, Sliders, Wand2, Eye, ShieldCheck, AlertCircle
} from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (editedImageUrl: string) => void;
}

type AspectRatioOption = 'free' | '16:9' | '4:3' | '3:2' | '1:1';
type ActiveTab = 'crop' | 'adjust' | 'filters';

interface FilterPreset {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
}

const FILTER_PRESETS: FilterPreset[] = [
  { id: 'normal', name: 'Original', brightness: 100, contrast: 100, saturation: 100, warmth: 0 },
  { id: 'crisp-news', name: 'Crisp News', brightness: 105, contrast: 115, saturation: 110, warmth: 2 },
  { id: 'dramatic', name: 'Dramatic Press', brightness: 95, contrast: 130, saturation: 90, warmth: -5 },
  { id: 'monochrome', name: 'B&W Photojournalism', brightness: 102, contrast: 125, saturation: 0, warmth: 0 },
  { id: 'warm', name: 'Warm Story', brightness: 104, contrast: 105, saturation: 115, warmth: 15 },
  { id: 'vivid', name: 'Vivid Editorial', brightness: 108, contrast: 120, saturation: 135, warmth: 5 },
];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('crop');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('16:9');
  
  // Adjustments (100 is neutral)
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [exposure, setExposure] = useState<number>(0);
  const [warmth, setWarmth] = useState<number>(0);

  // Transforms
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  // Crop box coordinates (percentages 0-100 relative to rendered image)
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('normal');

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const originalBlobUrlRef = useRef<string | null>(null);

  // Load and prepare image (avoiding CORS issues)
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setIsLoading(true);
    setLoadError(null);
    handleResetAll();

    let isMounted = true;

    const prepareImage = async () => {
      try {
        // If it's already a data URL or blob URL, load directly
        if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
          if (isMounted) {
            originalBlobUrlRef.current = imageUrl;
            setIsLoading(false);
          }
          return;
        }

        // Try fetching as blob to create local object URL (bypasses canvas taint)
        try {
          const resp = await fetch(imageUrl, { mode: 'cors' });
          if (resp.ok) {
            const blob = await resp.blob();
            const objectUrl = URL.createObjectURL(blob);
            if (isMounted) {
              originalBlobUrlRef.current = objectUrl;
              setIsLoading(false);
              return;
            }
          }
        } catch (fetchErr) {
          // If fetch fails (CORS), fallback to direct URL
        }

        if (isMounted) {
          originalBlobUrlRef.current = imageUrl;
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setLoadError('Failed to load image for editing.');
          setIsLoading(false);
        }
      }
    };

    prepareImage();

    return () => {
      isMounted = false;
      if (originalBlobUrlRef.current && originalBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(originalBlobUrlRef.current);
      }
    };
  }, [isOpen, imageUrl]);

  // Adjust crop box based on selected aspect ratio
  useEffect(() => {
    if (aspectRatio === 'free') return;

    let targetRatio = 16 / 9;
    if (aspectRatio === '4:3') targetRatio = 4 / 3;
    else if (aspectRatio === '3:2') targetRatio = 3 / 2;
    else if (aspectRatio === '1:1') targetRatio = 1;

    // Calculate crop rectangle inside 0-100% space
    // Let's assume standard container ratio or use image aspect ratio
    const img = imageRef.current;
    const imgRatio = img ? (img.naturalWidth / img.naturalHeight) : (16 / 9);

    let newWidth = 100;
    let newHeight = (newWidth / targetRatio) * imgRatio;

    if (newHeight > 100) {
      newHeight = 100;
      newWidth = (newHeight * targetRatio) / imgRatio;
    }

    const newX = Math.max(0, (100 - newWidth) / 2);
    const newY = Math.max(0, (100 - newHeight) / 2);

    setCropBox({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    });
  }, [aspectRatio]);

  const handleResetAll = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setExposure(0);
    setWarmth(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setSelectedFilter('normal');
    setAspectRatio('16:9');
    setCropBox({ x: 0, y: 5, width: 100, height: 90 });
  };

  const handleApplyFilter = (preset: FilterPreset) => {
    setSelectedFilter(preset.id);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setWarmth(preset.warmth);
  };

  const handleRotateLeft = () => setRotation((prev) => (prev - 90) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleToggleFlipH = () => setFlipH((prev) => !prev);
  const handleToggleFlipV = () => setFlipV((prev) => !prev);

  // Mouse / Touch handlers for Crop Box
  const handleCropMouseDown = (e: React.MouseEvent, handle: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCrop(true);
    setActiveHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingCrop || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    setCropBox((prev) => {
      let { x, y, width, height } = prev;

      if (!activeHandle) {
        // Dragging entire crop box
        const nextX = Math.max(0, Math.min(100 - width, x + deltaXPercent));
        const nextY = Math.max(0, Math.min(100 - height, y + deltaYPercent));
        return { ...prev, x: nextX, y: nextY };
      }

      // Resizing handles
      if (activeHandle.includes('e')) {
        width = Math.min(100 - x, Math.max(15, width + deltaXPercent));
      }
      if (activeHandle.includes('s')) {
        height = Math.min(100 - y, Math.max(15, height + deltaYPercent));
      }
      if (activeHandle.includes('w')) {
        const nextX = Math.max(0, Math.min(x + width - 15, x + deltaXPercent));
        width = width + (x - nextX);
        x = nextX;
      }
      if (activeHandle.includes('n')) {
        const nextY = Math.max(0, Math.min(y + height - 15, y + deltaYPercent));
        height = height + (y - nextY);
        y = nextY;
      }

      return { x, y, width, height };
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDraggingCrop, dragStart, activeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingCrop(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isDraggingCrop) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingCrop, handleMouseMove, handleMouseUp]);

  // Construct CSS Filter string for preview
  const getCssFilter = (isOriginal: boolean = false) => {
    if (isOriginal) return 'none';
    const effectiveBrightness = (brightness + exposure) / 100;
    const effectiveContrast = contrast / 100;
    const effectiveSaturation = saturation / 100;
    const sepia = warmth > 0 ? (warmth * 0.4) / 100 : 0;
    const hueRotate = warmth < 0 ? `${warmth * 0.8}deg` : '0deg';

    return `brightness(${effectiveBrightness}) contrast(${effectiveContrast}) saturate(${effectiveSaturation}) sepia(${sepia}) hue-rotate(${hueRotate})`;
  };

  // High-Resolution Export
  const handleSaveAndExport = async () => {
    if (!imageRef.current) return;

    setIsProcessing(true);
    try {
      const sourceImg = imageRef.current;
      
      // Load into full-res image element with crossOrigin anonymous
      const fullImg = new Image();
      fullImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        fullImg.onload = () => resolve();
        fullImg.onerror = () => reject(new Error('Image failed to load in export canvas.'));
        fullImg.src = originalBlobUrlRef.current || imageUrl;
      });

      const naturalW = fullImg.naturalWidth || 1920;
      const naturalH = fullImg.naturalHeight || 1080;

      // Create intermediate canvas for transformations (rotation, flips, adjustments)
      const transformCanvas = document.createElement('canvas');
      const isQuarterRotated = Math.abs(rotation % 180) === 90;
      transformCanvas.width = isQuarterRotated ? naturalH : naturalW;
      transformCanvas.height = isQuarterRotated ? naturalW : naturalH;

      const tCtx = transformCanvas.getContext('2d');
      if (!tCtx) throw new Error('Could not create canvas context.');

      tCtx.save();
      // Apply transforms
      tCtx.translate(transformCanvas.width / 2, transformCanvas.height / 2);
      tCtx.rotate((rotation * Math.PI) / 180);
      tCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Draw original image centered
      tCtx.drawImage(
        fullImg,
        -naturalW / 2,
        -naturalH / 2,
        naturalW,
        naturalH
      );
      tCtx.restore();

      // Now create final crop canvas
      const finalCanvas = document.createElement('canvas');
      const cropPxX = (cropBox.x / 100) * transformCanvas.width;
      const cropPxY = (cropBox.y / 100) * transformCanvas.height;
      const cropPxW = (cropBox.width / 100) * transformCanvas.width;
      const cropPxH = (cropBox.height / 100) * transformCanvas.height;

      // Set target output dimensions (maintain high definition, max 1920px width)
      const maxOutputWidth = 1920;
      let outputW = Math.min(cropPxW, maxOutputWidth);
      let outputH = (outputW / cropPxW) * cropPxH;

      finalCanvas.width = Math.round(outputW);
      finalCanvas.height = Math.round(outputH);

      const fCtx = finalCanvas.getContext('2d');
      if (!fCtx) throw new Error('Could not create final canvas context.');

      // Apply CSS Filters to the canvas rendering
      fCtx.filter = getCssFilter(false);
      fCtx.imageSmoothingEnabled = true;
      fCtx.imageSmoothingQuality = 'high';

      fCtx.drawImage(
        transformCanvas,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        0,
        0,
        finalCanvas.width,
        finalCanvas.height
      );

      // Export as high quality JPEG data URL
      const editedDataUrl = finalCanvas.toDataURL('image/jpeg', 0.92);
      onSave(editedDataUrl);
      onClose();
    } catch (err: any) {
      console.error('Error exporting edited image:', err);
      alert(`Could not process image: ${err?.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[92vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Featured Image Studio
                <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full uppercase">
                  16:9 Newsroom Pro
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Crop, enhance lighting, apply filters, and optimize hero visuals for publishing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onMouseDown={() => setIsComparingOriginal(true)}
              onMouseUp={() => setIsComparingOriginal(false)}
              onMouseLeave={() => setIsComparingOriginal(false)}
              onTouchStart={() => setIsComparingOriginal(true)}
              onTouchEnd={() => setIsComparingOriginal(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isComparingOriginal 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Hold to see original unedited photo"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isComparingOriginal ? 'Viewing Original' : 'Hold to Compare'}</span>
            </button>

            <button
              onClick={handleResetAll}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Reset all edits"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
          
          {/* Main Visual Canvas Area */}
          <div className="flex-1 p-4 sm:p-6 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-xs">Loading image in editor...</span>
              </div>
            ) : loadError ? (
              <div className="p-6 bg-red-950/40 border border-red-800 text-red-200 rounded-xl text-center max-w-sm">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm font-semibold">{loadError}</p>
                <button onClick={onClose} className="mt-3 px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-xs">
                  Close
                </button>
              </div>
            ) : (
              <div 
                ref={containerRef}
                className="relative max-w-full max-h-full flex items-center justify-center select-none"
                style={{
                  transform: `scale(${zoom})`,
                  transition: isDraggingCrop ? 'none' : 'transform 0.15s ease-out',
                }}
              >
                {/* Active Image with CSS transforms and filters */}
                <img
                  ref={imageRef}
                  src={originalBlobUrlRef.current || imageUrl}
                  alt="Editor workspace"
                  className="max-h-[55vh] lg:max-h-[65vh] max-w-full object-contain rounded-sm pointer-events-none"
                  style={{
                    filter: getCssFilter(isComparingOriginal),
                    transform: isComparingOriginal ? 'none' : `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                    transition: 'filter 0.1s linear',
                  }}
                />

                {/* Interactive Crop Box Overlay (shown when on Crop tab and not comparing) */}
                {activeTab === 'crop' && !isComparingOriginal && (
                  <>
                    {/* Dimmed backdrop outside crop area */}
                    <div 
                      className="absolute inset-0 bg-black/55 pointer-events-none"
                      style={{
                        clipPath: `polygon(
                          0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                          ${cropBox.x}% ${cropBox.y}%,
                          ${cropBox.x}% ${cropBox.y + cropBox.height}%,
                          ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%,
                          ${cropBox.x + cropBox.width}% ${cropBox.y}%,
                          ${cropBox.x}% ${cropBox.y}%
                        )`,
                      }}
                    />

                    {/* Resizable / Draggable Crop Box */}
                    <div
                      onMouseDown={(e) => handleCropMouseDown(e, null)}
                      className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)] cursor-move transition-shadow hover:shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                      style={{
                        left: `${cropBox.x}%`,
                        top: `${cropBox.y}%`,
                        width: `${cropBox.width}%`,
                        height: `${cropBox.height}%`,
                      }}
                    >
                      {/* Rule-of-Thirds Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                        <div className="border-r border-white border-dashed"></div>
                        <div className="border-r border-white border-dashed"></div>
                        <div></div>
                        <div className="border-r border-t border-white border-dashed"></div>
                        <div className="border-r border-t border-white border-dashed"></div>
                        <div className="border-t border-white border-dashed"></div>
                        <div className="border-r border-t border-white border-dashed"></div>
                        <div className="border-r border-t border-white border-dashed"></div>
                        <div className="border-t border-white border-dashed"></div>
                      </div>

                      {/* Corner Handles */}
                      <div 
                        onMouseDown={(e) => handleCropMouseDown(e, 'nw')}
                        className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-slate-900 shadow-sm cursor-nwse-resize rounded-xs"
                      />
                      <div 
                        onMouseDown={(e) => handleCropMouseDown(e, 'ne')}
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-slate-900 shadow-sm cursor-nesw-resize rounded-xs"
                      />
                      <div 
                        onMouseDown={(e) => handleCropMouseDown(e, 'sw')}
                        className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-slate-900 shadow-sm cursor-nesw-resize rounded-xs"
                      />
                      <div 
                        onMouseDown={(e) => handleCropMouseDown(e, 'se')}
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-slate-900 shadow-sm cursor-nwse-resize rounded-xs"
                      />

                      {/* Aspect Ratio Badge */}
                      <span className="absolute bottom-1 left-1.5 bg-black/80 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                        {aspectRatio.toUpperCase()}
                      </span>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* Live Compare Pill */}
            {isComparingOriginal && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>ORIGINAL PHOTO</span>
              </div>
            )}
          </div>

          {/* Controls Sidebar */}
          <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
            
            {/* Tab Switcher */}
            <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-bold text-center bg-slate-950/60 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('crop')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'crop' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Crop & Turn</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('adjust')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'adjust' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('filters')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'filters' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Tab 1: Crop & Turn Controls */}
            {activeTab === 'crop' && (
              <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 text-xs">
                
                {/* Aspect Ratio Presets */}
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-2 text-[11px]">
                    Aspect Ratio (पहलू अनुपात)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '16:9', label: '16:9 Hero', desc: 'Recommended' },
                      { id: '4:3', label: '4:3 News', desc: 'Standard' },
                      { id: '3:2', label: '3:2 Press', desc: 'Classic' },
                      { id: '1:1', label: '1:1 Square', desc: 'Social' },
                      { id: 'free', label: 'Freeform', desc: 'Custom' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAspectRatio(opt.id as AspectRatioOption)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          aspectRatio === opt.id 
                            ? 'bg-blue-600/20 border-blue-500 text-white font-bold' 
                            : 'bg-slate-800/50 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold text-xs">{opt.label}</div>
                        <div className="text-[10px] text-slate-400">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotate & Flip Tools */}
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-2 text-[11px]">
                    Rotate & Flip (दिशा बदलें)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={handleRotateLeft}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-center flex flex-col items-center gap-1 transition-colors cursor-pointer"
                      title="Rotate 90° counter-clockwise"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-300" />
                      <span className="text-[10px] text-slate-400">-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateRight}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-center flex flex-col items-center gap-1 transition-colors cursor-pointer"
                      title="Rotate 90° clockwise"
                    >
                      <RotateCw className="w-4 h-4 text-slate-300" />
                      <span className="text-[10px] text-slate-400">+90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleFlipH}
                      className={`p-2.5 rounded-lg text-center flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        flipH ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                      <span className="text-[10px]">Flip H</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleFlipV}
                      className={`p-2.5 rounded-lg text-center flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        flipV ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                      title="Flip Vertical"
                    >
                      <FlipVertical className="w-4 h-4" />
                      <span className="text-[10px]">Flip V</span>
                    </button>
                  </div>
                </div>

                {/* Zoom Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <span>Framing Zoom</span>
                    <span className="font-mono text-blue-400">{zoom.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="range"
                      min={1}
                      max={2.5}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-blue-500 cursor-pointer"
                    />
                    <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Color & Lighting Adjustments */}
            {activeTab === 'adjust' && (
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                
                {/* Brightness Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Brightness (चमक)</span>
                    </span>
                    <span className="font-mono text-blue-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>50%</span>
                    <span>100% (Neutral)</span>
                    <span>150%</span>
                  </div>
                </div>

                {/* Contrast Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Contrast className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Contrast (कंट्रास्ट)</span>
                    </span>
                    <span className="font-mono text-blue-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>50%</span>
                    <span>100% (Neutral)</span>
                    <span>150%</span>
                  </div>
                </div>

                {/* Saturation Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Color Saturation (रंग संतृप्ति)</span>
                    </span>
                    <span className="font-mono text-blue-400">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0% (B&W)</span>
                    <span>100% (Normal)</span>
                    <span>200%</span>
                  </div>
                </div>

                {/* Warmth / Color Temp */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <span>Warmth / Color Temp</span>
                    <span className="font-mono text-blue-400">
                      {warmth > 0 ? `+${warmth} (Warm)` : warmth < 0 ? `${warmth} (Cool)` : 'Neutral'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    value={warmth}
                    onChange={(e) => setWarmth(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Cool Blue</span>
                    <span>0</span>
                    <span>Warm Amber</span>
                  </div>
                </div>

                {/* Quick Reset for adjustments */}
                <button
                  type="button"
                  onClick={() => {
                    setBrightness(100);
                    setContrast(100);
                    setSaturation(100);
                    setExposure(0);
                    setWarmth(0);
                  }}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 rounded-lg text-[11px] font-semibold transition-colors mt-2"
                >
                  Reset Color Adjustments
                </button>

              </div>
            )}

            {/* Tab 3: One-Click Presets */}
            {activeTab === 'filters' && (
              <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto flex-1 text-xs">
                <p className="text-[11px] text-slate-400 mb-2">
                  Editorial-grade photo color presets tailored for breaking news, interviews, and features.
                </p>
                {FILTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyFilter(preset)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedFilter === preset.id
                        ? 'bg-blue-600/25 border-blue-500 text-white font-bold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Brightness {preset.brightness}% • Contrast {preset.contrast}% • Sat {preset.saturation}%
                      </div>
                    </div>
                    {selectedFilter === preset.id && (
                      <Check className="w-4 h-4 text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAndExport}
                disabled={isProcessing || isLoading}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:bg-slate-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Image...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply & Update Featured Image</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
