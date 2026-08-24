import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, User, Share2, Bookmark, ArrowRight, CheckCircle2, 
  Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, 
  Maximize2, X, Sparkles, Flame, Headphones, Check, Eye, MessageSquare 
} from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { mockAuthors, getLocalizedPost } from '../../data/mockWpData';
import { handleImageError } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';

interface HeroStoryProps {
  post: WpPost;
  featuredPosts?: WpPost[];
  onSelect: (post: WpPost) => void;
  onSelectAuthor?: (authorId: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const HeroStory: React.FC<HeroStoryProps> = ({
  post,
  featuredPosts,
  onSelect,
  onSelectAuthor,
  onSelectCategory,
}) => {
  const { language, t, isHindi } = useLanguage();
  // Use either the array of featured posts (strictly capped to latest 10) or a single post
  const rawList = featuredPosts && featuredPosts.length > 0 ? featuredPosts : [post];
  const storyList = rawList.slice(0, 10);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Keep activeSlideIndex within bounds
  useEffect(() => {
    if (activeSlideIndex >= storyList.length && storyList.length > 0) {
      setActiveSlideIndex(0);
    }
  }, [storyList.length, activeSlideIndex]);

  const rawStory = storyList[activeSlideIndex] || post;
  const currentStory = getLocalizedPost(rawStory, language);
  const author = rawStory.customAuthor?.name ? {
    id: 'custom-author',
    name: rawStory.customAuthor.name,
    role: rawStory.customAuthor.role || 'Guest Contributor',
    avatar: rawStory.customAuthor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    bio: '',
    twitter: '',
    email: ''
  } : mockAuthors[currentStory.authorId] || mockAuthors['author-1'];

  // Auto-slide carousel when not hovered
  useEffect(() => {
    if (storyList.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % storyList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [storyList.length, isHovered]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlideIndex((prev) => (prev - 1 + storyList.length) % storyList.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlideIndex((prev) => (prev + 1) % storyList.length);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleToggleListen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsListening(!isListening);
  };

  return (
    <article 
      className="group bg-surface-lowest border border-border-subtle rounded-md shadow-xs hover:border-border-strong transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ======================================================== */}
      {/* 1. TOP: BIG CINEMATIC SLIDER MEDIA STAGE                */}
      {/* ======================================================== */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/9] lg:aspect-[16/9] bg-slate-950 overflow-hidden select-none">
        {/* High-Res Image Slider Mode */}
        <div 
          className="relative w-full h-full cursor-pointer"
          onClick={() => onSelect(currentStory)}
        >
          {/* Background Image with subtle zoom on hover */}
          <img
            key={currentStory.id}
            src={currentStory.featuredImage}
            alt={currentStory.imageAlt || currentStory.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            loading="eager"
          />

          {/* Gradient Scrim Overlays for Depth & Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Top Overlay Badges */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between pointer-events-none z-20">
            {/* Lead / Breaking Badge */}
            <div className="flex items-center gap-2">
              <span className="bg-editorial-red text-white px-2.5 sm:px-3 py-1 rounded-sm text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>{currentStory.isBreaking ? 'Breaking News' : 'Lead Story'}</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Exclusive Report</span>
              </span>
            </div>

            {/* Category Pill Tag */}
            <div className="pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory?.(currentStory.category);
                }}
                className="bg-white/90 hover:bg-white text-primary font-extrabold uppercase text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1 rounded-sm shadow-md transition-all hover:scale-105 border border-white/40 cursor-pointer"
              >
                {currentStory.category}
              </button>
            </div>
          </div>

          {/* Bottom Floating Bar: Slide Indicators & Caption */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-end justify-between gap-3 pointer-events-none z-20">
            {/* Photo Caption & Credit */}
            <div className="hidden sm:block max-w-md bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/15 text-white text-[11px]">
              <p className="truncate italic">{currentStory.imageCaption}</p>
              <p className="font-semibold text-slate-300 text-[10px]">{currentStory.imageCredit}</p>
            </div>

            {/* Slider Dots / Tabs (when multiple stories exist) */}
            {storyList.length > 1 && (
              <div className="pointer-events-auto flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg ml-auto">
                <span className="text-[10px] text-white/90 font-mono font-bold mr-1">
                  {activeSlideIndex + 1}/{storyList.length}
                </span>
                {storyList.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlideIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlideIndex === idx
                        ? 'w-6 bg-secondary-gold shadow-sm'
                        : 'w-2 bg-white/50 hover:bg-white'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Previous & Next Slider Arrow Buttons */}
          {storyList.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="pointer-events-auto absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-xl opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer"
                title="Previous Lead Story"
                aria-label="Previous Lead Story"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="pointer-events-auto absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-xl opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer"
                title="Next Lead Story"
                aria-label="Next Lead Story"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BOTTOM: ALL EDITORIAL NEWS INFORMATION & DETAILS     */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-6 lg:p-7 flex flex-col justify-between space-y-4 sm:space-y-5">
        
        {/* Meta Bar: Category, Time, Audio & Share Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 border-b border-border-subtle text-xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => onSelectCategory?.(currentStory.category)}
              className="text-secondary font-extrabold uppercase tracking-wider text-xs hover:text-primary transition-colors flex items-center gap-1"
            >
              <span>{currentStory.category}</span>
            </button>
            <span className="text-border-strong">•</span>
            <span className="text-ink-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-ink-muted" />
              <span>{currentStory.readTime}</span>
            </span>
            <span className="text-border-strong hidden sm:inline">•</span>
            <span className="text-ink-muted text-[11px] hidden sm:inline">
              {isHindi ? '25 मिनट पहले प्रकाशित' : 'Published 25m ago'}
            </span>
          </div>

          {/* Action Tools: Listen, Bookmark, Share */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {/* Audio Listen Button */}
            <button
              onClick={handleToggleListen}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold transition-colors ${
                isListening
                  ? 'bg-primary text-white'
                  : 'bg-surface-container hover:bg-surface-high text-ink'
              }`}
              title="Listen to AI Audio Summary"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isListening ? t.playingAudio : t.listen}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-sm transition-colors ${
                isBookmarked
                  ? 'bg-secondary-gold/20 text-secondary-dark font-bold'
                  : 'hover:bg-surface-container text-ink-muted'
              }`}
              title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark story'}
              aria-label="Bookmark story"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-sm hover:bg-surface-container text-ink-muted relative transition-colors"
              title="Share article link"
              aria-label="Share article link"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              {isCopied && (
                <span className="absolute -top-7 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                  {t.linkCopied}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Grand Headline */}
        <div>
          <h1
            onClick={() => onSelect(rawStory)}
            className={`font-serif text-2xl sm:text-3xl lg:text-[34px] xl:text-[36px] font-extrabold text-ink cursor-pointer hover:text-editorial-red transition-colors tracking-tight mb-3 ${isHindi ? 'leading-[1.4]' : 'leading-[1.2]'}`}
          >
            {currentStory.title}
          </h1>

          {/* Dek / Executive Summary */}
          <p className="text-sm sm:text-base md:text-[16px] text-ink-secondary font-normal leading-relaxed">
            {currentStory.dek}
          </p>
        </div>

        {/* Footer: Author Byline, Engagement Stats & Full Story CTA */}
        <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Author Byline */}
          {author && (
            <button
              onClick={() => onSelectAuthor?.(author.id)}
              className="flex items-center gap-2.5 text-left hover:text-primary transition-colors group/author cursor-pointer"
            >
              <img
                src={author.avatar}
                alt={author.name}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-border-subtle group-hover/author:border-secondary-gold transition-colors"
              />
              <div>
                <p className="font-bold text-ink group-hover/author:underline leading-tight text-xs sm:text-sm">
                  {author.name}
                </p>
                <p className="text-[11px] text-ink-muted leading-tight">
                  {author.role}
                </p>
              </div>
            </button>
          )}

          {/* Story Engagement Metrics */}
          <div className="hidden md:flex items-center gap-3 text-ink-muted text-xs font-mono">
            <span className="flex items-center gap-1" title="Total Views">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{(currentStory.viewsCount / 1000).toFixed(1)}k</span>
            </span>
            <span className="flex items-center gap-1" title="Comments">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentStory.commentCount}</span>
            </span>
          </div>

          {/* Full Story CTA Button */}
          <button
            onClick={() => onSelect(rawStory)}
            className="bg-primary hover:bg-primary-dark text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-sm flex items-center gap-2 text-xs sm:text-sm shadow-xs hover:shadow-md transition-all group/btn ml-auto cursor-pointer"
          >
            <span>{isHindi ? 'पूरी ख़बर पढ़ें' : 'Read Complete Story'}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </article>
  );
};
