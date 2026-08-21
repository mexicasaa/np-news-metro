import React from 'react';
import { Play, Eye, Clock } from 'lucide-react';
import { WpVideo } from '../../types/wordpress';
import { handleImageError } from '../../utils/imageFallback';
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
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black rounded-sm mb-3">
          <img
            src={localized.posterUrl}
            alt={localized.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
            loading="lazy"
          />

          {/* Centered Frosted Play Button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-editorial-red/90 group-hover:bg-editorial-red text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Duration Badge */}
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white px-2 py-0.5 text-[10px] sm:text-[11px] font-bold font-mono rounded-xs border border-white/10">
            {localized.duration}
          </span>

          {/* Category Tag */}
          <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xs">
            {localized.category}
          </span>
        </div>

        {/* Video Title */}
        <h3 className="font-serif font-bold text-white text-sm sm:text-[15px] leading-snug group-hover:text-amber-400 transition-colors line-clamp-2 mb-1.5">
          {localized.title}
        </h3>

        {/* Video Caption / Dek */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {localized.caption}
        </p>
      </div>

      {/* Footer: Presenter & Views */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono mt-auto">
        <span className="truncate max-w-[130px] font-sans font-medium text-slate-300">
          {isHindi ? 'प्रस्तोता: ' : 'With '}{localized.presenter}
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <Eye className="w-3 h-3 text-slate-500" />
          <span>{localized.viewsCount}</span>
        </span>
      </div>
    </article>
  );
};
