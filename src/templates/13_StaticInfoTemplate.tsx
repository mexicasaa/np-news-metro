import React, { useState } from 'react';
import { 
  ShieldCheck, Award, Mail, Phone, MapPin, Send, CheckCircle2, 
  FileText, Users, DollarSign, AlertCircle, Sparkles, Building 
} from 'lucide-react';
import { mockAuthors } from '../data/mockWpData';
import { AuthorCard } from '../components/cards/AuthorCard';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';

export type StaticPageType = 
  | 'about' 
  | 'editorial-team' 
  | 'ethics' 
  | 'corrections' 
  | 'contact' 
  | 'advertise' 
  | 'privacy' 
  | 'terms'
  | 'epaper';

interface StaticInfoTemplateProps {
  initialPage?: StaticPageType;
  onNavigateHome: () => void;
  onSelectAuthor: (authorId: string) => void;
}

export const StaticInfoTemplate: React.FC<StaticInfoTemplateProps> = ({
  initialPage = 'about',
  onNavigateHome,
  onSelectAuthor,
}) => {
  const [currentPage, setCurrentPage] = useState<StaticPageType>(initialPage);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { t, isHindi } = useLanguage();

  const menuItems = [
    { id: 'about', label: isHindi ? 'एनपी न्यूज़ मेट्रो के बारे में' : 'About NP News Metro', icon: Building },
    { id: 'editorial-team', label: isHindi ? 'संपादकीय बोर्ड एवं टीम' : 'Editorial Board & Team', icon: Users },
    { id: 'ethics', label: isHindi ? 'आचार संहिता एवं मानक' : 'Code of Ethics & Standards', icon: ShieldCheck },
    { id: 'corrections', label: isHindi ? 'सुधार एवं निवारण नीति' : 'Corrections & Redressal', icon: AlertCircle },
    { id: 'contact', label: isHindi ? 'न्यूज़रूम संपर्क एवं सुझाव' : 'Contact Newsroom & Tip-offs', icon: Mail },
    { id: 'advertise', label: isHindi ? 'विज्ञापन एवं साझेदारी' : 'Advertise with Us', icon: DollarSign },
    { id: 'privacy', label: isHindi ? 'गोपनीयता नीति' : 'Privacy Policy', icon: FileText },
    { id: 'terms', label: isHindi ? 'सेवा की शर्तें' : 'Terms of Service', icon: FileText },
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
          { label: isHindi ? 'जानकारी एवं नीतियां' : 'Information & Policies', onClick: () => setCurrentPage('about') },
          { label: activeItemLabel, isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-6 sm:py-8">
        {/* Mobile Horizontal Pill Selector */}
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
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors ${
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle space-y-1">
            <h3 className="font-serif text-base font-bold text-ink px-3 py-2 border-b border-border-subtle mb-2">
              {isHindi ? 'संस्थागत जानकारी' : 'Institutional Information'}
            </h3>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as StaticPageType);
                    setFormSubmitted(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-sm text-xs font-semibold flex items-center gap-2.5 transition-colors ${
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

            <div className="pt-4 mt-4 border-t border-border-subtle p-3 bg-surface-container/50 rounded-sm text-[11px] text-ink-secondary">
              <span className="font-bold text-ink block mb-1">{isHindi ? 'शिकायत निवारण' : 'Grievance Redressal'}</span>
              <p>{isHindi ? 'डिजिटल मीडिया आचार संहिता के तहत शिकायतों हेतु: grievance@npnewsmetro.com' : 'For complaints under Digital Media Ethics Code: grievance@npnewsmetro.com'}</p>
            </div>
          </aside>

          {/* Right Content Area (8 cols) */}
          <section className="lg:col-span-8 bg-surface-lowest border border-border-subtle p-6 sm:p-10 rounded-sm shadow-subtle">
            {/* 1. About Us */}
            {currentPage === 'about' && (
              <div className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
                    {isHindi ? 'संस्थागत घोषणापत्र' : 'Institutional Charter'}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                    {isHindi ? 'एनपी न्यूज़ मेट्रो के बारे में' : 'About NP News Metro'}
                  </h1>
                </div>

                <p className="text-base text-ink font-serif italic leading-relaxed">
                  {isHindi
                    ? '“सटीक समाचार। वास्तविक प्रभाव।” — इस मूलभूत विश्वास पर निर्मित कि एक जागरूक नागरिक संवैधानिक लोकतंत्र की सबसे अनिवार्य सुरक्षा है।'
                    : '“Real News. Real Impact.” — Built on the foundational conviction that an informed citizenry is the indispensable safeguard of constitutional democracy.'}
                </p>

                <div className="prose text-sm text-ink-secondary space-y-4 leading-relaxed">
                  <p>
                    {isHindi
                      ? 'नई दिल्ली में स्थापित, एनपी न्यूज़ मेट्रो एक आधुनिक, स्वतंत्र भारतीय डिजिटल समाचार प्रकाशन है। हम निडर खोजी रिपोर्टिंग, गहन व्यापक आर्थिक जांच, जमीनी स्तर के पर्यावरणीय दस्तावेजीकरण और विचारशील सांस्कृतिक समीक्षा प्रदान करते हैं।'
                      : 'Founded in New Delhi, NP News Metro is a modern, independent Indian digital news publication. We deliver fearless investigative reporting, rigorous macroeconomic scrutiny, ground-level environmental documentation, and thoughtful cultural critique.'}
                  </p>
                  <p>
                    {isHindi
                      ? 'क्लिकबेट-आधारित पोर्टलों या पक्षपाती मंचों के विपरीत, एनपी न्यूज़ मेट्रो गहराई के लिए निर्मित एक संपादकीय वास्तुकला के साथ काम करता है। हमारे वरिष्ठ संवाददाता प्रमुख महानगरों और राज्यों की राजधानियों में तैनात हैं।'
                      : 'Unlike clickbait-driven portals or partisan echo chambers, NP News Metro operates with an editorial architecture built for depth. Our senior correspondents are stationed across major metropolitan hubs and state capitals, providing nuanced regional context to national policy developments.'}
                  </p>

                  <h3 className="font-serif text-xl font-bold text-ink pt-4">
                    {isHindi ? 'हमारे मुख्य संपादकीय स्तंभ' : 'Our Core Editorial Pillars'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-surface-container/60 rounded border border-border-subtle">
                      <h4 className="font-serif font-bold text-primary text-base mb-1">
                        {isHindi ? 'स्वतंत्र सत्यापन' : 'Independent Verification'}
                      </h4>
                      <p className="text-xs text-ink-secondary">
                        {isHindi
                          ? 'प्रत्येक दावे को प्राथमिक दस्तावेजी रिकॉर्ड और ऑन-रिकॉर्ड स्रोतों के माध्यम से सत्यापित किया जाता है।'
                          : 'Every claim is cross-checked across primary documentary records and on-record sources.'}
                      </p>
                    </div>
                    <div className="p-4 bg-surface-container/60 rounded border border-border-subtle">
                      <h4 className="font-serif font-bold text-primary text-base mb-1">
                        {isHindi ? 'संपादकीय पारदर्शिता' : 'Editorial Transparency'}
                      </h4>
                      <p className="text-xs text-ink-secondary">
                        {isHindi
                          ? 'स्पष्ट सुधार नोटिस और समाचार रिपोर्टिंग और विचार निबंधों के बीच स्पष्ट पृथक्करण।'
                          : 'Visible correction notices and clear separation between news reporting and opinion essays.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Editorial Team */}
            {currentPage === 'editorial-team' && (
              <div className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
                    {isHindi ? 'न्यूज़रूम टीम' : 'The Newsroom'}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                    {isHindi ? 'संपादकीय बोर्ड एवं वरिष्ठ पत्रकार' : 'Editorial Board & Senior Journalists'}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {isHindi
                    ? 'हमारे संपादकीय बोर्ड में वरिष्ठ पत्रकार, अर्थशास्त्री, कानूनी विद्वान और नैतिक पत्रकारिता के प्रति समर्पित फील्ड रिपोर्टर शामिल हैं।'
                    : 'Our editorial board comprises veteran journalists, economists, legal scholars, and field reporters committed to ethical journalism.'}
                </p>

                <div className="space-y-4 pt-2">
                  {Object.values(mockAuthors).map((author) => (
                    <AuthorCard
                      key={author.id}
                      author={author}
                      onSelect={onSelectAuthor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Ethics & Fact-Checking */}
            {currentPage === 'ethics' && (
              <div className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 block mb-1">
                    {isHindi ? 'मानक एवं जवाबदेही' : 'Standards & Accountability'}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                    {isHindi ? 'आचार संहिता एवं सत्यापन नीति' : 'Code of Ethics & Verification Policy'}
                  </h1>
                </div>

                <div className="space-y-4 text-sm text-ink-secondary leading-relaxed">
                  <p>
                    {isHindi
                      ? 'एनपी न्यूज़ मेट्रो भारतीय प्रेस परिषद और अंतर्राष्ट्रीय तथ्य-जांच नेटवर्क (IFCN) के सिद्धांतों द्वारा स्थापित आचार संहिता का कड़ाई से पालन करता है।'
                      : 'NP News Metro adheres strictly to the Code of Ethics established by the Press Council of India and the International Fact-Checking Network (IFCN) principles.'}
                  </p>

                  <h3 className="font-serif text-lg font-bold text-ink">
                    {isHindi ? '१. स्रोत एवं संदर्भ' : '1. Sourcing & Attribution'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'गुमनाम स्रोतों की अनुमति केवल तभी दी जाती है जब पहचान उजागर करने से व्हिसलब्लोअर को गंभीर शारीरिक या कानूनी खतरा हो, और इसे प्रधान संपादक द्वारा अनुमोदित किया जाना चाहिए।'
                      : 'Anonymous sourcing is permitted solely when disclosing identity poses severe physical or legal peril to a whistleblower, and must be approved by the Editor-in-Chief.'}
                  </p>

                  <h3 className="font-serif text-lg font-bold text-ink">
                    {isHindi ? '२. वाणिज्यिक स्वतंत्रता' : '2. Commercial Independence'}
                  </h3>
                  <p>
                    {isHindi
                      ? 'विज्ञापन साझेदारी और संस्थागत अनुदान का समाचार निर्णय पर कोई प्रभाव नहीं होता है। सभी वाणिज्यिक सामग्री को स्पष्ट रूप से प्रायोजित या विज्ञापन के रूप में चिह्नित किया गया है।'
                      : 'Advertising partnerships, native content, and institutional grants exercise zero influence over news judgment. All commercial content is explicitly marked with the label SPONSORED or ADVERTISEMENT.'}
                  </p>
                </div>
              </div>
            )}

            {/* 4. Corrections Policy */}
            {currentPage === 'corrections' && (
              <div className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-editorial-red block mb-1">
                    {isHindi ? 'सटीकता एवं जवाबदेही' : 'Accuracy & Accountability'}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                    {isHindi ? 'सुधार नीति एवं निवारण तंत्र' : 'Corrections Policy & Redressal Mechanism'}
                  </h1>
                </div>

                <div className="space-y-4 text-sm text-ink-secondary leading-relaxed">
                  <p>
                    {isHindi
                      ? 'जब किसी प्रकाशित लेख या वीडियो में तथ्य की त्रुटि की पहचान की जाती है, तो एनपी न्यूज़ मेट्रो रिकॉर्ड को तुरंत, स्पष्ट रूप से और पारदर्शी रूप से ठीक करता है।'
                      : 'When an error of fact is identified in any published article or video, NP News Metro corrects the record promptly, visibly, and transparently.'}
                  </p>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950">
                    <p className="font-bold mb-1">{isHindi ? 'मानक सुधार प्रारूप:' : 'Standard Correction Format:'}</p>
                    <p>
                      {isHindi
                        ? '“इस रिपोर्ट के पहले के संस्करण में गलत तथ्य दिया गया था। इसे सही तथ्य दर्शाने के लिए अपडेट किया गया है। प्रकाशित: [समय]”'
                        : '“An earlier version of this report incorrectly stated [Fact]. It has been updated to reflect [Accurate Fact]. Published: [Timestamp]”'}
                    </p>
                  </div>

                  <p>
                    {isHindi ? 'पाठक सीधे सुधार अनुरोध प्रस्तुत कर सकते हैं:' : 'Readers can submit correction requests directly to:'}{' '}
                    <span className="font-mono text-primary font-bold">corrections@npnewsmetro.com</span>
                  </p>
                </div>
              </div>
            )}

            {/* 5. Contact & Tip-Offs */}
            {currentPage === 'contact' && (
              <div className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-1">
                    {isHindi ? 'संपर्क करें' : 'Get in Touch'}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                    {isHindi ? 'न्यूज़रूम संपर्क एवं गोपनीय सुझाव' : 'Contact Newsroom & Confidential Tip-Offs'}
                  </h1>
                </div>

                {formSubmitted ? (
                  <div className="p-8 bg-emerald-50 border border-emerald-200 rounded text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
                    <h3 className="font-serif text-xl font-bold text-ink mb-1">
                      {isHindi ? 'संदेश प्राप्त हुआ' : 'Message Received'}
                    </h3>
                    <p className="text-xs text-ink-secondary">
                      {isHindi
                        ? 'आपका संदेश या गोपनीय सुझाव संबंधित डेस्क संपादक को भेज दिया गया है।'
                        : 'Your message or confidential tip-off has been routed to the appropriate desk editor.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-ink mb-1">
                          {isHindi ? 'आपका नाम' : 'Your Name'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={isHindi ? 'उदा. रमेश कुमार' : 'e.g. Ramesh Kumar'}
                          className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs focus:outline-hidden focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-ink mb-1">
                          {isHindi ? 'ईमेल / संपर्क सूत्र' : 'Email / Contact'}
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="ramesh@example.com"
                          className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs focus:outline-hidden focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-ink mb-1">
                        {isHindi ? 'विभाग' : 'Department'}
                      </label>
                      <select aria-label="Select Newsroom Department" className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs focus:outline-hidden focus:border-primary">
                        <option>{isHindi ? 'गोपनीय समाचार सुझाव / व्हिसलब्लोअर' : 'Confidential News Tip / Whistleblower'}</option>
                        <option>{isHindi ? 'सामान्य संपादकीय प्रश्न' : 'General Editorial Query'}</option>
                        <option>{isHindi ? 'संपादक के नाम पत्र' : 'Letters to the Editor'}</option>
                        <option>{isHindi ? 'सिंडिकेशन एवं अधिकार' : 'Syndication & Rights'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-ink mb-1">
                        {isHindi ? 'संदेश / विवरण' : 'Message / Tip Details'}
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder={isHindi ? 'सत्यापन योग्य पृष्ठभूमि, दस्तावेजी विवरण, या अपनी प्रतिक्रिया प्रदान करें...' : 'Provide verifiable background, documentation details, or your feedback...'}
                        className="w-full p-2.5 bg-surface-container border border-border-subtle rounded text-xs focus:outline-hidden focus:border-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'न्यूज़रूम को भेजें' : 'Send to Newsroom'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 6. Advertise with Us */}
            {currentPage === 'advertise' && (
              <div className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
                    {isHindi ? 'वाणिज्यिक साझेदारी' : 'Commercial Partnerships'}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                    {isHindi ? 'एनपी न्यूज़ मेट्रो के साथ विज्ञापन करें' : 'Advertise with NP News Metro'}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {isHindi
                    ? 'हर महीने पूरे भारत में २४ लाख से अधिक पेशेवरों, नीति निर्माताओं और जागरूक पाठकों तक पहुंचें।'
                    : 'Reach over 2.4 million high-net-worth professionals, CXOs, policymakers, and discerning urban readers across India every month.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-surface-container/60 rounded border border-border-subtle">
                    <span className="text-2xl font-serif font-bold text-primary block mb-1">2.4M+</span>
                    <span className="text-xs font-bold text-ink">{isHindi ? 'मासिक पाठक' : 'Monthly Readers'}</span>
                  </div>
                  <div className="p-4 bg-surface-container/60 rounded border border-border-subtle">
                    <span className="text-2xl font-serif font-bold text-primary block mb-1">85,000+</span>
                    <span className="text-xs font-bold text-ink">{isHindi ? 'न्यूज़लेटर ग्राहक' : 'Executive Newsletter Subscribers'}</span>
                  </div>
                  <div className="p-4 bg-surface-container/60 rounded border border-border-subtle">
                    <span className="text-2xl font-serif font-bold text-primary block mb-1">4.2 min</span>
                    <span className="text-xs font-bold text-ink">{isHindi ? 'औसत पठन समय' : 'Avg Dwell Time'}</span>
                  </div>
                </div>

                <p className="text-xs text-ink-secondary">
                  {isHindi ? 'मीडिया किट और विशेष प्रायोजन समाधान के लिए संपर्क करें:' : 'For media kits and custom sponsorship solutions, reach our commercial desk at:'}{' '}
                  <strong className="text-ink">advertise@npnewsmetro.com</strong>
                </p>
              </div>
            )}

            {/* 7. Privacy & Terms */}
            {(currentPage === 'privacy' || currentPage === 'terms') && (
              <div className="space-y-6">
                <div className="border-b-2 border-primary pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink-muted block mb-1">
                    {isHindi ? 'कानूनी दस्तावेज' : 'Legal Documentation'}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                    {currentPage === 'privacy' ? (isHindi ? 'गोपनीयता नीति' : 'Privacy Policy') : (isHindi ? 'सेवा की शर्तें' : 'Terms of Service')}
                  </h1>
                </div>

                <div className="text-xs sm:text-sm text-ink-secondary space-y-3 leading-relaxed">
                  <p>
                    {isHindi
                      ? 'एनपी न्यूज़ मेट्रो आपकी गोपनीयता के अधिकार का सम्मान करता है। हम तीसरे पक्ष के डेटा दलालों को व्यक्तिगत पाठक जानकारी नहीं बेचते हैं।'
                      : 'NP News Metro respects your right to privacy. We do not sell personal reader information to third-party data brokers.'}
                  </p>
                  <p>
                    {isHindi
                      ? 'एनालिटिक्स संग्रह केवल समग्र प्रदर्शन निगरानी, कोर वेब विटल्स और स्पैम रक्षा तक ही सीमित है।'
                      : 'Analytics collection is restricted to aggregated performance monitoring, Core Web Vitals telemetry, and spam defense.'}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
