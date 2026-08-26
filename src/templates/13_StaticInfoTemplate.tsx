import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Award, Mail, Phone, MapPin, Send, CheckCircle2, 
  FileText, Users, DollarSign, AlertCircle, Sparkles, Building, Globe, 
  ExternalLink, Rss, Scale, Lock, BookOpen, AlertTriangle, HelpCircle, 
  CheckCircle, ChevronRight, Copy, Check, ArrowRight, Share2, Feather, Newspaper, BadgeCheck
} from 'lucide-react';
import { mockAuthors } from '../data/mockWpData';
import { AuthorCard } from '../components/cards/AuthorCard';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';
import { getAuthorAvatarUrl, handleAvatarError } from '../utils/imageFallback';

export type StaticPageType = 
  | 'about' 
  | 'editorial-team' 
  | 'ethics' 
  | 'corrections' 
  | 'contact' 
  | 'advertise' 
  | 'privacy' 
  | 'disclaimer'
  | 'terms'
  | 'cookie-policy'
  | 'sitemap'
  | 'epaper';

interface StaticInfoTemplateProps {
  initialPage?: StaticPageType;
  onNavigateHome: () => void;
  onSelectAuthor: (authorId: string) => void;
  onNavigateCategory?: (category: string) => void;
}

export const StaticInfoTemplate: React.FC<StaticInfoTemplateProps> = ({
  initialPage = 'about',
  onNavigateHome,
  onSelectAuthor,
  onNavigateCategory,
}) => {
  const [currentPage, setCurrentPage] = useState<StaticPageType>(initialPage);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const { t, isHindi } = useLanguage();

  useEffect(() => {
    setCurrentPage(initialPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialPage]);

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    }
  };

  const menuItems = [
    { id: 'about', label: isHindi ? 'एनपी न्यूज़ मेट्रो के बारे में' : 'About NP News Metro', icon: Building },
    { id: 'editorial-team', label: isHindi ? 'संपादकीय बोर्ड एवं नेतृत्व' : 'Editorial Board & Leadership', icon: Users },
    { id: 'ethics', label: isHindi ? 'आचार संहिता एवं मानक' : 'Code of Ethics & Standards', icon: ShieldCheck },
    { id: 'corrections', label: isHindi ? 'सुधार एवं निवारण नीति' : 'Corrections & Grievance', icon: AlertCircle },
    { id: 'contact', label: isHindi ? 'न्यूज़रूम संपर्क एवं सुझाव' : 'Contact Us & Tip-Offs', icon: Mail },
    { id: 'advertise', label: isHindi ? 'विज्ञापन एवं साझेदारी' : 'Advertise with Us', icon: DollarSign },
    { id: 'privacy', label: isHindi ? 'गोपनीयता नीति' : 'Privacy Policy', icon: Lock },
    { id: 'disclaimer', label: isHindi ? 'अस्वीकरण (डिस्क्लेमर)' : 'Disclaimer', icon: AlertTriangle },
    { id: 'terms', label: isHindi ? 'सेवा की शर्तें एवं नियम' : 'Terms & Conditions', icon: Scale },
    { id: 'cookie-policy', label: isHindi ? 'कुकी नीति एवं सेटिंग्स' : 'Cookie Policy', icon: FileText },
    { id: 'sitemap', label: isHindi ? 'साइट डायरेक्टरी एवं साइटमैप' : 'Sitemap Directory', icon: Globe },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const activeItemLabel = menuItems.find((m) => m.id === currentPage)?.label || (isHindi ? 'परिचय' : 'About');

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'संस्थागत नीतियां एवं जानकारी' : 'Institutional Information & Policies', onClick: () => setCurrentPage('about') },
          { label: activeItemLabel, isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-6 sm:py-8">
        {/* Mobile Horizontal Navigation Carousel */}
        <div className="lg:hidden mb-6 overflow-x-auto hide-scrollbar flex items-center gap-2 pb-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id as StaticPageType);
                  setFormSubmitted(false);
                  if (typeof window !== 'undefined') {
                    window.history.pushState({ view: 'public', static: item.id }, '', `/${item.id}`);
                  }
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-surface-lowest border border-border-subtle text-ink hover:bg-surface-container'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-secondary-gold' : 'text-ink-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle space-y-1 sticky top-24">
            <div className="px-3 py-2 border-b border-border-subtle mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-editorial-red block">NP News Metro</span>
              <h3 className="font-serif text-base font-bold text-ink">
                {isHindi ? 'संस्थागत डायरेक्टरी' : 'Institutional Directory'}
              </h3>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as StaticPageType);
                    setFormSubmitted(false);
                    if (typeof window !== 'undefined') {
                      window.history.pushState({ view: 'public', static: item.id }, '', `/${item.id}`);
                    }
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-sm text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'text-ink hover:bg-surface-container hover:text-primary'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-secondary-gold' : 'text-ink-muted'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Statutory Redressal Quick Callout */}
            <div className="pt-4 mt-4 border-t border-border-subtle p-3.5 bg-surface-container/60 rounded-sm text-[11px] text-ink-secondary space-y-2">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-editorial-red" />
                <span>{isHindi ? 'कानूनी शिकायत एवं पंजीकरण' : 'Statutory & RNI Credentials'}</span>
              </div>
              
              <div className="bg-white p-2 rounded border border-border-subtle text-[10px] space-y-0.5">
                <span className="text-ink-muted uppercase font-bold text-[9px] tracking-wider block">
                  {isHindi ? 'आरएनआई पंजीकरण संख्या:' : 'RNI Registration No:'}
                </span>
                <span className="font-mono text-ink font-bold block">
                  DEL HIN/2010/31544
                </span>
                <span className="text-ink-secondary text-[10px] block">
                  {isHindi ? 'द्वारा: मेट्रोमैट दिल्ली' : 'by Metromat Delhi'}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed">
                {isHindi 
                  ? 'डिजिटल मीडिया आचार संहिता नियम 2021 के तहत शिकायत निवारण अधिकारी:' 
                  : 'Grievance Officer under Information Technology Rules 2021:'}
              </p>
              <div className="flex items-center justify-between bg-white p-1.5 rounded border border-border-subtle text-[10px] font-mono text-ink">
                <span>grievance@npnewsmetro.com</span>
                <button 
                  onClick={() => handleCopy('grievance@npnewsmetro.com')}
                  className="text-ink-muted hover:text-primary transition-colors cursor-pointer"
                  title="Copy email"
                >
                  {copiedEmail === 'grievance@npnewsmetro.com' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content Panel (8 cols) */}
          <section className="lg:col-span-8 bg-surface-lowest border border-border-subtle p-6 sm:p-10 rounded-sm shadow-subtle">
            
            {/* =========================================================================
                1. ABOUT US
               ========================================================================= */}
            {currentPage === 'about' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-editorial-red" />
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                      {isHindi ? 'संस्थागत घोषणापत्र' : 'Institutional Charter & Mission'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'एनपी न्यूज़ मेट्रो के बारे में' : 'About NP News Metro'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'सटीक समाचार। वास्तविक प्रभाव। • राष्ट्रीय डिजिटल समाचार पत्र' : 'Real News. Real Impact. • Independent National Digital Newspaper'}
                  </p>
                </div>

                <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r text-sm text-ink font-serif italic leading-relaxed">
                  {isHindi
                    ? '“सटीक समाचार। वास्तविक प्रभाव।” — इस मूल लोकतांत्रिक सिद्धांत पर स्थापित कि एक स्वतंत्र, निष्पक्ष और निर्भीक प्रेस ही भारत के 140 करोड़ नागरिकों और संवैधानिक लोकतंत्र की सबसे सशक्त पहरेदार है।'
                    : '“Real News. Real Impact.” — Founded on the democratic conviction that a fearless, independent, and evidence-based press is the indispensable safeguard of constitutional democracy and an empowered citizenry.'}
                </div>

                <div className="prose text-sm text-ink-secondary space-y-4 leading-relaxed">
                  <h3 className="font-serif text-lg font-bold text-ink">
                    {isHindi ? '१. हमारा परिचय एवं दृष्टिकोण' : '1. Who We Are & Our Editorial Vision'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'नई दिल्ली स्थित राष्ट्रीय मुख्यालय से संचालित, एनपी न्यूज़ मेट्रो (NP News Metro) भारत का एक अग्रणी और निष्पक्ष डिजिटल समाचार प्रकाशन है। हम संवेदनशील राजनीतिक रिपोर्टिंग, गहन व्यापक आर्थिक जांच, संसद एवं कानूनी विश्लेषण, रक्षा एवं विदेश नीति, पर्यावरण तथा आधुनिक प्रौद्योगिकी के क्षेत्र में बिना किसी भय या पक्षपात के निर्भीक पत्रकारिता प्रस्तुत करते हैं।'
                      : 'Headquartered in New Delhi, NP News Metro is a premier independent digital news publication delivering rigorous investigative journalism, macroeconomic scrutiny, parliamentary analysis, national security dispatches, and grassroots reporting from across India and the world.'}
                  </p>
                  <p>
                    {isHindi
                      ? 'आज के तेज़-तर्रार डिजिटल युग में जहां सनसनीखेज हेडलाइंस और क्लिकबेट हावी हैं, एनपी न्यूज़ मेट्रो प्राथमिक दस्तावेजी साक्ष्यों, ज़मीनी पड़ताल और निष्पक्ष संतुलन के साथ काम करता है। हमारे वरिष्ठ संवाददाता और ब्यूरो प्रमुख देश के प्रमुख महानगरों और राज्यों में तैनात हैं।'
                      : 'In an era overwhelmed by sensationalism and partisan noise, NP News Metro is engineered for depth, verification, and contextual clarity. Our veteran correspondents across major metropolitan hubs and state capitals provide factual context to key developments shaping modern India.'}
                  </p>

                  <h3 className="font-serif text-lg font-bold text-ink pt-2">
                    {isHindi ? '२. हमारे मुख्य संपादकीय स्तंभ' : '2. Core Editorial Pillars'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 bg-surface-container/70 rounded border border-border-subtle space-y-1.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-editorial-red" />
                        <h4 className="font-serif font-bold text-ink text-sm">
                          {isHindi ? 'प्राथमिक दस्तावेजी सत्यापन' : 'Primary Source Verification'}
                        </h4>
                      </div>
                      <p className="text-xs text-ink-secondary leading-normal">
                        {isHindi
                          ? 'हर रिपोर्ट को आरटीआई, अदालती रिकॉर्ड, आधिकारिक गजट और ऑन-रिकॉर्ड साक्षात्कारों द्वारा कम से कम दो स्वतंत्र स्तरों पर परखा जाता है।'
                          : 'Every report is corroborated across primary documentary records, court filings, official gazettes, and verified on-record sources.'}
                      </p>
                    </div>

                    <div className="p-4 bg-surface-container/70 rounded border border-border-subtle space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-editorial-red" />
                        <h4 className="font-serif font-bold text-ink text-sm">
                          {isHindi ? 'समाचार और विचार का स्पष्ट अंतर' : 'Strict News vs. Opinion Wall'}
                        </h4>
                      </div>
                      <p className="text-xs text-ink-secondary leading-normal">
                        {isHindi
                          ? 'वस्तुनिष्ठ समाचार रिपोर्टिंग और संपादकीय विचार निबंधों के बीच स्पष्ट विभाजन। सभी विश्लेषणात्मक लेख स्पष्ट रूप से चिह्नित होते हैं।'
                          : 'Uncompromising separation between objective factual reporting and signed analytical commentary or opinion essays.'}
                      </p>
                    </div>

                    <div className="p-4 bg-surface-container/70 rounded border border-border-subtle space-y-1.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-editorial-red" />
                        <h4 className="font-serif font-bold text-ink text-sm">
                          {isHindi ? 'व्यावसायिक स्वतंत्रता' : 'Commercial Independence'}
                        </h4>
                      </div>
                      <p className="text-xs text-ink-secondary leading-normal">
                        {isHindi
                          ? 'विज्ञापनों, प्रायोजनों या व्यावसायिक अनुबंधों का समाचार चयन या संपादकीय रुख पर शून्य प्रभाव होता है।'
                          : 'Advertisers and commercial sponsors exercise zero influence over editorial judgment, story assignments, or investigations.'}
                      </p>
                    </div>

                    <div className="p-4 bg-surface-container/70 rounded border border-border-subtle space-y-1.5">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-editorial-red" />
                        <h4 className="font-serif font-bold text-ink text-sm">
                          {isHindi ? 'त्वरित एवं पारदर्शी सुधार' : 'Transparent Corrections'}
                        </h4>
                      </div>
                      <p className="text-xs text-ink-secondary leading-normal">
                        {isHindi
                          ? 'यदि किसी तथ्य में अनजाने में कोई त्रुटि होती है, तो उसे छिपाने के बजाय तुरंत प्रमुखता से संशोधित किया जाता है।'
                          : 'Factual discrepancies are acknowledged promptly with prominent, public correction notices preserving full accountability.'}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-ink pt-2">
                    {isHindi ? '३. राष्ट्रीय ब्यूरो नेटवर्क एवं वैधानिक साख' : '3. National Bureau Network & Statutory Credentials'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'एनपी न्यूज़ मेट्रो का राष्ट्रीय संपादकीय मुख्यालय कनाट प्लेस, नई दिल्ली में स्थित है। हमारे क्षेत्रीय ब्यूरो मुंबई (वित्तीय राजधानी), बेंगलुरु (प्रौद्योगिकी हब), चेन्नई, कोलकाता, हैदराबाद और चंडीगढ़ में सक्रिय हैं।'
                      : 'Our national newsroom operates out of Connaught Place, New Delhi, supported by specialized bureaus in Mumbai (Financial Markets), Bengaluru (Technology & AI), Chennai, Kolkata, Hyderabad, and Chandigarh.'}
                  </p>

                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded text-xs text-ink space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <Building className="w-4 h-4 text-amber-700" />
                      <span>{isHindi ? 'आरएनआई एवं संस्थागत पंजीकरण विवरण:' : 'RNI & Institutional Registration Credentials:'}</span>
                    </div>
                    <p className="text-[11px] text-ink-secondary">
                      <strong>RNI Title Code / Reg. No.:</strong> <span className="font-mono font-bold text-ink">DEL HIN/2010/31544</span> (by Metromat Delhi / मेट्रोमैट दिल्ली)
                    </p>
                  </div>
                </div>
              </article>
            )}

            {/* =========================================================================
                2. CONTACT US & TIP-OFFS
               ========================================================================= */}
            {currentPage === 'contact' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-editorial-red" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      {isHindi ? 'संपर्क केंद्र' : 'Newsroom Directory & Inquiries'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'न्यूज़रूम संपर्क एवं गोपनीय सुझाव' : 'Contact Us & Confidential News Tips'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'संपादकीय डेस्क, शिकायत निवारण, विज्ञापन एवं व्हिसलब्लोअर हेल्पलाइन' : 'Editorial desks, bureau offices, grievance redressal, and secure whistleblower communications'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container/60 rounded border border-border-subtle space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Building className="w-4 h-4 text-editorial-red" />
                      <span>{isHindi ? 'राष्ट्रीय मुख्यालय (New Delhi HQ)' : 'National Headquarters'}</span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      <strong>NP News Metro Media Network Pvt. Ltd.</strong><br />
                      4th Floor, Statesman House, Barakhamba Road, Connaught Place,<br />
                      New Delhi – 110001, India.
                    </p>
                    <div className="text-[11px] text-ink-muted bg-white p-1.5 rounded border border-border-subtle font-mono">
                      <strong>RNI No:</strong> DEL HIN/2010/31544 (by Metromat Delhi)
                    </div>
                    <p className="text-xs text-ink font-semibold">
                      {isHindi ? 'फोन:' : 'Phone:'} +91 (11) 4982-3100
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 rounded border border-border-subtle space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Globe className="w-4 h-4 text-editorial-red" />
                      <span>{isHindi ? 'प्रमुख क्षेत्रीय ब्यूरो' : 'Regional Bureaus'}</span>
                    </div>
                    <ul className="text-xs text-ink-secondary space-y-1">
                      <li>• <strong>Mumbai:</strong> Express Towers, Nariman Point, Mumbai 400021</li>
                      <li>• <strong>Bengaluru:</strong> Brigade Road, MG Road, Bengaluru 560001</li>
                      <li>• <strong>Kolkata:</strong> BBD Bagh, Central Kolkata 700001</li>
                    </ul>
                  </div>
                </div>

                {/* Desk Email Directory */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-serif text-base font-bold text-ink">
                    {isHindi ? 'विभागीय संपर्क सूत्र (Email Directory)' : 'Departmental Email Desks'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white border border-border-subtle rounded flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink block">{isHindi ? 'संपादक एवं मुख्य डेस्क' : 'Editor-in-Chief & General Desk'}</span>
                        <span className="text-ink-secondary font-mono text-[11px]">editor@npnewsmetro.com</span>
                      </div>
                      <button onClick={() => handleCopy('editor@npnewsmetro.com')} className="p-1.5 text-ink-muted hover:text-primary cursor-pointer">
                        {copiedEmail === 'editor@npnewsmetro.com' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-3 bg-white border border-border-subtle rounded flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink block">{isHindi ? 'ब्रेकिंग न्यूज़ एवं प्रेस विज्ञप्ति' : 'News Desk & Press Releases'}</span>
                        <span className="text-ink-secondary font-mono text-[11px]">newsdesk@npnewsmetro.com</span>
                      </div>
                      <button onClick={() => handleCopy('newsdesk@npnewsmetro.com')} className="p-1.5 text-ink-muted hover:text-primary cursor-pointer">
                        {copiedEmail === 'newsdesk@npnewsmetro.com' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-3 bg-white border border-border-subtle rounded flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink block">{isHindi ? 'गोपनीय व्हिसलब्लोअर सुझाव' : 'Confidential Whistleblower Tips'}</span>
                        <span className="text-ink-secondary font-mono text-[11px]">tips@npnewsmetro.com</span>
                      </div>
                      <button onClick={() => handleCopy('tips@npnewsmetro.com')} className="p-1.5 text-ink-muted hover:text-primary cursor-pointer">
                        {copiedEmail === 'tips@npnewsmetro.com' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-3 bg-white border border-border-subtle rounded flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink block">{isHindi ? 'विज्ञापन एवं व्यावसायिक' : 'Commercial & Advertising'}</span>
                        <span className="text-ink-secondary font-mono text-[11px]">advertise@npnewsmetro.com</span>
                      </div>
                      <button onClick={() => handleCopy('advertise@npnewsmetro.com')} className="p-1.5 text-ink-muted hover:text-primary cursor-pointer">
                        {copiedEmail === 'advertise@npnewsmetro.com' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct Message Form */}
                <div className="pt-4 border-t border-border-subtle">
                  <h3 className="font-serif text-lg font-bold text-ink mb-3">
                    {isHindi ? 'सीधा संदेश या समाचार सुझाव भेजें' : 'Send a Direct Message or Story Tip'}
                  </h3>

                  {formSubmitted ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                      <h4 className="font-serif text-lg font-bold text-ink">
                        {isHindi ? 'संदेश सफलतापूर्वक प्राप्त हुआ' : 'Message Successfully Transmitted'}
                      </h4>
                      <p className="text-xs text-ink-secondary max-w-md mx-auto">
                        {isHindi
                          ? 'धन्यवाद। आपका संदेश संबंधित डेस्क संपादक को भेज दिया गया है। गोपनीय साक्ष्यों की पुष्टि होने पर हमारी टीम आपसे संपर्क करेगी।'
                          : 'Thank you for reaching out. Your communication has been dispatched to the relevant editorial desk.'}
                      </p>
                      <button 
                        onClick={() => setFormSubmitted(false)}
                        className="mt-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded cursor-pointer"
                      >
                        {isHindi ? 'नया संदेश भेजें' : 'Send Another Message'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold uppercase text-ink mb-1">
                            {isHindi ? 'पूरा नाम' : 'Your Full Name'} *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={isHindi ? 'उदा. राकेश कुमार' : 'e.g. Rakesh Kumar'}
                            className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs text-ink focus:outline-hidden focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase text-ink mb-1">
                            {isHindi ? 'ईमेल पता' : 'Email Address'} *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="rakesh@example.com"
                            className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs text-ink focus:outline-hidden focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold uppercase text-ink mb-1">
                            {isHindi ? 'फोन / मोबाइल नंबर (वैकल्पिक)' : 'Phone Number (Optional)'}
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs text-ink focus:outline-hidden focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase text-ink mb-1">
                            {isHindi ? 'संबंधित विभाग / डेस्क' : 'Department / Desk'} *
                          </label>
                          <select 
                            aria-label="Select Desk" 
                            className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs text-ink focus:outline-hidden focus:border-primary"
                          >
                            <option>{isHindi ? 'गोपनीय व्हिसलब्लोअर सुझाव / दस्तावेज' : 'Confidential News Tip / Whistleblower'}</option>
                            <option>{isHindi ? 'संपादकीय प्रश्न एवं समाचार कवरेज' : 'Editorial News Desk / Story Idea'}</option>
                            <option>{isHindi ? 'तथ्य सुधार एवं संशोधन अनुरोध' : 'Correction / Fact-Check Request'}</option>
                            <option>{isHindi ? 'संपादक के नाम पत्र (Letters to Editor)' : 'Letters to the Editor'}</option>
                            <option>{isHindi ? 'विज्ञापन एवं ब्रांड साझेदारी' : 'Advertising & Sponsorships'}</option>
                            <option>{isHindi ? 'कानूनी एवं शिकायत निवारण' : 'Legal & Grievance Redressal'}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-ink mb-1">
                          {isHindi ? 'विषय' : 'Subject'} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={isHindi ? 'संदेश का संक्षिप्त शीर्षक...' : 'Brief summary of your query or tip...'}
                          className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs text-ink focus:outline-hidden focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-ink mb-1">
                          {isHindi ? 'विस्तृत संदेश / साक्ष्य विवरण' : 'Detailed Message / Documentation Notes'} *
                        </label>
                        <textarea
                          rows={4}
                          required
                          placeholder={isHindi ? 'कृपया सत्यापन योग्य विवरण, संदर्भ या प्रश्न लिखें...' : 'Provide background context, document references, or your specific questions...'}
                          className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs text-ink focus:outline-hidden focus:border-primary leading-relaxed"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'न्यूज़रूम को प्रेषित करें' : 'Submit to Newsroom'}</span>
                      </button>
                    </form>
                  )}
                </div>
              </article>
            )}

            {/* =========================================================================
                3. PRIVACY POLICY
               ========================================================================= */}
            {currentPage === 'privacy' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-editorial-red" />
                    <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                      {isHindi ? 'डेटा सुरक्षा एवं निजता' : 'Data Protection & Compliance'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'अंतिम अद्यतन: 25 अगस्त 2026 • डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 के अनुरूप' : 'Last Updated: August 25, 2026 • Compliant with Digital Personal Data Protection Act, 2023 & IT Act, 2000'}
                  </p>
                </div>

                <div className="prose text-xs sm:text-sm text-ink-secondary space-y-4 leading-relaxed">
                  <p>
                    {isHindi
                      ? 'एनपी न्यूज़ मेट्रो (NP News Metro — npnewsmetro.com) अपने पाठकों, ग्राहकों और उपयोगकर्ताओं की निजता का पूर्ण सम्मान करता है। यह गोपनीयता नीति स्पष्ट करती है कि जब आप हमारी वेबसाइट, ई-पेपर, आरएसएस फ़ीड या डिजिटल सेवाओं का उपयोग करते हैं, तो हम आपकी जानकारी को किस प्रकार एकत्रित, उपयोग, सुरक्षित और संसाधित करते हैं।'
                      : 'NP News Metro ("we", "our", or "us", accessible via npnewsmetro.com) is committed to protecting the privacy, confidentiality, and data sovereignty of our readers. This Privacy Policy details the types of information we collect, how it is processed, and the measures we undertake to safeguard your personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '१. हम क्या जानकारी एकत्रित करते हैं' : '1. Information We Collect'}
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <strong>A. {isHindi ? 'उपयोगकर्ता द्वारा स्वेच्छा से दी गई जानकारी:' : 'Information Voluntarily Provided:'}</strong>{' '}
                      {isHindi
                        ? 'जब आप हमारे दैनिक न्यूज़लेटर "The Morning Executive Briefing" की सदस्यता लेते हैं, टिप्पणी पोस्ट करते हैं, या संपर्क फ़ॉर्म के माध्यम से संदेश भेजते हैं, तो हम आपका नाम, ईमेल पता और संदेश विवरण प्राप्त करते हैं।'
                        : 'When you subscribe to executive newsletters, submit comments, or contact our newsroom, you may provide identifying data such as your name, email address, and message contents.'}
                    </p>
                    <p>
                      <strong>B. {isHindi ? 'स्वचालित तकनीकी डेटा (Log Data & Telemetry):' : 'Automated Log & Device Data:'}</strong>{' '}
                      {isHindi
                        ? 'वेबसाइट सुरक्षा, स्पैम नियंत्रण और कोर वेब विटल्स (Core Web Vitals) निगरानी के लिए हमारा सर्वर स्वचालित रूप से इंटरनेट प्रोटोकॉल (IP) पता, ब्राउज़र का प्रकार, ऑपरेटिंग सिस्टम, रेफ़रर यूआरएल और पृष्ठ दृश्य अवधि रिकॉर्ड कर सकता है।'
                        : 'For security monitoring, spam prevention, and Core Web Vitals optimization, our servers automatically log technical metadata such as anonymized IP addresses, browser user-agents, operating systems, referring URLs, and timestamps.'}
                    </p>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '२. कुकीज़, वेब बीकन और Google AdSense' : '2. Cookies, Web Beacons & Google AdSense'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'एनपी न्यूज़ मेट्रो पाठक अनुभव को सुगम बनाने, भाषा प्राथमिकताएं (हिंदी/अंग्रेजी) सहेजने और प्रासंगिक डिजिटल सामग्री प्रदर्शित करने के लिए कुकीज़ का उपयोग करता है।'
                      : 'We utilize standard HTTP cookies, local storage identifiers, and web beacons to preserve language selections (Hindi/English), secure sessions, and deliver high-performance editorial feeds.'}
                  </p>
                  <div className="p-3.5 bg-surface-container/70 border border-border-subtle rounded text-xs space-y-1.5">
                    <strong className="text-ink block">{isHindi ? 'तृतीय-पक्ष विज्ञापन एवं Google AdSense प्रकटीकरण:' : 'Third-Party Advertising & Google AdSense Disclosure:'}</strong>
                    <p>
                      {isHindi
                        ? 'Google एक तृतीय-पक्ष विक्रेता के रूप में हमारी साइट पर विज्ञापन प्रदर्शित करने के लिए कुकीज़ (जैसे DART कुकी) का उपयोग करता है। उपयोगकर्ता Google के विज्ञापन सेटिंग्स (adssettings.google.com) पर जाकर व्यक्तिगत विज्ञापनों से बाहर निकलने (Opt-out) का विकल्प चुन सकते हैं।'
                        : 'Google, as a third-party vendor, uses cookies to serve advertisements on npnewsmetro.com. Google\'s use of advertising cookies enables it and its partners to serve ads based on your visits to our site and other destinations across the web. You may opt out of personalized advertising by visiting Google Ads Settings (https://adssettings.google.com) or www.aboutads.info.'}
                    </p>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '३. डेटा का उपयोग और नो-सेल गारंटी' : '3. How We Use Your Data & Zero-Sale Guarantee'}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>{isHindi ? 'मांगी गई समाचार सामग्री, संपादकीय विश्लेषण और दैनिक ब्रीफिंग वितरित करने के लिए।' : 'To deliver requested news dispatches, breaking alerts, and editorial newsletters.'}</li>
                    <li>{isHindi ? 'साइबर हमलों, डीडीओएस (DDoS) और स्पैम टिप्पणियों से वेबसाइट की सुरक्षा के लिए।' : 'To prevent malicious cyber attacks, unauthorized scraping, and spam submissions.'}</li>
                    <li>{isHindi ? 'हम पाठकों का व्यक्तिगत डेटा किसी भी तृतीय-पक्ष डेटा ब्रोकर या विज्ञापनदाता को कभी नहीं बेचते हैं।' : 'We NEVER sell, monetize, rent, or trade reader personal data to third-party brokers or aggregators.'}</li>
                  </ul>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '४. डेटा सुरक्षा एवं उपयोगकर्ता अधिकार' : '4. Data Security & Your Legal Rights'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'हम आपकी जानकारी को एन्क्रिप्टेड प्रोटोकॉल (TLS 1.3/HTTPS) और आधुनिक क्लाउड सुरक्षा के साथ सुरक्षित रखते हैं। पाठकों को अपनी व्यक्तिगत जानकारी देखने, सुधारने या स्थायी रूप से हटाने का पूरा अधिकार है।'
                      : 'All data transmissions are protected via modern TLS 1.3 encryption. Under the DPDP Act 2023, you retain the full right to access, rectify, or request permanent deletion of your stored information by contacting our Data Protection Desk at privacy@npnewsmetro.com.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '५. बच्चों की गोपनीयता' : '5. Children\'s Privacy'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'हमारी वेबसाइट 13 वर्ष से कम आयु के बच्चों के लिए अभिप्रेत नहीं है और हम जानबूझकर बच्चों की व्यक्तिगत जानकारी एकत्र नहीं करते हैं।'
                      : 'NP News Metro is an adult news and current-affairs platform. We do not knowingly solicit or collect personal identifying data from children under 13.'}
                  </p>
                </div>
              </article>
            )}

            {/* =========================================================================
                4. DISCLAIMER
               ========================================================================= */}
            {currentPage === 'disclaimer' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                      {isHindi ? 'कानूनी अस्वीकरण' : 'Legal & Editorial Disclaimer'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'अस्वीकरण (Disclaimer)' : 'Disclaimer & Terms of Notice'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'समाचार, वित्तीय बाज़ार विश्लेषण, राय एवं तृतीय-पक्ष संदर्भ संबंधी घोषणाएं' : 'Factual reporting, financial analysis, healthcare information, opinion columns, and external link disclaimers'}
                  </p>
                </div>

                <div className="prose text-xs sm:text-sm text-ink-secondary space-y-4 leading-relaxed">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950">
                    <strong className="block font-bold mb-1">
                      {isHindi ? 'सामान्य सूचनात्मक प्रकटीकरण:' : 'General Information Disclosure:'}
                    </strong>
                    <p>
                      {isHindi
                        ? 'एनपी न्यूज़ मेट्रो (npnewsmetro.com) पर प्रकाशित सभी समाचार, विश्लेषण, लेख और मल्टीमीडिया सामग्री केवल सामान्य जन-जागरूकता, शिक्षा और निष्पक्ष सूचना के उद्देश्य से प्रस्तुत की जाती है।'
                        : 'All news reports, investigative analyses, articles, and multimedia assets published on NP News Metro are provided for general informational, educational, and public interest purposes only.'}
                    </p>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '१. वित्तीय, शेयर बाज़ार एवं निवेश अस्वीकरण' : '1. Financial Markets & Investment Disclaimer'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'शेयर बाज़ार (BSE Sensex, NSE Nifty), म्यूचुअल फंड, इक्विटी, क्रिप्टोकरेंसी, कमोडिटी और आर्थिक नीतियों पर प्रकाशित रिपोर्ट विशुद्ध रूप से पत्रकारिता विश्लेषण हैं। यह किसी भी प्रकार की वित्तीय सलाह, निवेश सिफ़ारिश या स्टॉक टिप नहीं है। एनपी न्यूज़ मेट्रो सेबी (SEBI) पंजीकृत निवेश सलाहकार नहीं है। कोई भी वित्तीय निर्णय लेने से पहले कृपया प्रमाणित वित्तीय योजनाकार (Certified Financial Planner) से परामर्श करें।'
                      : 'All coverage of stock markets (BSE Sensex, NSE Nifty), equities, mutual funds, cryptocurrency, macroeconomic trends, and corporate earnings is journalistic in nature and DOES NOT constitute financial, investment, legal, or tax advice. NP News Metro is NOT a SEBI-registered investment advisor. Readers must conduct independent due diligence or consult licensed financial advisors before executing any financial trades.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '२. स्वास्थ्य एवं चिकित्सा संबंधी अस्वीकरण' : '2. Health, Medical & Wellness Disclaimer'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'स्वास्थ्य, जीवनशैली और कल्याण से जुड़े लेख केवल सामान्य जानकारी के लिए हैं और यह पेशेवर चिकित्सा सलाह, निदान या नैदानिक उपचार का विकल्प नहीं हैं। स्वास्थ्य संबंधी किसी भी प्रश्न के लिए हमेशा योग्य चिकित्सक से संपर्क करें।'
                      : 'Articles addressing health, nutrition, wellness, and medical science are for general awareness and are not a substitute for professional medical advice, clinical diagnosis, or treatment by a qualified healthcare practitioner.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '३. विचार एवं स्तंभकारों की व्यक्तिगत राय' : '3. Opinion Columns & Guest Analyses'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'विचार (Opinion), संपादकीय स्तंभ और विश्लेषण अनुभाग में व्यक्त किए गए विचार पूरी तरह से संबंधित लेखकों के हैं। ये विचार आवश्यक रूप से एनपी न्यूज़ मेट्रो या इसके संपादकीय बोर्ड के आधिकारिक रुख को प्रतिबिंबित नहीं करते हैं।'
                      : 'Views and conclusions expressed in Opinion essays, Guest Columns, Letters to the Editor, and Editorial analyses are exclusively those of the individual authors and do not necessarily reflect the official editorial stance of NP News Metro.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '४. बाहरी वेबसाइट लिंक एवं तृतीय-पक्ष विज्ञापन' : '4. External Hyperlinks & Commercial Ads'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'हमारी वेबसाइट में संदर्भ या सूचना के लिए तृतीय-पक्ष वेबसाइटों के लिंक हो सकते हैं। हम बाहरी साइटों की सामग्री या गोपनीयता नीतियों के लिए उत्तरदायी नहीं हैं। प्रायोजित विज्ञापनों में किए गए दावों की संपूर्ण जिम्मेदारी संबंधित विज्ञापनदाता की होती है।'
                      : 'Our website may contain hyperlinks to external government portals, reference archives, or third-party platforms. NP News Metro does not endorse or assume liability for external content. Commercial claims within advertisements are the sole legal responsibility of the respective advertiser.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '५. फेयर यूज़ (Fair Dealing) कॉपीराइट प्रकटीकरण' : '5. Fair Dealing & Copyright Disclosure'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'समाचार समीक्षा, आलोचना और सार्वजनिक रिपोर्टिंग के दौरान उद्धृत सामग्री या स्क्रीनशॉट का उपयोग भारतीय कॉपीराइट अधिनियम, 1957 की धारा 52 के "Fair Dealing" प्रावधानों के तहत किया जाता है।'
                      : 'Quotes, brief excerpts, press photographs, and social media embeds utilized during news reviews and investigative commentary are published under the "Fair Dealing" statutory provisions of Section 52 of the Indian Copyright Act, 1957.'}
                  </p>
                </div>
              </article>
            )}

            {/* =========================================================================
                5. TERMS & CONDITIONS
               ========================================================================= */}
            {currentPage === 'terms' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-4 h-4 text-editorial-red" />
                    <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                      {isHindi ? 'कानूनी नियम एवं उपयोग की शर्तें' : 'Legal Agreement & User Terms'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'सेवा की शर्तें (Terms & Conditions)' : 'Terms & Conditions of Service'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'अंतिम अद्यतन: 25 अगस्त 2026 • वेबसाइट एवं डिजिटल सेवाओं के उपयोग संबंधी नियम' : 'Last Updated: August 25, 2026 • Legally binding terms governing access to npnewsmetro.com'}
                  </p>
                </div>

                <div className="prose text-xs sm:text-sm text-ink-secondary space-y-4 leading-relaxed">
                  <p>
                    {isHindi
                      ? 'एनपी न्यूज़ मेट्रो (npnewsmetro.com) पर आने या इसका उपयोग करने पर, आप इन नियमों और शर्तों से पूर्णतः बंधे रहने के लिए सहमत होते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारी सेवाओं का उपयोग न करें।'
                      : 'By accessing, browsing, reading, or interacting with NP News Metro (npnewsmetro.com) and associated digital feeds, you agree to be legally bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue use immediately.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '१. बौद्धिक संपदा अधिकार एवं कॉपीराइट' : '1. Intellectual Property & Copyright Protection'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'वेबसाइट पर उपलब्ध सभी समाचार रिपोर्ट, लेख, हेडलाइंस, ग्राफिक्स, लोगो, वीडियो, पॉडकास्ट और कोड एनपी न्यूज़ मेट्रो मीडिया नेटवर्क प्रा. लि. की अनन्य बौद्धिक संपदा हैं। पूर्व लिखित अनुमति के बिना किसी भी सामग्री की नकल, पुनर्प्रकाशन, सिंडिकेशन, वेब स्क्रैपिंग या एआई (AI) मॉडल प्रशिक्षण में उपयोग पूर्णतः प्रतिबंधित है।'
                      : 'All articles, investigative reports, photographs, graphics, videos, codebases, audio assets, trademarks, and masthead branding on npnewsmetro.com are the exclusive intellectual property of NP News Metro Media Network Pvt. Ltd. and protected under Indian and international copyright treaties. Unauthorized reproduction, syndication, commercial scraping, or ingestion into Artificial Intelligence (AI) training datasets without explicit prior written license is strictly prohibited.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '२. उपयोगकर्ता आचरण एवं टिप्पणी नीति' : '2. User Conduct & Community Guidelines'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'पाठक टिप्पणियों या संवाद में मानहानिकारक, अश्लील, भड़काऊ, सांप्रदायिक, देशविरोधी या किसी तीसरे पक्ष के कॉपीराइट का उल्लंघन करने वाली सामग्री पोस्ट नहीं करेंगे। एनपी न्यूज़ मेट्रो को किसी भी आपत्तिजनक टिप्पणी को हटाने का पूर्ण अधिकार है।'
                      : 'When participating in comment threads or submitting letters to the editor, users agree not to post content that is defamatory, libelous, obscene, communally inciting, harassing, unlawful, or infringing upon third-party intellectual property. We reserve the absolute right to moderate, edit, or delete any comment violating these standards.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '३. दायित्व की सीमा (Limitation of Liability)' : '3. Limitation of Liability'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'एनपी न्यूज़ मेट्रो या इसके कर्मचारी किसी भी प्रत्यक्ष, अप्रत्यक्ष, आकस्मिक या परिणामी नुकसान के लिए उत्तरदायी नहीं होंगे जो इस वेबसाइट के उपयोग या अनुपलब्धता से उत्पन्न हो सकता है।'
                      : 'To the maximum extent permitted under applicable law, NP News Metro, its directors, editors, journalists, and affiliates shall not be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from the use or inability to access our digital platforms.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '४. डिजिटल मीडिया आचार संहिता एवं शिकायत निवारण अधिकारी' : '4. Statutory Grievance Redressal Mechanism (IT Rules 2021)'}
                  </h3>
                  <div className="p-4 bg-surface-container/70 border border-border-subtle rounded space-y-2 text-xs">
                    <p className="text-ink">
                      {isHindi
                        ? 'सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) नियम, 2021 के अनुपालन में, हमारी संस्था ने एक समर्पित शिकायत निवारण अधिकारी नियुक्त किया है:'
                        : 'In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, grievances regarding published digital content can be submitted to our designated Grievance Officer:'}
                    </p>
                    <div className="bg-white p-3 rounded border border-border-subtle space-y-1 font-mono text-[11px] text-ink">
                      <p><strong>Grievance Officer:</strong> Mr. Anuj Sharma (Legal & Editorial Compliance)</p>
                      <p><strong>Email:</strong> grievance@npnewsmetro.com</p>
                      <p><strong>Address:</strong> NP News Metro, 4th Floor, Statesman House, Barakhamba Road, Connaught Place, New Delhi – 110001</p>
                      <p><strong>Response Timeline:</strong> Acknowledgment within 24 hours; resolution within 15 days as mandated by law.</p>
                    </div>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-2">
                    {isHindi ? '५. क्षेत्राधिकार एवं कानून' : '5. Governing Law & Jurisdiction'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'ये नियम भारत गणराज्य के कानूनों द्वारा शासित होंगे और किसी भी विवाद की स्थिति में केवल नई दिल्ली स्थित सक्षम न्यायालयों का विशेष क्षेत्राधिकार होगा।'
                      : 'These Terms shall be governed and interpreted under the laws of the Republic of India. Any legal disputes arising out of these terms shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.'}
                  </p>
                </div>
              </article>
            )}

            {/* =========================================================================
                6. EDITORIAL BOARD & LEADERSHIP
               ========================================================================= */}
            {currentPage === 'editorial-team' && (
              <article className="space-y-8">
                {/* Header & Masthead Banner */}
                <div className="border-b-2 border-primary pb-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-editorial-red"></span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
                      {isHindi ? 'एनपी न्यूज़ मेट्रो • संस्थागत संपादकीय मंडल' : 'NP NEWS METRO • INSTITUTIONAL MASTHEAD'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'संपादकीय बोर्ड एवं नेतृत्व' : 'Editorial Board & Leadership'}
                  </h1>
                  <p className="text-xs sm:text-sm text-ink-secondary mt-1.5 leading-relaxed">
                    {isHindi 
                      ? 'स्वतंत्र, निष्पक्ष और प्रमाण-आधारित पत्रकारिता के प्रति समर्पित हमारा संपादकीय व प्रबंधकीय नेतृत्व।' 
                      : 'The masthead, editors, and newsroom journalists upholding independent reporting, factual accuracy, and constitutional values.'}
                  </p>

                  {/* Editorial Trust & RNI Badges Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4">
                    <div className="flex items-center gap-1.5 p-2 bg-surface-container/60 rounded border border-border-subtle text-[11px] text-ink font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>{isHindi ? 'सत्यापित संपादकीय मंडल' : 'Verified Newsroom Staff'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-surface-container/60 rounded border border-border-subtle text-[11px] text-ink font-medium">
                      <Scale className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{isHindi ? 'प्रेस परिषद आचार संहिता' : 'Press Council Code'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-surface-container/60 rounded border border-border-subtle text-[11px] text-ink font-medium">
                      <CheckCircle className="w-4 h-4 text-secondary-gold flex-shrink-0" />
                      <span>{isHindi ? 'प्राथमिक तथ्य-सत्यापन' : 'Fact-Check Verification'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-surface-container/60 rounded border border-border-subtle text-[11px] text-ink font-medium">
                      <Lock className="w-4 h-4 text-editorial-red flex-shrink-0" />
                      <span>{isHindi ? 'संपादकीय स्वायत्तता' : 'Editorial Autonomy'}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 p-2 bg-amber-50/70 border border-amber-200/80 rounded text-[11px] text-amber-950 font-medium">
                      <Building className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span className="font-mono text-[10px] font-bold truncate" title="RNI: DEL HIN/2010/31544 (by Metromat Delhi)">
                        {isHindi ? 'आरएनआई: DEL HIN/2010/31544' : 'RNI: DEL HIN/2010/31544'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1. FOUNDER & CTO */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-border-subtle">
                    <Award className="w-4 h-4 text-secondary-gold" />
                    <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
                      {isHindi ? 'संस्थापक एवं सर्वोच्च नेतृत्व (Founder & CTO)' : 'Founder & Executive Leadership (Founder & CTO)'}
                    </h2>
                  </div>

                  <div className="bg-gradient-to-br from-white via-surface-lowest to-surface-container/30 border-2 border-primary/20 hover:border-primary/50 transition-colors p-6 rounded-sm shadow-subtle relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-gold/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
                      <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={getAuthorAvatarUrl('/uploads/umang-pandey.jpg')}
                          alt="Umang Pandey"
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-secondary-gold/50"
                          onError={handleAvatarError}
                        />
                        <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs" title="Verified Founder & CTO">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                              <h3 
                                onClick={() => onSelectAuthor('author-umang-pandey')}
                                className="font-serif text-2xl font-bold text-ink hover:text-primary cursor-pointer transition-colors"
                              >
                                {isHindi ? 'उमंग पाण्डेय' : 'Umang Pandey'}
                              </h3>
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3 text-emerald-600" />
                                {isHindi ? 'संस्थापक' : 'Founder'}
                              </span>
                              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-secondary-gold" />
                                {isHindi ? 'मुख्य प्रौद्योगिकी अधिकारी (CTO)' : 'Chief Technology Officer (CTO)'}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-secondary-gold mt-1 font-sans">
                              {isHindi ? 'संस्थापक एवं मुख्य प्रौद्योगिकी अधिकारी (CTO) • NP News Metro' : 'Founder & Chief Technology Officer (CTO) • NP News Metro'}
                            </p>
                          </div>

                          <div className="flex items-center justify-center sm:justify-end gap-1.5">
                            <button
                              onClick={() => handleCopy('umang.pandey@npnewsmetro.com')}
                              className="px-2.5 py-1 bg-white hover:bg-surface-container border border-border-subtle text-ink-secondary text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Copy email"
                            >
                              {copiedEmail === 'umang.pandey@npnewsmetro.com' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">{isHindi ? 'कॉपी किया गया' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Mail className="w-3.5 h-3.5 text-primary" />
                                  <span className="font-mono text-[11px]">umang.pandey@npnewsmetro.com</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-4">
                          {isHindi
                            ? 'एनपी न्यूज़ मेट्रो के संस्थापक एवं मुख्य प्रौद्योगिकी अधिकारी (CTO), जो डिजिटल मीडिया में स्वतंत्र, निर्भीक और प्रमाण-आधारित पत्रकारिता, उच्च-प्रदर्शन डिजिटल पब्लिशिंग अवसंरचना, एआई प्रणालियों तथा तकनीकी नवाचार का नेतृत्व कर रहे हैं।'
                            : 'Founder & Chief Technology Officer (CTO) of NP News Metro, architecting high-performance digital publishing infrastructure, AI-driven news systems, media innovation, and uncompromised journalistic integrity.'}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">
                              {isHindi ? 'कार्यक्षेत्र:' : 'Focus Areas:'}
                            </span>
                            {(isHindi 
                              ? ['संस्थागत नेतृत्व', 'मुख्य प्रौद्योगिकी अधिकारी (CTO)', 'एआई एवं डिजिटल आर्किटेक्चर', 'मीडिया रणनीति']
                              : ['Institutional Leadership', 'Chief Technology Officer (CTO)', 'AI & Digital Systems', 'Media Strategy']
                            ).map((b, i) => (
                              <span key={i} className="bg-primary/5 text-primary font-medium text-[11px] px-2 py-0.5 rounded border border-primary/10">
                                {b}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => onSelectAuthor('author-umang-pandey')}
                            className="text-primary hover:text-primary-container font-semibold text-xs flex items-center gap-1 group cursor-pointer"
                          >
                            <span>{isHindi ? 'प्रोफ़ाइल एवं लेख देखें' : 'View Profile & Articles'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CHIEF MENTOR & ADVISOR */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-border-subtle">
                    <Sparkles className="w-4 h-4 text-secondary-gold" />
                    <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
                      {isHindi ? 'मुख्य मार्गदर्शक मंडल (Chief Mentor & Advisor)' : 'Mentorship & Advisory Board (Chief Mentor & Advisor)'}
                    </h2>
                  </div>

                  <div className="bg-gradient-to-br from-white via-surface-lowest to-surface-container/30 border-2 border-secondary-gold/30 hover:border-secondary-gold/60 transition-colors p-6 rounded-sm shadow-subtle relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
                      <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={getAuthorAvatarUrl('/uploads/dr-neelima-pandey.jpg')}
                          alt="Dr. Neelima Pandey"
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-secondary-gold/50"
                          onError={handleAvatarError}
                        />
                        <span className="absolute bottom-0 right-0 bg-amber-600 text-white p-1 rounded-full border-2 border-white shadow-xs" title="Verified Chief Mentor & Advisor">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                              <h3 
                                onClick={() => onSelectAuthor('author-dr-neelima-pandey')}
                                className="font-serif text-2xl font-bold text-ink hover:text-primary cursor-pointer transition-colors"
                              >
                                {isHindi ? 'डॉ. नीलिमा पाण्डेय' : 'Dr. Neelima Pandey'}
                              </h3>
                              <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Award className="w-3 h-3 text-secondary-gold" />
                                {isHindi ? 'मार्गदर्शक' : 'Chief Mentor & Advisor'}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-secondary-gold mt-1 font-sans">
                              {isHindi 
                                ? 'शिक्षिका, साहित्यकार एवं कवयित्री • NP News Metro' 
                                : 'Educator, Literary Scholar & Poet • NP News Metro'}
                            </p>
                          </div>

                          <div className="flex items-center justify-center sm:justify-end gap-1.5">
                            <button
                              onClick={() => handleCopy('dr.neelima.pandey@npnewsmetro.com')}
                              className="px-2.5 py-1 bg-white hover:bg-surface-container border border-border-subtle text-ink-secondary text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Copy email"
                            >
                              {copiedEmail === 'dr.neelima.pandey@npnewsmetro.com' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">{isHindi ? 'कॉपी किया गया' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Mail className="w-3.5 h-3.5 text-primary" />
                                  <span className="font-mono text-[11px]">dr.neelima.pandey@npnewsmetro.com</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-4">
                          {isHindi
                            ? 'एनपी न्यूज़ मेट्रो की मुख्य मार्गदर्शक, प्रतिष्ठित शिक्षिका, प्रख्यात साहित्यकार एवं कवयित्री। शिक्षा, सामाजिक मूल्य, साहित्यिक विमर्श और सांस्कृतिक चेतना के संवर्धन में मार्गदर्शक भूमिका।'
                            : 'Chief Mentor and Advisory Patron at NP News Metro; distinguished educator, accomplished litterateur, and celebrated poet guiding our ethical, educational, and cultural vision.'}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">
                              {isHindi ? 'कार्यक्षेत्र:' : 'Focus Areas:'}
                            </span>
                            {(isHindi 
                              ? ['साहित्य एवं संस्कृति', 'शिक्षा एवं दर्शन', 'सामाजिक चेतना', 'सांस्कृतिक विमर्श']
                              : ['Literature & Culture', 'Education & Ethics', 'Social Consciousness', 'Cultural Discourse']
                            ).map((b, i) => (
                              <span key={i} className="bg-primary/5 text-primary font-medium text-[11px] px-2 py-0.5 rounded border border-primary/10">
                                {b}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => onSelectAuthor('author-dr-neelima-pandey')}
                            className="text-primary hover:text-primary-container font-semibold text-xs flex items-center gap-1 group cursor-pointer"
                          >
                            <span>{isHindi ? 'प्रोफ़ाइल एवं लेख देखें' : 'View Profile & Articles'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. EDITORIAL LEADERSHIP / EDITORS-IN-CHIEF */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-border-subtle">
                    <Feather className="w-4 h-4 text-editorial-red" />
                    <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
                      {isHindi ? 'प्रधान संपादक मंडल (Editors-in-Chief)' : 'Editorial Leadership (Editors-in-Chief)'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Neeraj Kumar Pandey */}
                    <div className="bg-surface-lowest border border-border-subtle hover:border-primary/40 transition-all p-5 rounded-sm shadow-subtle flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getAuthorAvatarUrl('/uploads/neeraj-pandey.jpg')}
                              alt="Neeraj Kumar Pandey"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border-subtle"
                              onError={handleAvatarError}
                            />
                            <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-0.5 rounded-full border border-white" title="Verified Editor">
                              <ShieldCheck className="w-3 h-3" />
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3
                                onClick={() => onSelectAuthor('author-neeraj-pandey')}
                                className="font-serif text-lg font-bold text-ink hover:text-primary cursor-pointer transition-colors"
                              >
                                {isHindi ? 'नीरज कुमार पाण्डेय' : 'Neeraj Kumar Pandey'}
                              </h3>
                            </div>
                            <div className="inline-block bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs mt-1">
                              {isHindi ? 'प्रधान संपादक' : 'Editor-in-Chief'}
                            </div>
                            <p className="text-[11px] text-ink-muted mt-1 font-mono">
                              neeraj.pandey@npnewsmetro.com
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-ink-secondary leading-relaxed">
                          {isHindi
                            ? 'एनपी न्यूज़ मेट्रो के प्रधान संपादक, राष्ट्रीय रिपोर्टिंग, ज़मीनी जांच, संसदीय मामलों और न्यूज़रूम संपादकीय मानकों के प्रमुख। निष्पक्ष और निर्भीक पत्रकारिता में लंबा अनुभव।'
                            : 'Editor-in-Chief at NP News Metro, leading national reporting, field investigations, parliamentary coverage, and newsroom editorial standards.'}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-border-subtle space-y-2.5">
                        <div className="flex flex-wrap gap-1">
                          {(isHindi 
                            ? ['राष्ट्रीय राजनीति', 'खोजी पत्रकारिता', 'एनसीआर व प्रादेशिक']
                            : ['National Politics', 'Investigations', 'NCR & Regional']
                          ).map((beat, i) => (
                            <span key={i} className="bg-surface-container text-ink-secondary px-2 py-0.5 rounded-sm text-[10px] font-medium border border-border-subtle">
                              {beat}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            onClick={() => handleCopy('neeraj.pandey@npnewsmetro.com')}
                            className="text-ink-muted hover:text-primary flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            {copiedEmail === 'neeraj.pandey@npnewsmetro.com' ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> {isHindi ? 'कॉपी हुआ' : 'Copied'}
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{isHindi ? 'ईमेल कॉपी करें' : 'Copy Email'}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => onSelectAuthor('author-neeraj-pandey')}
                            className="text-primary hover:text-primary-container font-semibold text-xs flex items-center gap-1 group cursor-pointer"
                          >
                            <span>{isHindi ? 'लेख देखें' : 'View Articles'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Chetan Sharma */}
                    <div className="bg-surface-lowest border border-border-subtle hover:border-primary/40 transition-all p-5 rounded-sm shadow-subtle flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getAuthorAvatarUrl('/np-author-default.png')}
                              alt="Chetan Sharma"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border-subtle"
                              onError={handleAvatarError}
                            />
                            <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-0.5 rounded-full border border-white" title="Verified Editor">
                              <ShieldCheck className="w-3 h-3" />
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3
                                onClick={() => onSelectAuthor('author-chetan-sharma')}
                                className="font-serif text-lg font-bold text-ink hover:text-primary cursor-pointer transition-colors"
                              >
                                {isHindi ? 'चेतन शर्मा' : 'Chetan Sharma'}
                              </h3>
                            </div>
                            <div className="inline-block bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs mt-1">
                              {isHindi ? 'प्रधान संपादक' : 'Editor-in-Chief'}
                            </div>
                            <p className="text-[11px] text-ink-muted mt-1 font-mono">
                              chetan.sharma@npnewsmetro.com
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-ink-secondary leading-relaxed">
                          {isHindi
                            ? 'एनपी न्यूज़ मेट्रो के प्रधान संपादक, न्यूज़रूम नीति, रणनीतिक जांच, ब्रेकिंग कवरेज और पत्रकारिता अखंडता के मार्गदर्शक। उच्च संपादकीय मानकों के प्रति समर्पित।'
                            : 'Editor-in-Chief at NP News Metro, directing newsroom policy, strategic investigations, breaking coverage, and editorial integrity.'}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-border-subtle space-y-2.5">
                        <div className="flex flex-wrap gap-1">
                          {(isHindi 
                            ? ['संपादकीय नीति', 'शासन व प्रशासन', 'विशेष जांच']
                            : ['Editorial Policy', 'Governance', 'Special Investigations']
                          ).map((beat, i) => (
                            <span key={i} className="bg-surface-container text-ink-secondary px-2 py-0.5 rounded-sm text-[10px] font-medium border border-border-subtle">
                              {beat}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            onClick={() => handleCopy('chetan.sharma@npnewsmetro.com')}
                            className="text-ink-muted hover:text-primary flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            {copiedEmail === 'chetan.sharma@npnewsmetro.com' ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> {isHindi ? 'कॉपी हुआ' : 'Copied'}
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{isHindi ? 'ईमेल कॉपी करें' : 'Copy Email'}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => onSelectAuthor('author-chetan-sharma')}
                            className="text-primary hover:text-primary-container font-semibold text-xs flex items-center gap-1 group cursor-pointer"
                          >
                            <span>{isHindi ? 'लेख देखें' : 'View Articles'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. DIGITAL MEDIA & AUDIENCE STRATEGY */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-border-subtle">
                    <Globe className="w-4 h-4 text-secondary" />
                    <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
                      {isHindi ? 'डिजिटल मीडिया एवं सोशल प्लेटफॉर्म्स' : 'Digital Media & Audience Strategy'}
                    </h2>
                  </div>

                  <div className="bg-surface-lowest border border-border-subtle hover:border-primary/40 transition-all p-5 rounded-sm shadow-subtle flex flex-col sm:flex-row gap-4 items-start">
                    <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src={getAuthorAvatarUrl('/np-author-default.png')}
                        alt="Bhawana Pandey"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border-subtle"
                        onError={handleAvatarError}
                      />
                      <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-0.5 rounded-full border border-white" title="Verified Staff">
                        <ShieldCheck className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div>
                          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            <h3
                              onClick={() => onSelectAuthor('author-bhawana-pandey')}
                              className="font-serif text-lg font-bold text-ink hover:text-primary cursor-pointer transition-colors"
                            >
                              {isHindi ? 'भावना पाण्डेय' : 'Bhawana Pandey'}
                            </h3>
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-xs">
                              {isHindi ? 'सोशल मीडिया मैनेजर' : 'Social Media Manager'}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-muted font-mono mt-0.5">
                            bhawana.pandey@npnewsmetro.com
                          </p>
                        </div>

                        <button
                          onClick={() => handleCopy('bhawana.pandey@npnewsmetro.com')}
                          className="text-ink-muted hover:text-primary flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                        >
                          {copiedEmail === 'bhawana.pandey@npnewsmetro.com' ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> {isHindi ? 'कॉपी हुआ' : 'Copied'}
                            </span>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{isHindi ? 'ईमेल कॉपी करें' : 'Copy Email'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                        {isHindi
                          ? 'एनपी न्यूज़ मेट्रो की सोशल मीडिया मैनेजर, डिजिटल दर्शक सहभागिता, मल्टीमीडिया प्रसार और सोशल मीडिया रणनीतियों की प्रमुख। वास्तविक समय में पाठकों तक विश्वसनीय सूचना पहुंचाने हेतु रणनीतिकार।'
                          : 'Social Media Manager at NP News Metro, spearheading digital audience growth, multimedia engagement, and multi-channel content distribution.'}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle text-xs">
                        <div className="flex flex-wrap gap-1">
                          {(isHindi 
                            ? ['सोशल मीडिया रणनीति', 'डिजिटल ऑडियंस विस्तार', 'कंटेंट डिस्ट्रीब्यूशन']
                            : ['Social Media Strategy', 'Audience Growth', 'Digital Distribution']
                          ).map((beat, i) => (
                            <span key={i} className="bg-surface-container text-ink-secondary px-2 py-0.5 rounded-sm text-[10px] font-medium border border-border-subtle">
                              {beat}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => onSelectAuthor('author-bhawana-pandey')}
                          className="text-primary hover:text-primary-container font-semibold text-xs flex items-center gap-1 group cursor-pointer"
                        >
                          <span>{isHindi ? 'लेख देखें' : 'View Articles'}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. NEWSROOM & FIELD REPORTING BUREAU */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-border-subtle">
                    <Newspaper className="w-4 h-4 text-editorial-red" />
                    <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-ink">
                      {isHindi ? 'वरिष्ठ पत्रकार एवं रिपोर्टिंग ब्यूरो' : 'Newsroom & Field Reporting Bureau'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Purnima Mishra */}
                    <div className="bg-surface-lowest border border-border-subtle hover:border-primary/40 transition-all p-5 rounded-sm shadow-subtle flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getAuthorAvatarUrl('/np-author-default.png')}
                              alt="Purnima Mishra"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border-subtle"
                              onError={handleAvatarError}
                            />
                            <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-0.5 rounded-full border border-white" title="Verified Reporter">
                              <ShieldCheck className="w-3 h-3" />
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3
                                onClick={() => onSelectAuthor('author-purnima-mishra')}
                                className="font-serif text-lg font-bold text-ink hover:text-primary cursor-pointer transition-colors"
                              >
                                {isHindi ? 'पूर्णिमा मिश्रा' : 'Purnima Mishra'}
                              </h3>
                            </div>
                            <div className="inline-block bg-surface-container text-primary font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs border border-border-subtle mt-1">
                              {isHindi ? 'वरिष्ठ संवाददाता' : 'Senior Reporter'}
                            </div>
                            <p className="text-[11px] text-ink-muted mt-1 font-mono">
                              purnima.mishra@npnewsmetro.com
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-ink-secondary leading-relaxed">
                          {isHindi
                            ? 'एनपी न्यूज़ मेट्रो की वरिष्ठ संवाददाता, लोक नीति, सामाजिक-आर्थिक विकास, नागरिक मुद्दों, शिक्षा और महिला सशक्तिकरण पर ज़मीनी रिपोर्टिंग में विशेषज्ञ।'
                            : 'Senior Reporter at NP News Metro, covering public policy, socio-economic developments, civic issues, and grassroots investigative journalism.'}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-border-subtle space-y-2.5">
                        <div className="flex flex-wrap gap-1">
                          {(isHindi 
                            ? ['लोक नीति', 'सामाजिक मामले', 'ज़मीनी पड़ताल']
                            : ['Public Policy', 'Social Affairs', 'Ground Reporting']
                          ).map((beat, i) => (
                            <span key={i} className="bg-surface-container text-ink-secondary px-2 py-0.5 rounded-sm text-[10px] font-medium border border-border-subtle">
                              {beat}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            onClick={() => handleCopy('purnima.mishra@npnewsmetro.com')}
                            className="text-ink-muted hover:text-primary flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            {copiedEmail === 'purnima.mishra@npnewsmetro.com' ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> {isHindi ? 'कॉपी हुआ' : 'Copied'}
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{isHindi ? 'ईमेल कॉपी करें' : 'Copy Email'}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => onSelectAuthor('author-purnima-mishra')}
                            className="text-primary hover:text-primary-container font-semibold text-xs flex items-center gap-1 group cursor-pointer"
                          >
                            <span>{isHindi ? 'लेख देखें' : 'View Articles'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Laxmi Kant Mishra */}
                    <div className="bg-surface-lowest border border-border-subtle hover:border-primary/40 transition-all p-5 rounded-sm shadow-subtle flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getAuthorAvatarUrl('/uploads/laxmi-kant-mishra.jpg')}
                              alt="Laxmi Kant Mishra"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border-subtle"
                              onError={handleAvatarError}
                            />
                            <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-0.5 rounded-full border border-white" title="Verified Reporter">
                              <ShieldCheck className="w-3 h-3" />
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3
                                onClick={() => onSelectAuthor('author-laxmi-kant-mishra')}
                                className="font-serif text-lg font-bold text-ink hover:text-primary cursor-pointer transition-colors"
                              >
                                {isHindi ? 'लक्ष्मी कांत मिश्रा' : 'Laxmi Kant Mishra'}
                              </h3>
                            </div>
                            <div className="inline-block bg-surface-container text-primary font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs border border-border-subtle mt-1">
                              {isHindi ? 'संवाददाता' : 'Reporter'}
                            </div>
                            <p className="text-[11px] text-ink-muted mt-1 font-mono">
                              laxmikant.mishra@npnewsmetro.com
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-ink-secondary leading-relaxed">
                          {isHindi
                            ? 'एनपी न्यूज़ मेट्रो के संवाददाता, क्षेत्रीय राजनीति, नागरिक अवसंरचना, कानून व न्याय और स्थानीय जनसरोकारों पर समर्पित रिपोर्टर।'
                            : 'Reporter at NP News Metro, reporting on regional politics, civic infrastructure, law & justice, and local community updates.'}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-border-subtle space-y-2.5">
                        <div className="flex flex-wrap gap-1">
                          {(isHindi 
                            ? ['नागरिक रिपोर्टिंग', 'प्रादेशिक समाचार', 'कानून व न्याय']
                            : ['Civic Reporting', 'Regional News', 'Legal Affairs']
                          ).map((beat, i) => (
                            <span key={i} className="bg-surface-container text-ink-secondary px-2 py-0.5 rounded-sm text-[10px] font-medium border border-border-subtle">
                              {beat}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            onClick={() => handleCopy('laxmikant.mishra@npnewsmetro.com')}
                            className="text-ink-muted hover:text-primary flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            {copiedEmail === 'laxmikant.mishra@npnewsmetro.com' ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> {isHindi ? 'कॉपी हुआ' : 'Copied'}
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{isHindi ? 'ईमेल कॉपी करें' : 'Copy Email'}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => onSelectAuthor('author-laxmi-kant-mishra')}
                            className="text-primary hover:text-primary-container font-semibold text-xs flex items-center gap-1 group cursor-pointer"
                          >
                            <span>{isHindi ? 'लेख देखें' : 'View Articles'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. EDITORIAL AUTONOMY & CONTACT DESK BANNER */}
                <div className="p-5 bg-surface-container/70 border border-border-subtle rounded text-xs space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <ShieldCheck className="w-4 h-4 text-editorial-red" />
                    <span className="uppercase tracking-wider">
                      {isHindi ? 'संपादकीय स्वायत्तता एवं निष्पक्षता की गारंटी' : 'Editorial Independence & Masthead Guarantee'}
                    </span>
                  </div>
                  <p className="text-ink-secondary leading-relaxed">
                    {isHindi
                      ? 'एनपी न्यूज़ मेट्रो का संपादकीय मंडल किसी भी कॉर्पोरेट, राजनीतिक दल या वाणिज्यिक दबाव से पूर्णतः स्वतंत्र होकर निर्णय लेता है। किसी भी समाचार में प्राथमिक तथ्यों के सत्यापन के बिना प्रकाशन नहीं किया जाता।'
                      : 'The Editorial Board of NP News Metro operates with full autonomy from corporate, political, or external commercial considerations. All reports undergo rigorous multi-level verification adhering to the Press Council of India code.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                    <span className="text-ink font-semibold">{isHindi ? 'सीधा संपादकीय संपर्क:' : 'Direct Newsroom Desks:'}</span>
                    <a href="mailto:editor@npnewsmetro.com" className="text-primary hover:underline font-mono">editor@npnewsmetro.com</a>
                    <span className="text-border-subtle">•</span>
                    <a href="mailto:tips@npnewsmetro.com" className="text-primary hover:underline font-mono">tips@npnewsmetro.com</a>
                    <span className="text-border-subtle">•</span>
                    <a href="mailto:grievance@npnewsmetro.com" className="text-primary hover:underline font-mono">grievance@npnewsmetro.com</a>
                  </div>
                </div>
              </article>
            )}

            {/* =========================================================================
                7. CODE OF ETHICS & STANDARDS
               ========================================================================= */}
            {currentPage === 'ethics' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                      {isHindi ? 'पत्रकारिता मानक' : 'Journalistic Integrity & Ethics'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'आचार संहिता एवं सत्यापन नीति' : 'Code of Ethics & Verification Policy'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'भारतीय प्रेस परिषद और अंतरराष्ट्रीय तथ्य-जांच मानकों के अनुरूप संपादकीय दिशानिर्देश' : 'Standards of sourcing, conflict of interest avoidance, and verified fact-checking'}
                  </p>
                </div>

                <div className="prose text-xs sm:text-sm text-ink-secondary space-y-4 leading-relaxed">
                  <p>
                    {isHindi
                      ? 'एनपी न्यूज़ मेट्रो भारतीय प्रेस परिषद (Press Council of India) द्वारा निर्धारित आचार संहिता और नैतिक पत्रकारिता के वैश्विक मानकों का कठोरता से पालन करता है।'
                      : 'NP News Metro operates in strict adherence to the professional norms articulated by the Press Council of India and independent journalistic fact-checking protocols.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-1">
                    {isHindi ? '१. स्रोत एवं उद्धरण मानक' : '1. Sourcing & Attribution Standards'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'प्रत्येक समाचार में प्राथमिक दस्तावेजी संदर्भ या ऑन-रिकॉर्ड अधिकारियों का नाम दिया जाता है। अनाम स्रोतों का उपयोग केवल तब किया जाता है जब स्रोत के जीवन या आजीविका को गंभीर खतरा हो।'
                      : 'Stories rely on named, on-the-record primary sources whenever feasible. Confidential sourcing is permitted only under strict editorial oversight when disclosing an identity exposes a whistleblower to severe professional or physical peril.'}
                  </p>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink pt-1">
                    {isHindi ? '२. हितों का टकराव (Conflict of Interest)' : '2. Conflicts of Interest'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'हमारे पत्रकार उन कंपनियों, राजनीतिक दलों या संगठनों से उपहार, यात्रा प्रायोजन या वित्तीय लाभ स्वीकार नहीं करते हैं जिन्हें वे कवर करते हैं।'
                      : 'Our reporters and editors are strictly forbidden from accepting gifts, hospitality, subsidized travel, or financial consideration from entities or political entities they cover.'}
                  </p>
                </div>
              </article>
            )}

            {/* =========================================================================
                8. CORRECTIONS & GRIEVANCE
               ========================================================================= */}
            {currentPage === 'corrections' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-editorial-red" />
                    <span className="text-xs font-bold uppercase tracking-widest text-editorial-red">
                      {isHindi ? 'सटीकता एवं जवाबदेही' : 'Accuracy & Accountability'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'सुधार नीति एवं शिकायत निवारण' : 'Corrections Policy & Grievance Redressal'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'तथ्य संशोधन तंत्र और वैधानिक शिकायत निवारण प्रक्रिया' : 'Transparent correction workflow, retractation guidelines, and statutory redressal'}
                  </p>
                </div>

                <div className="prose text-xs sm:text-sm text-ink-secondary space-y-4 leading-relaxed">
                  <p>
                    {isHindi
                      ? 'जब किसी प्रकाशित लेख में तथ्यात्मक त्रुटि पाई जाती है, तो एनपी न्यूज़ मेट्रो तुरंत और पारदर्शी रूप से रिकॉर्ड को सही करता है।'
                      : 'When an error of fact occurs in any published report, NP News Metro rectifies the public record immediately and visibly with an unmissable correction notice.'}
                  </p>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 space-y-1">
                    <strong className="block font-bold mb-1">{isHindi ? 'मानक सुधार सूचना प्रारूप:' : 'Standard Correction Notice Format:'}</strong>
                    <p className="font-mono bg-white p-2.5 rounded border border-amber-200 text-[11px]">
                      {isHindi
                        ? '“संशोधन सूचना: इस रिपोर्ट के पूर्व संस्करण में [तथ्य] दिया गया था। इसे सही तथ्य [सटीक विवरण] दर्शाने हेतु अपडेट किया गया है। संशोधित समय: [दिनांक एवं समय]”'
                        : '“Correction Notice: An earlier version of this dispatch incorrectly stated [Fact]. It has been updated to reflect [Verified Fact]. Updated on: [Timestamp]”'}
                    </p>
                  </div>

                  <p>
                    {isHindi ? 'पाठक किसी भी तथ्यात्मक त्रुटि की सूचना सीधे भेज सकते हैं:' : 'Readers can notify our fact-checking desk of any discrepancy directly at:'}{' '}
                    <strong className="text-ink font-mono text-xs">corrections@npnewsmetro.com</strong>
                  </p>
                </div>
              </article>
            )}

            {/* =========================================================================
                9. ADVERTISE WITH US
               ========================================================================= */}
            {currentPage === 'advertise' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-secondary-gold" />
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                      {isHindi ? 'वाणिज्यिक साझेदारी' : 'Commercial Partnerships & Reach'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'एनपी न्यूज़ मेट्रो के साथ विज्ञापन करें' : 'Advertise with NP News Metro'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'भारत के 24 लाख से अधिक नीति-निर्माताओं, कॉर्पोरेट लीडर्स और जागरूक पाठकों तक पहुंचें' : 'Reach over 2.4 million high-net-worth professionals, CXOs, policymakers, and engaged urban readers'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-surface-container/70 rounded border border-border-subtle">
                    <span className="text-2xl font-serif font-bold text-primary block mb-1">2.4M+</span>
                    <span className="text-xs font-bold text-ink">{isHindi ? 'मासिक सक्रिय पाठक' : 'Monthly Active Readers'}</span>
                    <span className="text-[11px] text-ink-secondary block mt-0.5">{isHindi ? 'उच्च-नेटवर्थ पाठक वर्ग' : '78% Tier 1 & Metro presence'}</span>
                  </div>
                  <div className="p-4 bg-surface-container/70 rounded border border-border-subtle">
                    <span className="text-2xl font-serif font-bold text-primary block mb-1">85,000+</span>
                    <span className="text-xs font-bold text-ink">{isHindi ? 'कार्यकारी न्यूज़लेटर ग्राहक' : 'Executive Subscribers'}</span>
                    <span className="text-[11px] text-ink-secondary block mt-0.5">{isHindi ? '42% औसत ओपन रेट' : '42.4% avg daily open rate'}</span>
                  </div>
                  <div className="p-4 bg-surface-container/70 rounded border border-border-subtle">
                    <span className="text-2xl font-serif font-bold text-primary block mb-1">4.2 min</span>
                    <span className="text-xs font-bold text-ink">{isHindi ? 'औसत पठन समय (Dwell Time)' : 'Avg Article Dwell Time'}</span>
                    <span className="text-[11px] text-ink-secondary block mt-0.5">{isHindi ? 'गहन संपादकीय जुड़ाव' : 'Deep analytical engagement'}</span>
                  </div>
                </div>

                <div className="prose text-xs sm:text-sm text-ink-secondary space-y-3 leading-relaxed">
                  <h3 className="font-serif text-base font-bold text-ink">
                    {isHindi ? 'उपलब्ध विज्ञापन एवं प्रायोजन प्रारूप' : 'Available Advertising Solutions'}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li><strong>Display & Rich Media:</strong> High-impact Leaderboards, Half-page MPU units, and In-article responsive slots.</li>
                    <li><strong>Morning Briefing Sponsorships:</strong> Exclusive header brand integration in our daily executive newsletter.</li>
                    <li><strong>Custom Native Content & Thought Leadership:</strong> Strictly designated sponsored investigative whitepapers.</li>
                    <li><strong>Video Hub & Multimedia Sponsorships:</strong> Pre-roll and featured video placements on our dedicated Video Desk.</li>
                  </ul>

                  <p className="pt-2">
                    {isHindi ? 'मीडिया किट (Media Kit), दर कार्ड और कस्टमाइज़्ड प्रायोजन के लिए संपर्क करें:' : 'For our comprehensive Media Kit, rate card, and bespoke brand solutions, contact our commercial desk at:'}{' '}
                    <strong className="text-ink font-mono text-xs">advertise@npnewsmetro.com</strong>
                  </p>
                </div>
              </article>
            )}

            {/* =========================================================================
                10. COOKIE POLICY
               ========================================================================= */}
            {currentPage === 'cookie-policy' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-editorial-red" />
                    <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                      {isHindi ? 'कुकी सेटिंग्स एवं प्राथमिकताएं' : 'Cookie Preferences & Management'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'कुकी नीति (Cookie Policy)' : 'Cookie Policy'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'कुकीज़ के प्रकार, उनके उपयोग और ब्राउज़र नियंत्रण संबंधी जानकारी' : 'How we use essential, analytics, and advertising cookies on npnewsmetro.com'}
                  </p>
                </div>

                <div className="prose text-xs sm:text-sm text-ink-secondary space-y-4 leading-relaxed">
                  <p>
                    {isHindi
                      ? 'यह कुकी नीति बताती है कि जब आप हमारी वेबसाइट पर आते हैं तो हम कुकीज़ और समान तकनीकों का उपयोग कैसे करते हैं।'
                      : 'This Cookie Policy explains how NP News Metro uses cookies, local storage, and related technologies to recognize you when you visit our website.'}
                  </p>

                  <h3 className="font-serif text-base font-bold text-ink">
                    {isHindi ? 'हमारे द्वारा उपयोग की जाने वाली कुकीज़:' : 'Categories of Cookies We Use:'}
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-surface-container/60 rounded border border-border-subtle">
                      <strong className="text-ink block mb-0.5">{isHindi ? '१. अनिवार्य कुकीज़ (Strictly Necessary Cookies):' : '1. Strictly Necessary Cookies:'}</strong>
                      <p>{isHindi ? 'साइट को सुरक्षित रूप से संचालित करने और भाषा चयन सहेजने हेतु आवश्यक।' : 'Essential for page navigation, security token validation, and language preference retention.'}</p>
                    </div>
                    <div className="p-3 bg-surface-container/60 rounded border border-border-subtle">
                      <strong className="text-ink block mb-0.5">{isHindi ? '२. प्रदर्शन एवं विश्लेषणात्मक कुकीज़ (Analytics Cookies):' : '2. Performance & Analytics Cookies:'}</strong>
                      <p>{isHindi ? 'Google Analytics (gtag.js) और प्रदर्शन मीट्रिक्स के माध्यम से साइट की गति और पाठकों के जुड़ाव को मापने हेतु।' : 'Aggregated telemetry through Google Analytics and Core Web Vitals to measure reader engagement and loading speeds.'}</p>
                    </div>
                    <div className="p-3 bg-surface-container/60 rounded border border-border-subtle">
                      <strong className="text-ink block mb-0.5">{isHindi ? '३. विज्ञापन कुकीज़ (Google AdSense):' : '3. Advertising Cookies:'}</strong>
                      <p>{isHindi ? 'Google AdSense और उसके भागीदारों द्वारा प्रासंगिक विज्ञापन प्रदर्शित करने हेतु DART कुकीज़ का उपयोग किया जाता है।' : 'Set by Google AdSense to serve relevant advertising based on previous visits to our and other websites.'}</p>
                    </div>
                  </div>

                  <h3 className="font-serif text-base font-bold text-ink pt-1">
                    {isHindi ? 'कुकीज़ को कैसे प्रबंधित करें:' : 'How to Control Cookies:'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'आप अपनी ब्राउज़र सेटिंग्स के माध्यम से किसी भी समय कुकीज़ को ब्लॉक या हटा सकते हैं।'
                      : 'You have the right to accept or reject cookies through your browser controls. Most web browsers allow you to manage cookie settings in their privacy preferences menu.'}
                  </p>
                </div>
              </article>
            )}

            {/* =========================================================================
                11. SITEMAP DIRECTORY
               ========================================================================= */}
            {currentPage === 'sitemap' && (
              <article className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-editorial-red" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      {isHindi ? 'साइट डायरेक्टरी' : 'Site Directory & Feeds'}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {isHindi ? 'साइटमैप एवं संपूर्ण डायरेक्टरी' : 'Sitemap & Editorial Directory'}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1">
                    {isHindi ? 'सभी श्रेणियों, विशेष डेस्क, कानूनी नीतियों और एक्सएमएल फ़ीड की पूरी सूची' : 'Complete index of editorial desks, policy documentation, and crawler XML feeds'}
                  </p>
                </div>

                <div className="space-y-6 text-xs">
                  {/* XML Crawler Sitemaps Section */}
                  <div className="p-4 bg-primary/5 rounded border border-primary/20 space-y-3">
                    <h3 className="font-serif text-sm font-bold text-primary flex items-center gap-1.5">
                      <Rss className="w-4 h-4 text-editorial-red" />
                      <span>{isHindi ? 'सर्च इंजन एक्सएमएल साइटमैप्स' : 'Search Engine XML Sitemaps'}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <a href="/sitemap_index.xml" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded border border-border-subtle hover:border-primary flex items-center justify-between font-mono text-ink">
                        <span>/sitemap_index.xml (Master Index)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                      </a>
                      <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded border border-border-subtle hover:border-primary flex items-center justify-between font-mono text-ink">
                        <span>/sitemap.xml (Main Sitemap)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                      </a>
                      <a href="/news-sitemap.xml" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded border border-border-subtle hover:border-primary flex items-center justify-between font-mono text-ink">
                        <span>/news-sitemap.xml (Google News)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                      </a>
                      <a href="/image-sitemap.xml" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded border border-border-subtle hover:border-primary flex items-center justify-between font-mono text-ink">
                        <span>/image-sitemap.xml (Image Assets)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                      </a>
                      <a href="/video-sitemap.xml" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded border border-border-subtle hover:border-primary flex items-center justify-between font-mono text-ink">
                        <span>/video-sitemap.xml (Video Desk)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                      </a>
                      <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded border border-border-subtle hover:border-primary flex items-center justify-between font-mono text-ink">
                        <span>/rss.xml (RSS 2.0 Syndication)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                      </a>
                    </div>
                  </div>

                  {/* Editorial Categories Directory */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-sm font-bold text-ink">
                      {isHindi ? 'संपादकीय श्रेणियां एवं डेस्क:' : 'Editorial News Desks:'}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { slug: 'india', label: isHindi ? 'राष्ट्रीय समाचार (India)' : 'National News (India)' },
                        { slug: 'politics', label: isHindi ? 'राजनीति एवं संसद' : 'Politics & Parliament' },
                        { slug: 'business', label: isHindi ? 'व्यापार एवं बाज़ार' : 'Business & Economy' },
                        { slug: 'technology', label: isHindi ? 'तकनीक एवं एआई' : 'Technology & AI' },
                        { slug: 'world', label: isHindi ? 'वैश्विक मामले' : 'World & Diplomacy' },
                        { slug: 'sports', label: isHindi ? 'खेल एवं क्रिकेट' : 'Sports & Cricket' },
                        { slug: 'entertainment', label: isHindi ? 'सिनेमा एवं कला' : 'Cinema & Entertainment' },
                        { slug: 'lifestyle', label: isHindi ? 'जीवनशैली एवं पर्यावरण' : 'Lifestyle & Environment' },
                        { slug: 'opinion', label: isHindi ? 'संपादकीय विचार एवं विश्लेषण' : 'Opinion & Editorials' },
                        { slug: 'videos', label: isHindi ? 'वीडियो एक्सप्लेनर्स' : 'Video Hub' },
                        { slug: 'photos', label: isHindi ? 'फोटो गैलरी' : 'Photo Galleries' },
                        { slug: 'latest', label: isHindi ? 'ताज़ा खबरें' : 'Latest News Wire' },
                      ].map((item) => (
                        <button
                          key={item.slug}
                          onClick={() => onNavigateCategory ? onNavigateCategory(item.slug) : onNavigateHome()}
                          className="text-left p-2 bg-surface-container/60 hover:bg-surface-container rounded border border-border-subtle text-ink font-semibold flex items-center justify-between cursor-pointer"
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Institutional & Legal Pages Directory */}
                  <div className="space-y-2 pt-2">
                    <h3 className="font-serif text-sm font-bold text-ink">
                      {isHindi ? 'संस्थागत एवं कानूनी नीतियां:' : 'Institutional & Policy Documentation:'}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {menuItems.filter(m => m.id !== 'sitemap').map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setCurrentPage(m.id as StaticPageType);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-left p-2 bg-surface-container/60 hover:bg-surface-container rounded border border-border-subtle text-ink font-semibold flex items-center justify-between cursor-pointer"
                        >
                          <span>{m.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )}

          </section>
        </div>
      </main>
    </div>
  );
};
