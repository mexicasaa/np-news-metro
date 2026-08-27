export type Language = 'en' | 'hi';

export interface Translations {
  // Utility Bar & Header
  todayDate: string;
  selectEdition: string;
  weatherCity: string;
  aqiStatus: string;
  epaper: string;
  morningBriefing: string;
  factCheckDesk: string;
  sections: string;
  searchPlaceholder: string;
  search: string;
  saved: string;
  subscribe: string;

  // Primary Navigation
  nav_home: string;
  nav_latest: string;
  nav_india: string;
  nav_politics: string;
  nav_business: string;
  nav_tech: string;
  nav_world: string;
  nav_sports: string;
  nav_entertainment: string;
  nav_lifestyle: string;
  nav_opinion: string;
  metromat: string;
  metromatTagline: string;
  nav_videos: string;
  nav_photos: string;
  nav_trending: string;
  live: string;

  // Markets Ticker
  marketsLive: string;
  bseSensex: string;
  nseNifty: string;
  usdInr: string;
  brentCrude: string;
  gold10g: string;
  gsecYield: string;
  stable: string;

  // Breaking News
  breaking: string;
  topStories: string;
  paused: string;
  playing: string;

  // Homepage Section Titles
  latestNewsWire: string;
  viewAllUpdates: string;
  mostReadAcrossIndia: string;
  top10List: string;
  indiaPolitics: string;
  viewAllPolitics: string;
  businessMarketsEconomy: string;
  viewAllBusiness: string;
  videoExplainers: string;
  videoExplainerSubhead: string;
  videoHub: string;
  techDeepTech: string;
  moreTech: string;
  worldDiplomacy: string;
  moreWorld: string;

  // Card Meta & Actions
  readStory: string;
  readTimeSuffix: string;
  publishedPrefix: string;
  by: string;
  readers: string;
  shares: string;
  listen: string;
  playingAudio: string;
  linkCopied: string;
  exclusiveReport: string;
  leadStory: string;
  npNewsDesk: string;

  // Newsletter Box
  newsletterTitle: string;
  newsletterSubhead: string;
  newsletterPlaceholder: string;
  newsletterBtn: string;
  newsletterPrivacy: string;

  // Footer & Common
  footerAbout: string;
  footerAboutDesc: string;
  footerQuickLinks: string;
  footerCategories: string;
  footerLegal: string;
  footerCopyright: string;
  privacyPolicy: string;
  termsOfService: string;
  contactUs: string;
  careers: string;
  editorialPolicy: string;
  allRightsReserved: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Utility Bar & Header
    todayDate: 'Wednesday, August 19, 2026',
    selectEdition: 'National / New Delhi',
    weatherCity: 'New Delhi 31°C',
    aqiStatus: 'AQI 84 (Moderate)',
    epaper: 'e-Paper',
    morningBriefing: 'Morning Briefing',
    factCheckDesk: 'Fact-Check Desk',
    sections: 'Sections',
    searchPlaceholder: 'Search news, topics, authors...',
    search: 'Search',
    saved: 'Saved',
    subscribe: 'Subscribe',

    // Primary Navigation
    nav_home: 'Home',
    nav_latest: 'Latest',
    nav_india: 'India',
    nav_politics: 'Politics',
    nav_business: 'Business',
    nav_tech: 'Technology',
    nav_world: 'World',
    nav_sports: 'Sports',
    nav_entertainment: 'Entertainment',
    nav_lifestyle: 'Lifestyle',
    nav_opinion: 'Metromat',
    metromat: 'Metromat',
    metromatTagline: 'Editorial Voice, Public Pulse & Analysis',
    nav_videos: 'Videos',
    nav_photos: 'Photos',
    nav_trending: 'Trending',
    live: 'LIVE',

    // Markets Ticker
    marketsLive: 'Markets Live:',
    bseSensex: 'BSE SENSEX',
    nseNifty: 'NSE NIFTY 50',
    usdInr: 'USD / INR',
    brentCrude: 'Brent Crude',
    gold10g: 'Gold (10g)',
    gsecYield: '10-Yr G-Sec',
    stable: 'Stable',

