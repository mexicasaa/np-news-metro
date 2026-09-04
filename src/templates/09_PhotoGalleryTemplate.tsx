import React from 'react';
import { Camera, Eye, Share2, Flame, ArrowRight, User } from 'lucide-react';
import { WpGallery, WpPost } from '../types/wordpress';
import { mockGalleries, mockAuthors } from '../data/mockWpData';
import { getStoredPosts } from '../utils/newsStorage';
import { GalleryViewer } from '../components/media/GalleryViewer';
import { ArticleShareBar } from '../components/article/ArticleShareBar';
import { MediumStoryCard } from '../components/cards/MediumStoryCard';
import { RankingItem } from '../components/cards/RankingItem';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';

interface PhotoGalleryTemplateProps {
  gallery?: WpGallery;
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onSelectCategory: (category: string) => void;
  showAds?: boolean;
}

export const PhotoGalleryTemplate: React.FC<PhotoGalleryTemplateProps> = ({
  gallery = mockGalleries[0],
  onSelectPost,
  onNavigateHome,
  onSelectCategory,
  showAds = false,
}) => {
  const { language, t, isHindi } = useLanguage();
  const author = mockAuthors[gallery.authorId];
  const storedPosts = getStoredPosts();
  const relatedPosts = storedPosts.slice(0, 3);
  const trendingRanking = [...storedPosts].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 5);

  const galleryTitle = isHindi ? 'वाराणसी: शाश्वत घाट, आस्था और जीर्णोद्धार' : gallery.title;
  const galleryDesc = isHindi
    ? 'गंगा के किनारे भोर की वैदिक प्रार्थनाओं से लेकर शाम की महाआरती तक, भारत की आध्यात्मिक राजधानी की एक व्यापक फोटो निबंध श्रृंखला।'
    : gallery.description;

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'फोटो निबंध एवं गैलरी' : 'Photo Essays & Galleries', onClick: () => onSelectCategory('photos') },
          { label: galleryTitle, isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Gallery Column (8 cols) */}
          <article className="lg:col-span-8">
            {/* Header */}
            <header className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-secondary text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-secondary-gold" />
                  <span>{isHindi ? 'फोटो निबंध' : 'Photo Essay'}</span>
                </span>
                <span className="text-xs text-ink-muted">
                  {isHindi ? `श्रृंखला में ${gallery.items.length} छायाचित्र` : `${gallery.items.length} Photographs in Series`}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-ink leading-tight mb-4">
                {galleryTitle}
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed mb-4">
                {galleryDesc}
              </p>

              <div className="flex items-center justify-between text-xs text-ink-muted border-y border-border-subtle py-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">
                    {isHindi ? `छायांकन एवं संकलन: ${author?.name || 'संवाददाता फोटो पत्रकार'}` : `Photographed & Curated by ${author?.name || 'Staff Photojournalists'}`}
                  </span>
                </div>
                <span>{isHindi ? 'एनपी फोटो पत्रकारिता ब्यूरो' : 'Published in NP Photojournalism Bureau'}</span>
              </div>
            </header>

            {/* Interactive Gallery Viewer */}
            <GalleryViewer gallery={gallery} />

            {/* Social Share Bar with Gallery Cover Image */}
            <ArticleShareBar
              title={galleryTitle}
              url={typeof window !== 'undefined' ? `${window.location.origin}/photos/${gallery.slug}` : `https://www.npnewsmetro.com/photos/${gallery.slug}`}
              featuredImage={gallery.featuredImage || gallery.items[0]?.url}
              summary={galleryDesc}
              category="photos"
            />

            {/* Photo Essay Context / Story */}
            <div className="my-8 p-6 bg-surface-lowest border border-border-subtle rounded-sm shadow-subtle text-sm text-ink-secondary leading-relaxed space-y-4">
              <h3 className="font-serif text-xl font-bold text-ink">
                {isHindi ? 'लेंस के पीछे: दृश्य प्रलेखन' : 'Behind the Lens: The Visual Documentation'}
              </h3>
              <p>
                {isHindi
                  ? 'हमारे फोटो पत्रकारों ने वाराणसी के प्राचीन तटवर्ती गलियारों का दस्तावेजीकरण करने में दस दिन बिताए, यह देखा कि गंगा के पत्थर के घाटों पर आध्यात्मिक विरासत और समकालीन नागरिक जीर्णोद्धार कैसे आपस में मिलते हैं।'
                  : 'Our photojournalists spent ten days documenting the ancient riverfront corridors of Varanasi, witnessing how spiritual heritage and contemporary civic restoration intersect along the stone ghats of the Ganges.'}
              </p>
              <p>
                {isHindi
                  ? 'हर फ्रेम दैनिक जीवन के एक अछूते पहलू को कैद करता है: भोर से पहले वैदिक पाठ से लेकर शाम के गंभीर समारोहों तक, जिसमें दुनिया भर से हजारों तीर्थयात्री भाग लेते हैं।'
                  : 'Every frame captures an unvarnished facet of daily life: from pre-dawn Vedic recitals to the solemn evening ceremonies attended by thousands of pilgrims from across the globe.'}
              </p>
            </div>

            {/* Related Stories */}
            <section className="my-10 pt-8 border-t-2 border-primary/20">
              <h3 className="font-serif text-xl font-bold text-ink mb-5">
                {isHindi ? 'संबंधित सांस्कृतिक एवं विरासत कथाएँ' : 'Related Cultural & Heritage Stories'}
              </h3>
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
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {showAds && <AdSlot zone="A3" />}

            <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle">
              <div className="flex items-center justify-between pb-2 border-b-2 border-secondary mb-3">
                <h3 className="font-serif text-base font-bold text-ink flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-secondary" />
                  <span>{isHindi ? 'ट्रेंडिंग फोटो निबंध' : 'Trending Photo Essays'}</span>
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
