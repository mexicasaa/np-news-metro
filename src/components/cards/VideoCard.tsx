import React from 'react';
import { Play } from 'lucide-react';
import { WpVideo } from '../../types/wordpress';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedVideo } from '../../data/mockWpData';

interface VideoCardProps {
  video: WpVideo;
  onSelect: (video: WpVideo) => void;
  featured?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
}) => {
  const { language, isHindi } = useLanguage();
  const localized = getLocalizedVideo(video, language);

  return (
    <article
      onClick={() => onSelect(video)}
      className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-md p-3 sm:p-3.5 transition-all duration-300 cursor-pointer overflow-hidden shadow-md flex flex-col justify-between h-full"
    >
      <div>
        {/* Video Thumbnail with Centered Play Button & Badges */}
        <a
          href={`/videos/${video.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onSelect(video);
          }}
          className="relative aspect-[16/9] w-full overflow-hidden bg-black rounded-sm mb-3 block"
        >
          <img
            src={getOptimizedImageUrl(localized.posterUrl, 600)}
            alt={localized.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
            loading="lazy"
            decoding="async"
          />

          {/* Centered Frosted Play Button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-editorial-red/90 group-hover:bg-editorial-red text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
            </div>
          </div>
        </a>

        {/* Video Title */}
        <h3 className="font-serif font-bold text-white text-sm sm:text-[15px] leading-snug group-hover:text-amber-400 transition-colors line-clamp-2 mb-1.5">
          <a
            href={`/videos/${video.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(video);
            }}
            className="text-inherit hover:text-amber-400 no-underline block"
          >
            {localized.title}
          </a>
        </h3>

        {/* Video Caption / Dek */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {localized.caption}
        </p>
      </div>

      {/* Footer: Presenter */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono mt-auto">
        <span className="truncate max-w-[130px] font-sans font-medium text-slate-300">
          {isHindi ? 'प्रस्तोता: ' : 'With '}{localized.presenter}
        </span>
      </div>
    </article>
  );
};