    // Breaking News
    breaking: 'Breaking',
    topStories: 'Top Stories',
    paused: 'Paused',
    playing: 'Playing',

    // Homepage Section Titles
    latestNewsWire: 'Latest News Wire',
    viewAllUpdates: 'View All 24/7 Updates',
    mostReadAcrossIndia: 'Most Read Across India',
    top10List: 'Top 10 Full List',
    indiaPolitics: 'India & National Politics',
    viewAllPolitics: 'View All Politics',
    businessMarketsEconomy: 'Business, Markets & Economy',
    viewAllBusiness: 'View All Business',
    videoExplainers: 'NP Newsroom Video & Explainers',
    videoExplainerSubhead: 'Independent investigative documentaries, explainers, and ground reports.',
    videoHub: 'Video Hub',
    techDeepTech: 'Technology & Deep Tech',
    moreTech: 'More Tech',
    worldDiplomacy: 'World & Diplomacy',
    moreWorld: 'More World',

    // Card Meta & Actions
    readStory: 'Read',
    readTimeSuffix: 'read',
    publishedPrefix: 'Published',
    by: 'By',
    readers: 'readers',
    shares: 'shares',
    listen: 'Listen',
    playingAudio: 'Playing Audio',
    linkCopied: 'Link Copied!',
    exclusiveReport: 'Exclusive Report',
    leadStory: 'Lead Story',
    npNewsDesk: 'NP News Desk',

    // Newsletter Box
    newsletterTitle: 'Get India’s Most Credible Morning Dispatch',
    newsletterSubhead: 'Join over 450,000 discerning readers. Curated investigative journalism, geopolitical insights, and market briefings delivered to your inbox every morning at 7 AM IST.',
    newsletterPlaceholder: 'Enter your email address...',
    newsletterBtn: 'Subscribe Free',
    newsletterPrivacy: 'We respect your privacy. Unsubscribe anytime with 1-click.',

