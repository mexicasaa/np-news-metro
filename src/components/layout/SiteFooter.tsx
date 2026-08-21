import React from 'react';
import { Mail, ArrowRight, ShieldCheck, Rss, Globe, Award, ExternalLink } from 'lucide-react';
import { mockCategories } from '../../data/mockWpData';
import { useLanguage } from '../../context/LanguageContext';

interface SiteFooterProps {
  onNavigateCategory: (slug: string) => void;
  onNavigateStatic: (page: string) => void;
  onOpenNewsletter: () => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({
  onNavigateCategory,
  onNavigateStatic,
  onOpenNewsletter,
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
              <li><button onClick={() => onNavigateCategory('india')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'राष्ट्रीय समाचार' : 'National News'}</button></li>
              <li><button onClick={() => onNavigateCategory('politics')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संसद एवं चुनाव' : 'Parliament & Elections'}</button></li>
              <li><button onClick={() => onNavigateCategory('india')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'सुप्रीम कोर्ट एवं कानून' : 'Supreme Court & Law'}</button></li>
              <li><button onClick={() => onNavigateCategory('india')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'राज्य एवं क्षेत्र' : 'States & Territories'}</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'व्यापार एवं अर्थव्यवस्था' : 'Business & Economy'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><button onClick={() => onNavigateCategory('business')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'शेयर बाजार एवं सेंसेक्स' : 'Markets & Sensex'}</button></li>
              <li><button onClick={() => onNavigateCategory('economy')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'अर्थव्यवस्था एवं जीडीपी' : 'Macroeconomy & GDP'}</button></li>
              <li><button onClick={() => onNavigateCategory('business')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'स्टार्टअप्स एवं यूनिकॉर्न्स' : 'Startups & Tech Unicorns'}</button></li>
              <li><button onClick={() => onNavigateCategory('economy')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'आरबीआई एवं मौद्रिक नीति' : 'RBI & Monetary Policy'}</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'तकनीक एवं वैश्विक' : 'Tech & Global'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><button onClick={() => onNavigateCategory('technology')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'एआई एवं डीप टेक' : 'AI & Deep Tech'}</button></li>
              <li><button onClick={() => onNavigateCategory('technology')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'सेमीकंडक्टर मिशन' : 'Semiconductor Mission'}</button></li>
              <li><button onClick={() => onNavigateCategory('world')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'वैश्विक मामले एवं G20' : 'World Affairs & G20'}</button></li>
              <li><button onClick={() => onNavigateCategory('world')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'कूटनीति एवं व्यापार' : 'Diplomacy & Trade'}</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'संस्कृति एवं खेल' : 'Culture & Sports'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><button onClick={() => onNavigateCategory('sports')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'क्रिकेट एवं टेस्ट सीरीज' : 'Cricket & Test Series'}</button></li>
              <li><button onClick={() => onNavigateCategory('sports')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'ओलंपिक एवं एथलेटिक्स' : 'Olympics & Athletics'}</button></li>
              <li><button onClick={() => onNavigateCategory('entertainment')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'सिनेमा एवं राष्ट्रीय पुरस्कार' : 'Cinema & National Awards'}</button></li>
              <li><button onClick={() => onNavigateCategory('lifestyle')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'विरासत एवं पर्यावरण' : 'Heritage & Environment'}</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'विचार एवं विश्लेषण' : 'Opinion & Analysis'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><button onClick={() => onNavigateCategory('opinion')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'दैनिक संपादकीय' : 'The Daily Editorial'}</button></li>
              <li><button onClick={() => onNavigateCategory('opinion')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'स्तंभकार एवं निबंध' : 'Columnists & Essays'}</button></li>
              <li><button onClick={() => onNavigateCategory('opinion')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'नीतिगत शोधपत्र' : 'Policy Papers'}</button></li>
              <li><button onClick={() => onNavigateCategory('opinion')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संपादक को पत्र' : 'Letters to Editor'}</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-700">
              {isHindi ? 'मानक एवं नीतियां' : 'Standards & Policies'}
            </h5>
            <ul className="space-y-1.5 text-slate-300">
              <li><button onClick={() => onNavigateStatic('editorial-team')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संपादकीय मंडल' : 'Editorial Board'}</button></li>
              <li><button onClick={() => onNavigateStatic('ethics')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संपादकीय नीति' : 'Editorial Policy'}</button></li>
              <li><button onClick={() => onNavigateStatic('corrections')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'संशोधन एवं निवारण' : 'Corrections & Redressal'}</button></li>
              <li><button onClick={() => onNavigateStatic('advertise')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'विज्ञापन दें' : 'Advertise with Us'}</button></li>
              <li><button onClick={() => onNavigateStatic('contact')} className="hover:text-secondary-gold transition-colors">{isHindi ? 'न्यूज़रूम से संपर्क करें' : 'Contact Newsroom'}</button></li>
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

          <div className="flex items-center gap-3">
            <button onClick={() => onNavigateStatic('rss')} className="flex items-center gap-1 hover:text-white transition-colors">
              <Rss className="w-3 h-3 text-amber-500" />
              <span>{isHindi ? 'आरएसएस फ़ीड' : 'RSS Feeds'}</span>
            </button>
            <span>•</span>
            <button onClick={() => onNavigateStatic('sitemap')} className="hover:text-white transition-colors">
              {isHindi ? 'समाचार साइटमैप' : 'News Sitemap'}
            </button>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            <p>{t.footerCopyright} {t.allRightsReserved}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Registration No. DL/NP-NEWS/2026/8941 • Registered Office: Connaught Place, New Delhi 110001
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
            <button onClick={() => onNavigateStatic('privacy')} className="hover:text-white underline">{t.privacyPolicy}</button>
            <button onClick={() => onNavigateStatic('terms')} className="hover:text-white underline">{t.termsOfService}</button>
            <button onClick={() => onNavigateStatic('cookie-policy')} className="hover:text-white underline">{isHindi ? 'कुकी सेटिंग्स' : 'Cookie Settings'}</button>
            <button onClick={() => onNavigateStatic('ethics')} className="hover:text-white underline">{t.editorialPolicy}</button>
            <button onClick={() => onNavigateStatic('corrections')} className="hover:text-white underline">{isHindi ? 'शिकायत निवारण' : 'Grievance Officer'}</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
