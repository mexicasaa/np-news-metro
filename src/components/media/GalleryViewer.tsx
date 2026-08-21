import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Camera, User } from 'lucide-react';
import { WpGallery } from '../../types/wordpress';
import { useLanguage } from '../../context/LanguageContext';

interface GalleryViewerProps {
  gallery: WpGallery;
}

export const GalleryViewer: React.FC<GalleryViewerProps> = ({ gallery }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { isHindi } = useLanguage();

  const currentItem = gallery.items[activeIndex] || gallery.items[0];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % gallery.items.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + gallery.items.length) % gallery.items.length);
  };

  return (
    <div className="my-8 bg-surface-lowest border border-border-subtle rounded-sm shadow-subtle overflow-hidden">
      {/* Gallery Main Slide Viewport */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black group">
        <img
          src={currentItem.url}
          alt={currentItem.alt || currentItem.caption}
          className="w-full h-full object-contain"
        />

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 bg-black/80 text-white px-2.5 py-1 text-xs font-mono font-bold rounded-sm border border-white/20">
          {activeIndex + 1} / {gallery.items.length} {isHindi ? 'छायाचित्र' : 'Photos'}
        </div>

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          aria-label={isHindi ? 'पिछला छायाचित्र' : 'Previous Photo'}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors border border-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          aria-label={isHindi ? 'अगला छायाचित्र' : 'Next Photo'}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors border border-white/20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Caption & Photographer Credit Bar */}
      <div className="p-4 sm:p-5 border-b border-border-subtle bg-canvas">
        <p className="font-serif text-base sm:text-lg text-ink font-semibold leading-relaxed mb-2">
          {isHindi && currentItem.captionHi ? currentItem.captionHi : currentItem.caption}
        </p>
        <div className="flex items-center justify-between text-xs text-ink-muted flex-wrap gap-2">
          <span className="flex items-center gap-1 font-medium text-ink-secondary">
            <Camera className="w-3.5 h-3.5 text-secondary-gold" />
            <span>{isHindi ? 'छायांकन:' : 'Photo:'} {currentItem.credit}</span>
          </span>
          <span className="text-[11px] text-ink-muted">
            {isHindi ? `प्रकाशन: ${gallery.category} • एनपी न्यूज़ मेट्रो फोटो पत्रकारिता डेस्क` : `Published in ${gallery.category} • NP News Metro Photojournalism Desk`}
          </span>
        </div>
      </div>

      {/* Thumbnail Navigation Strip */}
      <div className="p-3 bg-surface-container/50 flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {gallery.items.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setActiveIndex(idx)}
            className={`w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all ${
              idx === activeIndex
                ? 'border-primary scale-95 shadow-sm'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={item.url}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
