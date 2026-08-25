import React, { useState } from 'react';
import { Play, Eye, Clock, User, ShieldCheck, Flame, Share2, FileText, ArrowRight } from 'lucide-react';
import { WpVideo, WpPost } from '../types/wordpress';
import { mockVideos, mockPosts, mockAuthors, getLocalizedVideo } from '../data/mockWpData';
import { VideoPlayer } from '../components/media/VideoPlayer';
import { ArticleShareBar } from '../components/article/ArticleShareBar';
import { VideoCard } from '../components/cards/VideoCard';
import { MediumStoryCard } from '../components/cards/MediumStoryCard';
import { RankingItem } from '../components/cards/RankingItem';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';

interface VideoDetailTemplateProps {
  video: WpVideo;
  onSelectVideo: (video: WpVideo) => void;
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onNavigateVideos: () => void;
  showAds?: boolean;
}

export const VideoDetailTemplate: React.FC<VideoDetailTemplateProps> = ({
  video,
  onSelectVideo,
  onSelectPost,
  onNavigateHome,
  onNavigateVideos,
  showAds = false,
}) => {
  const { language, t, isHindi } = useLanguage();
  const localized = getLocalizedVideo(video, language);
  const author = mockAuthors[video.authorId];
  const relatedVideos = mockVideos.filter((v) => v.id !== video.id);
  const relatedPosts = mockPosts.slice(0, 3);
  const trendingRanking = [...mockPosts].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5);

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'वीडियो हब' : 'Video Hub', onClick: onNavigateVideos },
          { label: localized.title, isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Video & Content Column (8 cols) */}
          <article className="lg:col-span-8">
            {/* Header */}
            <header className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-editorial-red text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
                  {localized.category}
                </span>
                <span className="text-xs text-ink-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{isHindi ? `अवधि: ${localized.duration}` : `Duration: ${video.duration}`}</span>
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink leading-tight mb-4">
                {localized.title}
              </h1>

              <div className="flex items-center justify-between text-xs text-ink-muted border-y border-border-subtle py-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">
                    {isHindi ? `प्रस्तोता: ${localized.presenter}` : `Presented by ${video.presenter}`}
                  </span>
                  {author && <span>({author.role})</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-ink">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>{localized.viewsCount}</span>
                  </span>
                  <span>•</span>
                  <span>{isHindi ? 'आज प्रकाशित' : 'Published Today'}</span>
                </div>
              </div>
            </header>

            {/* Main Responsive Video Player */}
            <VideoPlayer video={video} />

            {/* Social Share Bar with Video Thumbnail */}
            <ArticleShareBar
              title={localized.title}
              url={typeof window !== 'undefined' ? `${window.location.origin}/videos/${video.slug}` : `https://npnewsmetro.com/videos/${video.slug}`}
              featuredImage={video.posterUrl}
              summary={localized.caption}
              category={video.category || 'videos'}
            />

            {/* Description & Overview */}
            <div className="my-8 p-5 bg-surface-lowest border border-border-subtle rounded-sm shadow-subtle">
              <h3 className="font-serif text-xl font-bold text-ink mb-2">
                {isHindi ? 'कार्यक्रम अवलोकन एवं संपादकीय संदर्भ' : 'Program Overview & Editorial Context'}
              </h3>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed mb-4">
                {localized.caption}
              </p>
              <div className="p-3 bg-surface-container rounded text-xs text-ink-secondary flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>{isHindi ? 'स्रोत एवं अधिकार:' : 'Attribution & Rights:'}</strong> {isHindi ? 'एनपी न्यूज़ मेट्रो खोजी मल्टीमीडिया इकाई द्वारा निर्मित और प्रकाशित।' : 'Recorded, edited, and produced by the NP News Metro Investigative Multimedia Unit. Licensed under newsroom editorial fair use.'}
                </p>
              </div>
            </div>

            {/* Related Text Reports */}
            <section className="my-10 pt-8 border-t-2 border-primary/20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-xl font-bold text-ink">
                  {isHindi ? 'संबंधित खोजी लेख' : 'Related Investigative Articles'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((post) => (
                  <MediumStoryCard
                    key={post.id}
                    post={post}
                    onSelect={onSelectPost}
                    showImage={true}
                  />
                ))}
              </div>
            </section>

            {/* More Videos Grid */}
            <section className="my-10 pt-8 border-t-2 border-primary/20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-xl font-bold text-ink">
                  {isHindi ? 'और अधिक वीडियो प्रसारण एवं डॉक्यूमेंट्री' : 'More Video Broadcasts & Documentaries'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedVideos.slice(0, 2).map((vid) => (
                  <VideoCard
                    key={vid.id}
                    video={vid}
                    onSelect={onSelectVideo}
                  />
                ))}
              </div>
            </section>
          </article>

          {/* Right Rail Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {showAds && <AdSlot zone="A3" />}

            <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle">
              <div className="flex items-center justify-between pb-2 border-b-2 border-secondary mb-3">
                <h3 className="font-serif text-base font-bold text-ink flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-secondary" />
                  <span>{isHindi ? 'ट्रेंडिंग वीडियो' : 'Trending Video Stories'}</span>
                </h3>
              </div>
              <div className="divide-y divide-border-subtle">
                {trendingRanking.map((p, idx) => (
                  <RankingItem
                    key={p.id}
                    rank={idx + 1}
                    post={p}
                    onSelect={onSelectPost}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
