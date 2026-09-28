import { EditorialCategorySlug } from '../types/wordpress';

export interface EditorialDesk {
  id: string;
  label: string;
  labelHi: string;
  mappedCategory: EditorialCategorySlug;
  badgeColor: string;
  subcategories: string[];
}

export const EDITORIAL_DESKS: EditorialDesk[] = [
  {
    id: 'india',
    label: 'National / India (राष्ट्रीय / देश)',
    labelHi: 'राष्ट्रीय / देश',
    mappedCategory: 'india',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    subcategories: [
      'National Policy & Governance',
      'Parliament & Legislation',
      'Central Schemes & Welfare',
      'Supreme Court & Legal Affairs',
      'Defense & National Security',
      'Infrastructure & Railways',
      'Northeast & Border Affairs',
      'Public Affairs & Administration',
    ],
  },
  {
    id: 'politics',
    label: 'Politics & Governance (राजनीति एवं चुनाव)',
    labelHi: 'राजनीति एवं चुनाव',
    mappedCategory: 'politics',
    badgeColor: 'bg-red-50 text-red-800 border-red-200',
    subcategories: [
      'Election News & Polls',
      'Ruling Party & Government',
      'Opposition & Alliance',
      'State Assemblies & Politics',
      'Political Rallies & Manifestos',
      'By-Elections & Civic Polls',
      'Political Analysis & Commentary',
    ],
  },
  {
    id: 'state-news',
    label: 'State & Regional News (राज्य एवं प्रादेशिक)',
    labelHi: 'राज्य एवं प्रादेशिक',
    mappedCategory: 'india',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
    subcategories: [
      'Uttar Pradesh (उत्तर प्रदेश)',
      'Madhya Pradesh (मध्य प्रदेश)',
      'Rajasthan (राजस्थान)',
      'Bihar & Jharkhand (बिहार - झारखंड)',
      'Delhi NCR & Haryana (दिल्ली एनसीआर एवं हरियाणा)',
      'Punjab & Himachal (पंजाब एवं हिमाचल)',
      'Maharashtra & Gujarat (महाराष्ट्र एवं गुजरात)',
      'South Indian States (दक्षिण भारत)',
      'Uttarakhand & Hill States (उत्तराखंड)',
    ],
  },
  {
    id: 'metro-cities',
    label: 'Metro & City News (मेट्रो एवं शहर)',
    labelHi: 'मेट्रो एवं शहर',
    mappedCategory: 'india',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    subcategories: [
      'Urban Governance & Municipal',
      'Metro Rail & Transport',
      'City Traffic & Civic Issues',
      'Smart Cities & Development',
      'Local Events & Culture',
      'Public Grievances & Civic Action',
    ],
  },
  {
    id: 'business',
    label: 'Business & Economy (व्यापार एवं अर्थव्यवस्था)',
    labelHi: 'व्यापार एवं अर्थव्यवस्था',
    mappedCategory: 'business',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    subcategories: [
      'Macro Economy & GDP',
      'Corporate & Companies',
      'Banking & Financial Services',
      'RBI & Monetary Policy',
      'Taxation, Budget & GST',
      'Trade, Export & Import',
      'MSME & Small Business',
      'Industry & Manufacturing',
    ],
  },
  {
    id: 'markets',
    label: 'Markets & Wealth (बाजार, शेयर एवं निवेश)',
    labelHi: 'बाजार, शेयर एवं निवेश',
    mappedCategory: 'business',
    badgeColor: 'bg-green-50 text-green-800 border-green-200',
    subcategories: [
      'Stock Markets (Sensex & Nifty)',
      'Mutual Funds & SIP',
      'IPO & Primary Markets',
      'Commodities (Gold & Silver)',
      'Personal Finance & Savings',
      'Crypto & Digital Assets',
      'Currency & Forex',
    ],
  },
  {
    id: 'real-estate',
    label: 'Real Estate & Infrastructure (रियल एस्टेट एवं इंफ्रा)',
    labelHi: 'रियल एस्टेट एवं इंफ्रास्ट्रक्चर',
    mappedCategory: 'business',
    badgeColor: 'bg-stone-50 text-stone-800 border-stone-200',
    subcategories: [
      'Housing & Property Markets',
      'Commercial Real Estate',
      'Expressways, Highways & Airports',
      'RERA & Property Laws',
      'Urban Housing & Smart Townships',
    ],
  },
  {
    id: 'technology',
    label: 'Technology & AI (प्रौद्योगिकी एवं एआई)',
    labelHi: 'प्रौद्योगिकी एवं एआई',
    mappedCategory: 'technology',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    subcategories: [
      'Artificial Intelligence & ML',
      'Smartphones & Mobile Gadgets',
      'Cybersecurity & Online Privacy',
      'Telecom, 5G & Broadband',
      'Tech Startups & Big Tech',
      'Software, Apps & Cloud',
      'Semiconductors & Electronics',
    ],
  },
  {
    id: 'science-space',
    label: 'Science & Space (विज्ञान एवं अंतरिक्ष)',
    labelHi: 'विज्ञान एवं अंतरिक्ष',
    mappedCategory: 'technology',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    subcategories: [
      'ISRO & Indian Space Missions',
      'NASA & Deep Space Exploration',
      'Scientific Innovations & Research',
      'Defense Tech & Missiles',
      'Nuclear & Clean Energy Science',
      'Astronomy & Stargazing',
    ],
  },
  {
    id: 'auto-mobility',
    label: 'Auto & EV Mobility (ऑटोमोबाइल एवं ईवी)',
    labelHi: 'ऑटोमोबाइल एवं ईवी',
    mappedCategory: 'technology',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    subcategories: [
      'Electric Vehicles (EV) & Tech',
      'New Car Launches & Reviews',
      'Two-Wheelers & Bikes',
      'Auto Industry & Market Trends',
      'Road Safety & Driving Norms',
    ],
  },
  {
    id: 'world',
    label: 'World & Geopolitics (विदेश / दुनिया)',
    labelHi: 'विदेश / दुनिया',
    mappedCategory: 'world',
    badgeColor: 'bg-violet-50 text-violet-800 border-violet-200',
    subcategories: [
      'Global Geopolitics & Diplomacy',
      'India & Neighborhood Relations',
      'US & Transatlantic Affairs',
      'Middle East & Gulf Nations',
      'Russia, Europe & Eurasia',
      'Global Conflicts & Wars',
      'UN, G20 & Global Summits',
      'Global Economy & Trade',
    ],
  },
  {
    id: 'sports',
    label: 'Sports & Cricket (खेल एवं क्रिकेट)',
    labelHi: 'खेल एवं क्रिकेट',
    mappedCategory: 'sports',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    subcategories: [
      'Cricket (Team India, Tests, ODI, T20)',
      'IPL & Global T20 Leagues',
      'Football (ISL, Premier League, FIFA)',
      'Olympics & Asian Games Athletics',
      'Badminton, Tennis & Table Tennis',
      'Hockey & Kabaddi',
      'Chess & Mind Sports',
      'Youth & Grassroots Sports',
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment & Cinema (मनोरंजन एवं सिनेमा)',
    labelHi: 'मनोरंजन एवं सिनेमा',
    mappedCategory: 'entertainment',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    subcategories: [
      'Bollywood & Hindi Cinema',
      'South Indian Cinema (Tollywood/Kollywood)',
      'OTT Releases & Web Series',
      'Box Office Collections & Trade',
      'Hollywood & World Cinema',
      'Television & Reality Shows',
      'Music, Concerts & Performing Arts',
      'Celebrity Interviews & Exclusive',
    ],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle, Health & Wellness (लाइफस्टाइल एवं स्वास्थ्य)',
    labelHi: 'लाइफस्टाइल एवं स्वास्थ्य',
    mappedCategory: 'lifestyle',
    badgeColor: 'bg-pink-50 text-pink-800 border-pink-200',
    subcategories: [
      'Healthcare, Medicine & Wellness',
      'Fitness, Yoga & Exercise',
      'Nutrition, Diet & Ayurveda',
      'Mental Health & Wellbeing',
      'Travel, Heritage & Tourism',
      'Fashion, Grooming & Beauty',
      'Relationship & Parenting',
    ],
  },
  {
    id: 'education-jobs',
    label: 'Education, Jobs & Career (शिक्षा, भर्ती एवं करियर)',
    labelHi: 'शिक्षा, भर्ती एवं करियर',
    mappedCategory: 'india',
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    subcategories: [
      'Sarkari Naukri & Govt Recruitment',
      'UPSC, SSC, Banking & State PSC',
      '10th & 12th Board Exams & Results',
      'Entrance Exams (JEE, NEET, CUET)',
      'Higher Education & Universities',
      'Career Guidance & Skill Building',
      'Scholarships & Educational Policy',
    ],
  },
  {
    id: 'crime',
    label: 'Crime, Law & Courts (अपराध, कानून एवं न्यायालय)',
    labelHi: 'अपराध, कानून एवं न्यायालय',
    mappedCategory: 'crime',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    subcategories: [
      'Court Judgments & Supreme Court',
      'Cybercrime & Financial Frauds',
      'Special Investigations (CBI, ED, NIA)',
      'Major Crime Reports & Police Action',
      'Legal Rights & Constitutional Laws',
      'Forensics & Investigation Insights',
    ],
  },
  {
    id: 'environment-agri',
    label: 'Environment, Climate & Agriculture (पर्यावरण एवं कृषि)',
    labelHi: 'पर्यावरण, जलवायु एवं कृषि',
    mappedCategory: 'lifestyle',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    subcategories: [
      'Climate Change & Weather Alerts',
      'Agriculture, Crops & MSP',
      'Farmers Welfare & Agri Schemes',
      'Wildlife, Forests & Conservation',
      'Air Quality, Water & Rivers',
      'Renewable Energy & Sustainability',
    ],
  },
  {
    id: 'social',
    label: 'Social Issues & Society (सामाजिक सरोकार)',
    labelHi: 'सामाजिक सरोकार',
    mappedCategory: 'social',
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
    subcategories: [
      'Women Empowerment & Safety',
      'Child Rights & Protection',
      'Senior Citizens & Social Welfare',
      'Rural Development & Panchayats',
      'Human Rights & Citizen Voice',
      'Social Organizations & Movements',
    ],
  },
  {
    id: 'astrology',
    label: 'Astrology & Horoscope (ज्योतिष एवं भविष्य)',
    labelHi: 'ज्योतिष एवं भविष्य',
    mappedCategory: 'astrology',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
    subcategories: [
      'Daily Horoscope (दैनिक राशिफल)',
      'Weekly & Monthly Rashifal',
      'Planetary Transits (ग्रह गोचर)',
      'Vedic Astrology & Kundali',
      'Vastu Shastra Tips & Remedies',
      'Numerology & Palmistry',
      'Shubh Muhurat & Panchang',
    ],
  },
  {
    id: 'religion',
    label: 'Religion, Spirituality & Culture (धर्म एवं संस्कृति)',
    labelHi: 'धर्म, संस्कृति एवं अध्यात्म',
    mappedCategory: 'religion',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    subcategories: [
      'Festivals, Vrat & Fasting Dates',
      'Sanatan Dharma & Vedic Wisdom',
      'Sacred Temples & Pilgrimages',
      'Spiritual Gurus & Pravachan',
      'Epics (Ramayana, Gita, Mahabharata)',
      'Spiritual Traditions & Faith',
    ],
  },
  {
    id: 'opinion',
    label: 'Metromat / Opinion & Editorial (मैट्रो मत / संपादकीय)',
    labelHi: 'मैट्रो मत / संपादकीय एवं विचार',
    mappedCategory: 'opinion',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    subcategories: [
      'Chief Editor\'s Desk (संपादकीय)',
      'Guest Columns & Expert Voices',
      'Policy In-Depth Analysis',
      'Geopolitical Perspectives',
      'Letters to the Editor & Public Debates',
      'Metromat Sunday Special',
    ],
  },
  {
    id: 'fact-check',
    label: 'Fact-Check & Investigation (तथ्य-जांच एवं विशेष पड़ताल)',
    labelHi: 'तथ्य-जांच एवं विशेष पड़ताल',
    mappedCategory: 'india',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    subcategories: [
      'Viral Social Media Fact-Check',
      'Fake News & Hoax Buster',
      'Deepfake & AI Media Verification',
      'RTI & Public Record Audits',
      'Investigative Dispatches',
    ],
  },
];

/**
 * Finds the desk matching a desk ID or fallback mapped category
 */
export const getDeskByIdOrCategory = (identifier?: string): EditorialDesk => {
  if (!identifier) return EDITORIAL_DESKS[0];
  const foundById = EDITORIAL_DESKS.find(d => d.id === identifier);
  if (foundById) return foundById;
  const foundByMapped = EDITORIAL_DESKS.find(d => d.mappedCategory === identifier);
  return foundByMapped || EDITORIAL_DESKS[0];
};

/**
 * Returns all curated subcategories for a given desk or mapped category
 */
export const getSubcategoriesForDeskOrCategory = (identifier?: string): string[] => {
  const desk = getDeskByIdOrCategory(identifier);
  return desk.subcategories;
};
