import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Pause, Play, Clock, Sparkles } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedPost } from '../../data/mockWpData';

interface BreakingNewsBarProps {
  breakingPosts: WpPost[];
  onSelectPost: (post: WpPost) => void;
  isEmergencyMode?: boolean;
}

export const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({
  breakingPosts,
  onSelectPost,
  isEmergencyMode = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const { language, t } = useLanguage();

  const ROTATION_INTERVAL = 6000; // 6 seconds per story

  useEffect(() => {
    if (!breakingPosts || breakingPosts.length <= 1 || isPaused || isHovered) {
      return;
    }

    const timer = setInterval(() => {
      handleNext();
    }, ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, [breakingPosts?.length, isPaused, isHovered, currentIndex]);

  const handleNext = () => {
    if (!breakingPosts || breakingPosts.length <= 1) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingPosts.length);
      setIsFading(false);
    }, 150);
  };

  const handlePrev = () => {
    if (!breakingPosts || breakingPosts.length <= 1) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + breakingPosts.length) % breakingPosts.length);
      setIsFading(false);
    }, 150);
  };

  if (!breakingPosts || breakingPosts.length === 0) return null;

  const rawPost = breakingPosts[currentIndex] || breakingPosts[0];
  const currentPost = getLocalizedPost(rawPost, language);

  return (
    <div
      role="region"
      aria-label="Breaking News"
      className={`border-b select-none transition-colors ${
        isEmergencyMode
          ? 'bg-red-700 text-white border-red-800'
          : 'bg-white text-slate-900 border-slate-200'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-site mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Left: Breaking News Label Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px] sm:text-[11px] ${
              isEmergencyMode
                ? 'bg-white text-red-700 shadow-xs'
                : 'bg-editorial-red text-white'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isEmergencyMode ? 'bg-red-700' : 'bg-white'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isEmergencyMode ? 'bg-red-700' : 'bg-white'
                }`}
              />
            </span>
            <span>{t.breaking}</span>
          </div>

          {/* Category Tag (Clean & Compact) */}
          {currentPost.category && (
            <span
              className={`hidden md:inline font-bold uppercase text-[11px] tracking-wider ${
                isEmergencyMode ? 'text-red-100' : 'text-editorial-red'
              }`}
            >
              [{currentPost.category}]
            </span>
          )}
        </div>

        {/* Center: Wide Headline with Hover Effect */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <button
            onClick={() => onSelectPost(rawPost)}
            className={`w-full text-left truncate font-sans font-semibold text-xs sm:text-sm cursor-pointer transition-opacity duration-150 flex items-center gap-1.5 group ${
              isFading ? 'opacity-0' : 'opacity-100'
            } ${
              isEmergencyMode
                ? 'text-white hover:underline'
                : 'text-slate-900 hover:text-editorial-red hover:underline'
            }`}
            title={currentPost.title}
          >
            <span className="truncate">{currentPost.title}</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Right: Clean Minimal Carousel Controls */}
        {breakingPosts.length > 1 && (
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 text-slate-500">
            {/* Story Counter */}
            <span
              className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                isEmergencyMode
                  ? 'text-red-100 bg-red-800/60'
                  : 'text-slate-600 bg-slate-100'
              }`}
            >
              {currentIndex + 1}/{breakingPosts.length}
            </span>

            {/* Navigation Arrows */}
            <div className="flex items-center">
              <button
                onClick={handlePrev}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isEmergencyMode
                    ? 'hover:bg-red-800 text-white'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                title="Previous story"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={handleNext}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isEmergencyMode
                    ? 'hover:bg-red-800 text-white'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                title="Next story"
                aria-label="Next story"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Pause / Play Toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isEmergencyMode
                  ? 'hover:bg-red-800 text-white'
                  : isPaused
                  ? 'bg-red-50 text-editorial-red'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
              aria-label={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
            >
              {isPaused ? (
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              ) : (
                <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
