import React from 'react';
import { Mail, ArrowRight, ShieldCheck, Rss, Globe, Award, ExternalLink } from 'lucide-react';
import { mockCategories } from '../../data/mockWpData';
import { useLanguage } from '../../context/LanguageContext';

interface SiteFooterProps {
  onNavigateCategory: (slug: string) => void;
  onNavigateStatic: (page: string) => void;
  onOpenNewsletter: () => void;
  onOpenAdmin?: () => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({
  onNavigateCategory,
  onNavigateStatic,
  onOpenNewsletter,
  onOpenAdmin,
}) => {
  const { t, isHindi } = useLanguage();

  return (
    <footer className="bg-primary text-slate-200 pt-12 pb-8 border-t-4 border-editorial-red mt-16">
      <div className="max-w-site mx-auto px-4">
        {/* Top Footer: Brand, Mission & Newsletter subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-700/60">
          {/* Col 1: Brand & Editorial Charter */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-block bg-white p-2 sm:p-2.5 rounded-sm border border-slate-700 shadow-sm">
              <img
                src="/logo.png"
                alt="NP NEWS METRO — Real News. Real Impact."
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              {t.footerAboutDesc}
            </p>
          </div>

          {/* Col 2: Quick Newsletter Box */}
          <div className="lg:col-span-7 bg-primary-container/70 p-5 rounded-sm border border-slate-700/80">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-secondary-gold" />
              <h4 className="font-serif font-bold text-white text-base">
                {isHindi ? 'दैनिक प्रभात एग्जीक्यूटिव ब्रीफिंग' : 'The Morning Executive Briefing'}
              </h4>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              {isHindi
                ? 'प्रतिदिन सुबह 7:30 बजे: नीतिगत विश्लेषण, बाजार की गतिविधियां और भू-राजनीतिक खुफिया रिपोर्ट सीधे आपके इनबॉक्स में।'
                : 'Delivered daily at 7:30 AM IST: Curated policy analyses, market movements, and geopolitical intelligence directly to your inbox. No spam.'}
            </p>
            <form onSubmit={(e) => { e.preventDefault(); onOpenNewsletter(); }} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder={t.newsletterPlaceholder}
                className="bg-primary-dark/80 border border-slate-600 px-3 py-2 text-xs text-white placeholder-slate-400 rounded-sm focus:outline-hidden focus:border-secondary-gold flex-1"
                required
              />
              <button
                type="submit"
                className="bg-secondary-gold hover:bg-secondary text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{t.newsletterBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-2">
              {isHindi
                ? 'सदस्यता लेकर आप हमारी गोपनीयता नीति और सत्यापित सहमति शर्तों से सहमत होते हैं।'
                : 'By subscribing, you agree to our Privacy Policy and verified consent terms.'}
            </p>
          </div>
        </div>

        {/* Middle Footer: Editorial Desks Grid */}
        <div className="py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 border-b border-slate-700/60 text-xs">
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'राष्ट्रीय एवं प्रशासन' : 'National & Governance'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><a href="/category/india" onClick={(e) => { e.preventDefault(); onNavigateCategory('india'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'राष्ट्रीय समाचार' : 'National News'}</a></li>
              <li><a href="/category/politics" onClick={(e) => { e.preventDefault(); onNavigateCategory('politics'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संसद एवं चुनाव' : 'Parliament & Elections'}</a></li>
              <li><a href="/category/india" onClick={(e) => { e.preventDefault(); onNavigateCategory('india'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'सुप्रीम कोर्ट एवं कानून' : 'Supreme Court & Law'}</a></li>
              <li><a href="/category/india" onClick={(e) => { e.preventDefault(); onNavigateCategory('india'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'राज्य एवं क्षेत्र' : 'States & Territories'}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'व्यापार एवं अर्थव्यवस्था' : 'Business & Economy'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><a href="/category/business" onClick={(e) => { e.preventDefault(); onNavigateCategory('business'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'शेयर बाजार एवं सेंसेक्स' : 'Markets & Sensex'}</a></li>
              <li><a href="/category/economy" onClick={(e) => { e.preventDefault(); onNavigateCategory('economy'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'अर्थव्यवस्था एवं जीडीपी' : 'Macroeconomy & GDP'}</a></li>
              <li><a href="/category/business" onClick={(e) => { e.preventDefault(); onNavigateCategory('business'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'स्टार्टअप्स एवं यूनिकॉर्न्स' : 'Startups & Tech Unicorns'}</a></li>
              <li><a href="/category/economy" onClick={(e) => { e.preventDefault(); onNavigateCategory('economy'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'आरबीआई एवं मौद्रिक नीति' : 'RBI & Monetary Policy'}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'तकनीक एवं वैश्विक' : 'Tech & Global'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><a href="/category/technology" onClick={(e) => { e.preventDefault(); onNavigateCategory('technology'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'एआई एवं डीप टेक' : 'AI & Deep Tech'}</a></li>
              <li><a href="/category/technology" onClick={(e) => { e.preventDefault(); onNavigateCategory('technology'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'सेमीकंडक्टर मिशन' : 'Semiconductor Mission'}</a></li>
              <li><a href="/category/world" onClick={(e) => { e.preventDefault(); onNavigateCategory('world'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'वैश्विक मामले एवं G20' : 'World Affairs & G20'}</a></li>
              <li><a href="/category/world" onClick={(e) => { e.preventDefault(); onNavigateCategory('world'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'कूटनीति एवं व्यापार' : 'Diplomacy & Trade'}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'संस्कृति एवं खेल' : 'Culture & Sports'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><a href="/category/sports" onClick={(e) => { e.preventDefault(); onNavigateCategory('sports'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'क्रिकेट एवं टेस्ट सीरीज' : 'Cricket & Test Series'}</a></li>
              <li><a href="/category/sports" onClick={(e) => { e.preventDefault(); onNavigateCategory('sports'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'ओलंपिक एवं एथलेटिक्स' : 'Olympics & Athletics'}</a></li>
              <li><a href="/category/entertainment" onClick={(e) => { e.preventDefault(); onNavigateCategory('entertainment'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'सिनेमा एवं राष्ट्रीय पुरस्कार' : 'Cinema & National Awards'}</a></li>
              <li><a href="/category/lifestyle" onClick={(e) => { e.preventDefault(); onNavigateCategory('lifestyle'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'विरासत एवं पर्यावरण' : 'Heritage & Environment'}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'विचार एवं विश्लेषण' : 'Opinion & Analysis'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><a href="/category/opinion" onClick={(e) => { e.preventDefault(); onNavigateCategory('opinion'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'दैनिक संपादकीय' : 'The Daily Editorial'}</a></li>
              <li><a href="/category/opinion" onClick={(e) => { e.preventDefault(); onNavigateCategory('opinion'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'स्तंभकार एवं निबंध' : 'Columnists & Essays'}</a></li>
              <li><a href="/category/opinion" onClick={(e) => { e.preventDefault(); onNavigateCategory('opinion'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'नीतिगत शोधपत्र' : 'Policy Papers'}</a></li>
              <li><a href="/category/opinion" onClick={(e) => { e.preventDefault(); onNavigateCategory('opinion'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संपादक को पत्र' : 'Letters to Editor'}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'मानक एवं नीतियां' : 'Standards & Policies'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><a href="/editorial-team" onClick={(e) => { e.preventDefault(); onNavigateStatic('editorial-team'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संपादकीय बोर्ड एवं नेतृत्व' : 'Editorial Board & Leadership'}</a></li>
              <li><a href="/ethics" onClick={(e) => { e.preventDefault(); onNavigateStatic('ethics'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संपादकीय नीति' : 'Editorial Policy'}</a></li>
              <li><a href="/corrections" onClick={(e) => { e.preventDefault(); onNavigateStatic('corrections'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संशोधन एवं निवारण' : 'Corrections & Redressal'}</a></li>
              <li><a href="/advertise" onClick={(e) => { e.preventDefault(); onNavigateStatic('advertise'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'विज्ञापन दें' : 'Advertise with Us'}</a></li>
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); onNavigateStatic('contact'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'न्यूज़रूम से संपर्क करें' : 'Contact Newsroom'}</a></li>
              <li><a href="/sitemap" onClick={(e) => { e.preventDefault(); onNavigateStatic('sitemap'); }} className="hover:text-secondary-gold transition-colors">{isHindi ? 'साइटमैप (Sitemap)' : 'Sitemap'}</a></li>
            </ul>
          </div>
        </div>

        {/* Bureau Locations */}
        <div className="py-6 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-secondary-gold" />
            <span className="font-bold uppercase text-slate-300 tracking-wider">
              {isHindi ? 'न्यूज़रूम ब्यूरो:' : 'Newsroom Bureaus:'}
            </span>
            <span>{isHindi ? 'नई दिल्ली (राष्ट्रीय मुख्यालय)' : 'New Delhi (National HQ)'}</span>
            <span>•</span>
            <span>{isHindi ? 'मुंबई' : 'Mumbai'}</span>
            <span>•</span>
            <span>{isHindi ? 'बेंगलुरु' : 'Bengaluru'}</span>
            <span>•</span>
            <span>{isHindi ? 'चेन्नई' : 'Chennai'}</span>
            <span>•</span>
            <span>{isHindi ? 'कोलकाता' : 'Kolkata'}</span>
            <span>•</span>
            <span>{isHindi ? 'हैदराबाद' : 'Hyderabad'}</span>
            <span>•</span>
            <span>{isHindi ? 'अहमदाबाद' : 'Ahmedabad'}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a href="/sitemap" onClick={(e) => { e.preventDefault(); onNavigateStatic('sitemap'); }} className="flex items-center gap-1 hover:text-white transition-colors font-bold text-slate-200 cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-secondary-gold" />
              <span>{isHindi ? 'साइटमैप (Sitemap)' : 'Sitemap Directory'}</span>
            </a>
            <span>•</span>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Main XML Sitemap for Search Engines">
              {isHindi ? 'एक्सएमएल साइटमैप' : 'XML Sitemap'}
            </a>
            <span>•</span>
            <a href="/news-sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Google News XML Sitemap">
              {isHindi ? 'गूगल न्यूज़' : 'Google News XML'}
            </a>
            <span>•</span>
            <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
              <Rss className="w-3 h-3 text-amber-500" />
              <span>{isHindi ? 'आरएसएस फ़ीड' : 'RSS Feeds'}</span>
            </a>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            <p>{t.footerCopyright} {t.allRightsReserved}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isHindi 
                ? 'आरएनआई पंजी. सं.: DEL HIN/2010/31544 (मेट्रोमैट दिल्ली) • पंजीकृत कार्यालय: कनाट प्लेस, नई दिल्ली 110001'
                : 'RNI Reg. No.: DEL HIN/2010/31544 (by Metromat Delhi) • Registered Office: Connaught Place, New Delhi 110001'}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
            <a href="/about" onClick={(e) => { e.preventDefault(); onNavigateStatic('about'); }} className="hover:text-white underline">{isHindi ? 'हमारे बारे में' : 'About Us'}</a>
            <a href="/contact" onClick={(e) => { e.preventDefault(); onNavigateStatic('contact'); }} className="hover:text-white underline">{isHindi ? 'संपर्क करें' : 'Contact Us'}</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigateStatic('privacy'); }} className="hover:text-white underline">{t.privacyPolicy}</a>
            <a href="/disclaimer" onClick={(e) => { e.preventDefault(); onNavigateStatic('disclaimer'); }} className="hover:text-white underline">{isHindi ? 'अस्वीकरण (Disclaimer)' : 'Disclaimer'}</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); onNavigateStatic('terms'); }} className="hover:text-white underline">{t.termsOfService}</a>
            <a href="/cookie-policy" onClick={(e) => { e.preventDefault(); onNavigateStatic('cookie-policy'); }} className="hover:text-white underline">{isHindi ? 'कुकी सेटिंग्स' : 'Cookie Settings'}</a>
            <a href="/ethics" onClick={(e) => { e.preventDefault(); onNavigateStatic('ethics'); }} className="hover:text-white underline">{t.editorialPolicy}</a>
            <a href="/corrections" onClick={(e) => { e.preventDefault(); onNavigateStatic('corrections'); }} className="hover:text-white underline">{isHindi ? 'शिकायत निवारण' : 'Grievance Officer'}</a>
            <a href="/sitemap" onClick={(e) => { e.preventDefault(); onNavigateStatic('sitemap'); }} className="hover:text-white underline">{isHindi ? 'साइटमैप' : 'Sitemap'}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
