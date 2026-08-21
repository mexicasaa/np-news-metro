import React, { useState } from 'react';
import { Video, Play, Eye, Sparkles, Filter, Clock, ChevronRight } from 'lucide-react';
import { WpVideo } from '../types/wordpress';
import { mockVideos } from '../data/mockWpData';
import { VideoCard } from '../components/cards/VideoCard';
import { VideoPlayer } from '../components/media/VideoPlayer';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { NewsletterModule } from '../components/common/NewsletterModule';
import { useLanguage } from '../context/LanguageContext';

interface VideoHubTemplateProps {
  onSelectVideo: (video: WpVideo) => void;
  onNavigateHome: () => void;
  showAds?: boolean;
}

export const VideoHubTemplate: React.FC<VideoHubTemplateProps> = ({
  onSelectVideo,
  onNavigateHome,
  showAds = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { t, isHindi } = useLanguage();

  const categories = isHindi
    ? ['सभी', 'व्याख्यात्मक', 'ग्राउंड रिपोर्ट', 'साक्षात्कार', 'व्यापार', 'राजनीति', 'शॉर्ट्स']
    : ['All', 'Explainers', 'Field Reports', 'Interviews', 'Business', 'Politics', 'Shorts'];

  const filteredVideos = mockVideos.filter((v) => {
    if (selectedCategory === 'All' || selectedCategory === 'सभी') return true;
    return v.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const featuredVideo = mockVideos[0];
  const gridVideos = filteredVideos.length > 0 ? filteredVideos : mockVideos;

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'वीडियो हब एवं वृत्तचित्र' : 'Video Hub & Documentaries', isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8 space-y-10">
        {/* Hub Header */}
        <div className="border-b-2 border-primary pb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-editorial-red rounded-full"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-editorial-red">
              {isHindi ? 'न्यूज़रूम दृश्य पत्रकारिता' : 'Newsroom Visual Journalism'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mb-2">
            {isHindi ? 'एनपी वीडियो हब एवं गहन पड़ताल' : 'NP Video Hub & Deep Dives'}
          </h1>

          <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
            {isHindi
              ? 'खोजी वीडियो रिपोर्ट, नीतिगत व्याख्या, शीर्ष नेतृत्व के साक्षात्कार और पूरे भारत से ग्राउंड डॉक्यूमेंट्री।'
              : 'Investigative video reports, policy explainers, leadership interviews, and field documentaries from across India.'}
          </p>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto hide-scrollbar text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap ${
                  selectedCategory === cat || (idx === 0 && (selectedCategory === 'All' || selectedCategory === 'सभी'))
                    ? 'bg-primary text-white font-bold'
                    : 'bg-surface-container text-ink hover:bg-surface-high border border-border-subtle'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Broadcast Player */}
        {featuredVideo && (
          <section aria-label="Featured Documentary Broadcast" className="bg-primary text-white p-6 sm:p-8 rounded-sm shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary-gold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? 'विशेष वृत्तचित्र प्रसारण' : 'Featured Deep Dive Documentary'}</span>
              </span>
              <span className="text-xs font-mono text-slate-300">
                1080p Full HD
              </span>
            </div>

            <VideoPlayer video={featuredVideo} />
          </section>
        )}

        {/* Ad Slot */}
        {showAds && <AdSlot zone="A7" />}

        {/* Video Grid */}
        <section aria-label="Latest Videos Grid">
          <div className="flex items-center justify-between pb-2 border-b-2 border-primary mb-6">
            <h2 className="font-serif text-2xl font-bold text-ink">
              {isHindi ? 'सभी वीडियो बुलेटिन एवं डॉक्यूमेंट्री' : 'All Video Dispatches & Documentaries'}
            </h2>
            <span className="text-xs text-ink-muted">
              {isHindi ? `${gridVideos.length} वीडियो उपलब्ध` : `Showing ${gridVideos.length} Videos`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
              />
            ))}
          </div>
        </section>

        {/* Newsletter subscription */}
        <NewsletterModule inline={true} />
      </main>
    </div>
  );
};