    // Footer & Common
    footerAbout: 'NP News Metro',
    footerAboutDesc: 'India’s premier independent digital newsroom delivering real-time investigative journalism, deep-tech coverage, market intelligence, and ground reports.',
    footerQuickLinks: 'Quick Links',
    footerCategories: 'News Categories',
    footerLegal: 'Legal & Standards',
    footerCopyright: '© 2026 NP News Metro Media Pvt. Ltd.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contactUs: 'Contact Us',
    careers: 'Careers',
    editorialPolicy: 'Editorial Ethics',
    allRightsReserved: 'All rights reserved.',
  },

  hi: {
    // Utility Bar & Header
    todayDate: 'बुधवार, 19 अगस्त, 2026',
    selectEdition: 'राष्ट्रीय / नई दिल्ली',
    weatherCity: 'नई दिल्ली 31°C',
    aqiStatus: 'AQI 84 (मध्यम)',
    epaper: 'ई-पेपर',
    morningBriefing: 'दैनिक ब्रीफिंग',
    factCheckDesk: 'तथ्य-जांच डेस्क',
    sections: 'अनुभाग',
    searchPlaceholder: 'समाचार, विषय या लेखक खोजें...',
    search: 'खोजें',
    saved: 'सहेजे गए',
    subscribe: 'सदस्यता लें',

    // Primary Navigation
    nav_home: 'मुख्य पृष्ठ',
    nav_latest: 'ताज़ा ख़बरें',
    nav_india: 'भारत',
    nav_politics: 'राजनीति',
    nav_business: 'व्यापार',
    nav_tech: 'तकनीक',
    nav_world: 'विदेश',
    nav_sports: 'खेल',
    nav_entertainment: 'मनोरंजन',
    nav_lifestyle: 'लाइफस्टाइल',
    nav_opinion: 'मैट्रो मत',
    metromat: 'मैट्रो मत',
    metromatTagline: 'संपादकीय विचार, जनमत एवं विश्लेषण',
    nav_videos: 'वीडियो',
    nav_photos: 'फ़ोटो',
    nav_trending: 'ट्रेंडिंग',
    live: 'लाइव',

    // Markets Ticker
    marketsLive: 'मार्केट्स लाइव:',
    bseSensex: 'बीएसई सेंसेक्स',
    nseNifty: 'एनएसई निफ्टी 50',
    usdInr: 'डॉलर / रुपया',
    brentCrude: 'ब्रेंट क्रूड',
    gold10g: 'सोना (10 ग्राम)',
    gsecYield: '10-वर्षीय जी-सेक',
    stable: 'स्थिर',

    // Breaking News
    breaking: 'ब्रेकिंग न्यूज़',
    topStories: 'प्रमुख ख़बरें',
    paused: 'रुका हुआ',
    playing: 'सक्रिय',

    // Homepage Section Titles
    latestNewsWire: 'ताज़ा समाचार वायर',
    viewAllUpdates: 'सभी 24/7 अपडेट देखें',
    mostReadAcrossIndia: 'भारत में सर्वाधिक पढ़े गए',
    top10List: 'शीर्ष 10 पूरी सूची',
    indiaPolitics: 'भारत एवं राष्ट्रीय राजनीति',
    viewAllPolitics: 'सभी राजनीति ख़बरें',
    businessMarketsEconomy: 'व्यापार, बाजार एवं अर्थव्यवस्था',
    viewAllBusiness: 'सभी व्यापार ख़बरें',
    videoExplainers: 'एनपी न्यूज़रूम वीडियो एवं व्याख्यात्मक रिपोर्ट',
    videoExplainerSubhead: 'स्वतंत्र खोजी वृत्तचित्र, विशेषज्ञ विश्लेषण और ज़मीनी रिपोर्ट।',
    videoHub: 'वीडियो हब',
    techDeepTech: 'तकनीक एवं डीप टेक',
    moreTech: 'और तकनीक',
    worldDiplomacy: 'विदेश एवं कूटनीति',
    moreWorld: 'और विदेश',

    // Card Meta & Actions
    readStory: 'पढ़ें',
    readTimeSuffix: 'का समय',
    publishedPrefix: 'प्रकाशित',
    by: 'द्वारा',
    readers: 'पाठक',
    shares: 'शेयर',
    listen: 'सुनें',
    playingAudio: 'ऑडियो चालू है',
    linkCopied: 'लिंक कॉपी हो गया!',
    exclusiveReport: 'विशेष रिपोर्ट',
    leadStory: 'मुख्य समाचार',
    npNewsDesk: 'एनपी न्यूज़ डेस्क',

    // Newsletter Box
    newsletterTitle: 'भारत का सबसे विश्वसनीय प्रभात समाचार पत्र प्राप्त करें',
    newsletterSubhead: '4.5 लाख से अधिक सुधी पाठकों से जुड़ें। खोजी पत्रकारिता, भू-राजनीतिक विश्लेषण और बाजार के प्रमुख समाचार हर सुबह 7 बजे आपके इनबॉक्स में।',
    newsletterPlaceholder: 'अपना ईमेल पता दर्ज करें...',
    newsletterBtn: 'निःशुल्क सदस्यता लें',
    newsletterPrivacy: 'हम आपकी गोपनीयता का सम्मान करते हैं। 1-क्लिक में कभी भी सदस्यता समाप्त करें।',

    // Footer & Common
    footerAbout: 'एनपी न्यूज़ मेट्रो',
    footerAboutDesc: 'भारत का प्रमुख स्वतंत्र डिजिटल न्यूज़रूम जो वास्तविक समय की खोजी पत्रकारिता, डीप-टेक कवरेज, बाजार विश्लेषण और निष्पक्ष ज़मीनी रिपोर्ट प्रस्तुत करता है।',
    footerQuickLinks: 'त्वरित लिंक',
    footerCategories: 'समाचार श्रेणियां',
    footerLegal: 'कानूनी एवं मानक',
    footerCopyright: '© 2026 एनपी न्यूज़ मेट्रो मीडिया प्रा. लि.',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    contactUs: 'संपर्क करें',
    careers: 'करियर',
    editorialPolicy: 'संपादकीय आचार संहिता',
    allRightsReserved: 'सर्वाधिकार सुरक्षित।',
  },
};
