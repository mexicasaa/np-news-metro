// @ts-nocheck
import "./_suppressWarnings.js";
import { createClient } from "@supabase/supabase-js";
import { FALLBACK_ARTICLES, FALLBACK_VIDEOS } from "./_sitemapHelper.js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://bogjmdyolhazzvicjrjl.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { createClient: () => null }
});

const SITE_ORIGIN = "https://www.npnewsmetro.com";
const DEFAULT_OG_IMAGE = "https://www.npnewsmetro.com/uploads/dr-deepak-goswami.jpg";
const shareWarmCache = new Map();
const SHARE_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getAbsoluteUrl(img, slug) {
  if (!img || typeof img !== "string" || !img.trim()) return DEFAULT_OG_IMAGE;
  const trimmed = img.trim();
  if (trimmed.startsWith("data:")) {
    if (slug) {
      return `${SITE_ORIGIN}/api/image?slug=${encodeURIComponent(slug)}`;
    }
    return DEFAULT_OG_IMAGE;
  }
  if (trimmed.includes("pub-a4495fe3c1c741f2a1c8d8cd43ce064f.r2.dev")) {
    return trimmed.replace("https://pub-a4495fe3c1c741f2a1c8d8cd43ce064f.r2.dev", "https://cdn.npnewsmetro.com");
  }
  if (/^https?:\/\/pub-[a-zA-Z0-9]+\.r2\.dev/.test(trimmed)) {
    return trimmed.replace(/^https?:\/\/pub-[a-zA-Z0-9]+\.r2\.dev/, "https://cdn.npnewsmetro.com");
  }
  if (trimmed.includes("supabase.co/storage/v1/object/public/")) {
    const pathAfter = trimmed.split("/storage/v1/object/public/")[1];
    if (pathAfter) {
      return `https://cdn.npnewsmetro.com/${pathAfter.replace(/^\/+/, "")}`;
    }
    return DEFAULT_OG_IMAGE;
  }
  if (trimmed.includes("supabase.co/storage/v1/render/image/public/")) {
    const pathAfter = trimmed.split("/storage/v1/render/image/public/")[1]?.split("?")[0];
    if (pathAfter) {
      return `https://cdn.npnewsmetro.com/${pathAfter.replace(/^\/+/, "")}`;
    }
    return DEFAULT_OG_IMAGE;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    if (trimmed.includes("images.unsplash.com")) {
      try {
        const u = new URL(trimmed);
        u.searchParams.set("w", "1200");
        u.searchParams.set("q", "75");
        u.searchParams.set("auto", "format");
        return u.toString();
      } catch (e) {
        return trimmed;
      }
    }
    return trimmed;
  }
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${SITE_ORIGIN}${cleanPath}`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sendResponse(res, statusCode, contentType, body, isBypass = false) {
  res.statusCode = statusCode;
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", contentType);
    const cacheControl = isBypass
      ? "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
      : "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
    res.setHeader("Cache-Control", cacheControl);
  }
  if (typeof res.status === "function" && typeof res.send === "function") {
    return res.status(statusCode).send(body);
  }
  return res.end(body);
}

const CATEGORY_NAMES = {
  india: "India & National",
  politics: "Politics",
  business: "Business & Economy",
  technology: "Technology & AI",
  world: "World News",
  sports: "Sports",
  entertainment: "Entertainment",
  lifestyle: "Lifestyle & Health",
  opinion: "Opinion & Editorial",
  videos: "Videos & Broadcasts",
  photos: "Photo Galleries",
  social: "Social & Community",
  astrology: "Astrology & Horoscope",
  crime: "Crime & Legal",
  state: "State News",
  culture: "Culture & Heritage",
  ncr: "Delhi-NCR",
  religion: "Spiritual & Religion",
  latest: "Latest News"
};

// ---------------------------------------------------------------------------
// STATIC LEGAL & TRUST PAGES (Full E-E-A-T & Google AdSense Policy Compliance)
// ---------------------------------------------------------------------------
const STATIC_PAGES = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy | NP News Metro — Data Protection & AdSense Compliance",
    description: "NP News Metro Privacy Policy detailing our data sovereignty standards, user confidentiality, cookies, Google AdSense disclosures, and adherence to the Digital Personal Data Protection Act, 2023.",
    heading: "Privacy Policy (गोपनीयता नीति)",
    subheading: "Last Updated: September 2026 • Compliant with DPDP Act 2023, IT Act 2000 & Google Publisher Policies",
    sections: [
      {
        heading: "1. Overview & Commitment to Data Privacy",
        paragraphs: [
          `NP News Metro ("we", "our", or "us", accessible via https://www.npnewsmetro.com) is deeply committed to protecting the privacy, confidentiality, and data sovereignty of our readers, subscribers, and partners. This Privacy Policy details how personal information is collected, processed, and safeguarded across our digital newspaper platform, mobile portals, RSS feeds, and newsletters.`,
          `Our data handling policies strictly conform to the Digital Personal Data Protection Act, 2023 (DPDP Act 2023), the Information Technology Act, 2000, and standard global data protection frameworks.`
        ]
      },
      {
        heading: "2. Information We Collect",
        paragraphs: [
          `A. Information Voluntarily Provided: When readers subscribe to our executive news briefings, comment on articles, submit investigative tips, or reach out via editorial contact forms, we may collect identifying details including full name, email address, phone number, and message contents.`,
          `B. Automated Technical Metadata: For cybersecurity defense, spam elimination, and Core Web Vitals optimization, our edge delivery network automatically records anonymized IP addresses, browser types, device specifications, operating systems, referring URLs, and timestamps.`
        ]
      },
      {
        heading: "3. Cookies, Web Beacons & Third-Party Advertising (Google AdSense Disclosure)",
        paragraphs: [
          `NP News Metro uses HTTP cookies and browser local storage to preserve language selections (Hindi/English), secure user sessions, and deliver high-performance news feeds.`,
          `IMPORTANT THIRD-PARTY ADVERTISING DISCLOSURE:`,
          `• Google, as a third-party vendor, uses cookies (including the DoubleClick DART cookie) to serve advertisements on npnewsmetro.com.`,
          `• Google's use of advertising cookies enables it and its certified advertising partners to serve relevant advertisements to our readers based on their visits to our website and/or other destinations across the Internet.`,
          `• Readers may opt out of personalized advertising by visiting Google Ads Settings at https://adssettings.google.com or through www.aboutads.info.`,
          `• Readers retain full control to accept, block, or delete cookies at any time via their web browser preferences.`
        ]
      },
      {
        heading: "4. Zero-Sale Guarantee & Reader Data Security",
        paragraphs: [
          `We operate under an absolute Zero-Sale Guarantee: NP News Metro NEVER sells, rents, monetizes, or trades reader personal information with third-party data brokers, telemarketers, or marketing aggregators. Reader information is solely utilized for editorial delivery, reader communication, and platform security.`,
          `All network transmissions are safeguarded via modern TLS 1.3 encryption protocols and multi-layer firewall infrastructure.`
        ]
      },
      {
        heading: "5. Legal Rights Under the DPDP Act 2023",
        paragraphs: [
          `Under India's Digital Personal Data Protection Act, 2023, readers have the right to access their stored personal records, request corrections of inaccuracies, or demand complete erasure of their data from our systems. For data inquiries, please reach out to our Data Protection Desk at privacy@npnewsmetro.com.`
        ]
      },
      {
        heading: "6. Children's Privacy",
        paragraphs: [
          `NP News Metro is an adult digital newspaper and current-affairs platform. We do not knowingly solicit, collect, or retain personal data from children under 13 years of age. If you believe a minor has submitted personal data, notify us immediately for prompt deletion.`
        ]
      },
      {
        heading: "7. Grievance Officer & Contact Information",
        paragraphs: [
          `In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, any inquiries, grievances, or legal notices concerning data handling may be addressed to:`,
          `Data Protection Officer & Grievance Desk: NP News Metro Editorial Bureau | Email: privacy@npnewsmetro.com | contact@npnewsmetro.com | Address: National Capital Region (NCR), New Delhi, India.`
        ]
      }
    ]
  },
  about: {
    slug: "about",
    title: "About Us | NP News Metro — Real News. Real Impact.",
    description: "NP News Metro is an independent digital newspaper delivering investigative journalism, governance analysis, and public-interest reporting across India.",
    heading: "About NP News Metro (हमारे बारे में)",
    subheading: "Real News. Real Impact. Independent, Credible Digital Journalism for Modern India.",
    sections: [
      {
        heading: "1. Mission & Editorial Philosophy",
        paragraphs: [
          `NP News Metro was established with a singular, unwavering mission: to provide independent, fearless, and fact-verified journalism that empowers citizens and strengthens democratic governance. In an era of sensationalized headlines, we prioritize contextual depth, investigative rigor, and public accountability.`,
          `Our newsroom covers national politics, state governance, economic policy, agriculture, technology, urban infrastructure, courts, sports, and cultural heritage, presenting stories with bilingual accessibility (English & Hindi).`
        ]
      },
      {
        heading: "2. Institutional Leadership & Governance",
        paragraphs: [
          `NP News Metro maintains a strict institutional firewall between editorial journalism and commercial operations:`,
          `• Founder & Chief Technology Officer (CTO): Umang Pandey, architecting digital news infrastructure, editorial integrity systems, and platform security.`,
          `• Chief Mentor & Advisory Patron: Dr. Neelima Pandey, distinguished educator, literary scholar, and poet, guiding our ethical, educational, and cultural vision.`,
          `• Advisory Board Members: Diwan Chand Arya (D. C. Arya) and Raj Kumar Agarwal, providing institutional governance, media ethics oversight, and public integrity counsel.`
        ]
      },
      {
        heading: "3. Press Council Code & Fact Verification",
        paragraphs: [
          `NP News Metro adheres strictly to the Journalistic Code of Ethics established by the Press Council of India. Every dispatch published across our desks undergoes multi-tier editorial cross-verification with official records, on-ground reporting, and independent corroboration before publication.`
        ]
      },
      {
        heading: "4. Multi-Bureau Reporting Network",
        paragraphs: [
          `Our reporting bureaus in New Delhi, Lucknow, Chandigarh, Dehradun, and Patna work around the clock to deliver first-hand ground reports, policy dispatches, and public interest investigations.`
        ]
      }
    ]
  },
  contact: {
    slug: "contact",
    title: "Contact Us | NP News Metro Newsroom & Editorial Bureau",
    description: "Contact NP News Metro editors, investigative desks, grievance officers, and bureau operations.",
    heading: "Contact the Newsroom (संपर्क सूत्र)",
    subheading: "Connect with our editorial leadership, correspondents, grievance desk, and commercial team.",
    sections: [
      {
        heading: "1. Editorial Newsroom & News Tips",
        paragraphs: [
          `For breaking news leads, confidential whistleblowing tips, and press releases:`,
          `• Editorial Desk: editor@npnewsmetro.com`,
          `• General Inquiries: contact@npnewsmetro.com`,
          `• Bureau Operations: bureau@npnewsmetro.com`
        ]
      },
      {
        heading: "2. Grievance Officer & Statutory Desk",
        paragraphs: [
          `In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:`,
          `• Grievance Officer: Editorial Redressal Desk, NP News Metro`,
          `• Email: grievance@npnewsmetro.com / privacy@npnewsmetro.com`,
          `• Headquarters: National Capital Region (NCR), New Delhi, India.`
        ]
      },
      {
        heading: "3. Platform & Technology Support",
        paragraphs: [
          `For website technical feedback, security vulnerability reports, or syndication API queries:`,
          `• Technology Lead: tech@npnewsmetro.com / umang.pandey@npnewsmetro.com`
        ]
      },
      {
        heading: "4. Commercial & Advertising Desk",
        paragraphs: [
          `For brand partnerships, display campaigns, and executive event sponsorships:`,
          `• Commercial Partnerships: advertise@npnewsmetro.com`
        ]
      }
    ]
  },
  terms: {
    slug: "terms",
    title: "Terms of Service | NP News Metro",
    description: "Terms and conditions governing reader access, intellectual property, and community guidelines for NP News Metro.",
    heading: "Terms of Service (नियम एवं शर्तें)",
    subheading: "User Agreement, Intellectual Property Rights, and Platform Guidelines.",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        paragraphs: [
          `By accessing, browsing, or subscribing to NP News Metro (npnewsmetro.com), you acknowledge and agree to be legally bound by these Terms of Service, our Privacy Policy, and all applicable laws of the Republic of India.`
        ]
      },
      {
        heading: "2. Intellectual Property & Copyright",
        paragraphs: [
          `All editorial content, original investigative reports, photographs, videos, audio dispatches, and graphics published on NP News Metro are the intellectual property of NP News Metro and protected under the Indian Copyright Act, 1957. Unauthorized commercial reproduction, bulk automated scraping, or unauthorized syndication is strictly prohibited.`
        ]
      },
      {
        heading: "3. Community Standards & User Conduct",
        paragraphs: [
          `Readers engaging with interactive comments or newsroom discussions must maintain civil conduct. Hate speech, defamation, harassment, commercial spam, and illegal content are strictly banned and will result in immediate termination of account privileges.`
        ]
      },
      {
        heading: "4. Jurisdiction & Governing Law",
        paragraphs: [
          `These terms shall be governed by and construed in accordance with the laws of India. Any legal dispute or proceeding arising from this agreement shall be subject to the exclusive jurisdiction of the competent courts in Delhi/NCR, India.`
        ]
      }
    ]
  },
  ethics: {
    slug: "ethics",
    title: "Code of Journalistic Ethics | NP News Metro",
    description: "Our standards on accuracy, editorial independence, conflict of interest, and investigative integrity.",
    heading: "Code of Journalistic Ethics (पत्रकारिता आचार संहिता)",
    subheading: "Principles of Truth, Independence, Impartiality, and Public Accountability.",
    sections: [
      {
        heading: "1. Relentless Commitment to Truth & Verification",
        paragraphs: [
          `Factual truth is our paramount duty. Our reporters are required to independently corroborate all claims with primary documents, official records, or verified eyewitness testimony before publishing.`
        ]
      },
      {
        heading: "2. Commercial Independence & Non-Partisanship",
        paragraphs: [
          `We enforce strict separation between our newsroom and commercial advertisers. Commercial sponsors have zero input or veto power over our investigative reporting, commentary, or news selection.`
        ]
      },
      {
        heading: "3. Fairness & The Right to Reply",
        paragraphs: [
          `Whenever an entity or individual is subject to critical reporting or investigation, our reporters must provide reasonable opportunity for that party to respond, incorporating their response into the published story.`
        ]
      },
      {
        heading: "4. Protection of Vulnerable Individuals",
        paragraphs: [
          `We adhere strictly to statutory provisions protecting the identities of sexual assault victims, minors in conflict with the law, and vulnerable witnesses, never compromising individual dignity for sensationalism.`
        ]
      }
    ]
  },
  "editorial-team": {
    slug: "editorial-team",
    title: "Editorial Team & Masthead | NP News Metro",
    description: "Meet the editors, correspondents, and institutional leadership guiding NP News Metro.",
    heading: "Editorial Team & Masthead (संपादकीय मंडल)",
    subheading: "Dedicated journalists, policy analysts, and institutional advisors.",
    sections: [
      {
        heading: "1. Executive & Technology Leadership",
        paragraphs: [
          `• Umang Pandey — Founder & Chief Technology Officer (CTO): Leading platform engineering, newsroom architecture, editorial security, and data sovereignty infrastructure.`
        ]
      },
      {
        heading: "2. Advisory Mentors & Strategic Council",
        paragraphs: [
          `• Dr. Neelima Pandey — Chief Mentor & Advisor: Distinguished educator, literary scholar, and poet, guiding cultural discourse, ethical integrity, and educational coverage.`,
          `• Diwan Chand Arya (D. C. Arya) — Advisory Board Member: Providing strategic counsel on institutional governance, public integrity, and community affairs.`,
          `• Raj Kumar Agarwal — Advisory Board Member: Guiding economic policy analysis, enterprise sustainability, and media governance.`
        ]
      },
      {
        heading: "3. Reporting Desks & Bureau Chiefs",
        paragraphs: [
          `• Senior National Affairs Editors: Directing political reporting, parliamentary proceedings, and constitutional affairs.`,
          `• Economics & Markets Correspondents: Covering the Reserve Bank of India, macroeconomic policy, capital markets, and corporate governance.`,
          `• Technology & Geopolitics Leads: Covering AI governance, semiconductor corridors, national security, and space exploration.`,
          `• Regional Bureau Network: On-ground correspondents stationed across Delhi-NCR, Uttar Pradesh, Punjab, Haryana, Uttarakhand, and Bihar.`
        ]
      }
    ]
  },
  corrections: {
    slug: "corrections",
    title: "Corrections & Clarifications Policy | NP News Metro",
    description: "Our transparent protocols for verifying reader feedback, addressing errors, and publishing corrections.",
    heading: "Corrections Policy (संशोधन नीति)",
    subheading: "Accountability, Transparency, and Commitment to Factual Truth.",
    sections: [
      {
        heading: "1. Commitment to Prompt Rectification",
        paragraphs: [
          `We take factual precision seriously. When an error of fact, name, date, or data occurs, we correct it promptly and transparently, rather than quietly overwriting history.`
        ]
      },
      {
        heading: "2. How Readers Can Flag Corrections",
        paragraphs: [
          `Readers who notice an inaccuracy in any NP News Metro dispatch are encouraged to email corrections@npnewsmetro.com with the article link, the disputed statement, and supporting source documentation.`
        ]
      },
      {
        heading: "3. Handling of Corrections",
        paragraphs: [
          `Substantive factual corrections are marked with a clear editorial note at the bottom of the article detailing what was corrected, why, and the timestamp of the update.`
        ]
      }
    ]
  },
  disclaimer: {
    slug: "disclaimer",
    title: "Editorial & Content Disclaimer | NP News Metro",
    description: "Official disclaimers regarding journalistic reporting, market analysis, and third-party advertising on NP News Metro.",
    heading: "Editorial Disclaimer (अस्वीकरण)",
    subheading: "Legal Disclosures, Financial Disclaimers, and Third-Party Advertising Notices.",
    sections: [
      {
        heading: "1. General Information Purpose",
        paragraphs: [
          `The reports, opinions, articles, and media published on NP News Metro (npnewsmetro.com) are intended solely for general news, public policy discussion, and educational information.`
        ]
      },
      {
        heading: "2. Financial & Investment Disclaimer",
        paragraphs: [
          `Market analyses, stock reports, economic forecasts, and corporate disclosures published on our platform are purely journalistic dispatches. They DO NOT constitute financial advisory, investment recommendations, or SEBI-registered portfolio advice. Readers must consult qualified financial advisors before executing capital market trades.`
        ]
      },
      {
        heading: "3. Health & Medical Information",
        paragraphs: [
          `Health and wellness articles are compiled from scientific publications and official health guidelines for public awareness. They do not constitute professional medical diagnosis or clinical treatment.`
        ]
      },
      {
        heading: "4. Third-Party Advertisements & Sponsored Content",
        paragraphs: [
          `NP News Metro hosts automated advertisements served by Google AdSense and authorized direct partners. We do not endorse or guarantee the claims, safety, or quality of products or services offered by third-party advertisers.`
        ]
      }
    ]
  },
  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie Policy | NP News Metro",
    description: "Information regarding cookie utilization, advertising identifiers, and browser control preferences.",
    heading: "Cookie Policy (कुकी नीति)",
    subheading: "How NP News Metro uses cookies, analytics tokens, and advertising identifiers.",
    sections: [
      {
        heading: "1. What Are Cookies?",
        paragraphs: [
          `Cookies are small text files placed on your device by websites you visit. They help websites remember preferences, authenticate sessions, and deliver optimized content.`
        ]
      },
      {
        heading: "2. Cookie Categories We Deploy",
        paragraphs: [
          `• Essential Operational Cookies: Required for core site performance, page routing, and cybersecurity.`,
          `• Preference Cookies: Save your language preference (Hindi/English) and display theme.`,
          `• Performance & Telemetry: Anonymously measure loading speed and Core Web Vitals.`,
          `• Google AdSense Advertising Cookies: Used by Google and certified partners to serve ads relevant to user browsing behavior across the web.`
        ]
      },
      {
        heading: "3. Managing Your Cookie Preferences",
        paragraphs: [
          `You can choose to disable or selectively turn off cookies through your browser settings. To manage Google's advertising cookies specifically, visit https://adssettings.google.com.`
        ]
      }
    ]
  },
  advertise: {
    slug: "advertise",
    title: "Advertise With Us | NP News Metro Media Kit",
    description: "High-impact advertising, brand integrations, and digital media solutions on NP News Metro.",
    heading: "Advertise With NP News Metro (विज्ञापन समाधान)",
    subheading: "Reach modern India's decision-makers, professionals, and engaged citizens.",
    sections: [
      {
        heading: "1. Audience & Demographics",
        paragraphs: [
          `NP News Metro connects brands with an influential, educated readership of corporate leaders, civil servants, entrepreneurs, researchers, policy makers, and discerning citizens across India.`
        ]
      },
      {
        heading: "2. Premium Commercial Inventory Zones (A1 - A7)",
        paragraphs: [
          `Our high-viewability display ad zones are engineered with zero Cumulative Layout Shift (CLS) for optimal reader experience:`,
          `• Zone A1: Masthead Billboard | Zone A2: Breaking News Leaderboard | Zone A3: Vertical Sidebar Unit`,
          `• Zone A4: In-Article Focus Unit | Zone A5: Engagement End-of-Story Unit | Zone A6: Category Desk Sponsorship | Zone A7: Daily Executive Briefing Sponsorship.`
        ]
      },
      {
        heading: "3. Contact Commercial Operations",
        paragraphs: [
          `To request our official Media Kit and Rate Card, contact: advertise@npnewsmetro.com.`
        ]
      }
    ]
  }
};

const STATIC_ALIASES = {
  "privacy-policy": "privacy",
  "privacy_policy": "privacy",
  "about-us": "about",
  "about_us": "about",
  "contact-us": "contact",
  "contact_us": "contact",
  "terms-and-conditions": "terms",
  "terms_and_conditions": "terms",
  "terms-of-service": "terms"
};

const FALLBACK_SLUGS = {
  "nayab-saini-patiala-teej": {
    title: 'Haryana CM Nayab Saini Celebrates Teej in Patiala: "Punjab & Haryana Share Timeless Ties of Love and Brotherhood"',
    dek: "Chief Minister Nayab Saini highlights enduring cultural brotherhood between Punjab and Haryana at Teej celebration in Patiala.",
    category: "politics",
    image: "/uploads/nayab-saini-patiala-teej.jpg",
    author: "NP Newsroom Political Bureau",
    publishedAt: "2026-08-22T16:00:00.000Z",
    paragraphs: [
      "Patiala: Haryana Chief Minister Nayab Singh Saini on Saturday addressed a vibrant gathering at the traditional Teej festival celebrations in Patiala, emphasizing the deep historical, cultural, and emotional bonds shared between Punjab and Haryana.",
      "Addressing the gathering, the Chief Minister remarked that political boundaries cannot diminish the shared civilizational heritage, agricultural traditions, and fraternal affection uniting the people of both states.",
      "Prominent community leaders, social representatives, and cultural troupes attended the event, which featured folk music, traditional swings, and community feasts."
    ]
  },
  "iskcon-noida-janmashtami-2026": {
    title: "ISKCON Noida Unveils Grand Janmashtami 2026 Celebrations: 108 Sacred Kalash Maha Abhishek and 5 Lakh Devotees Expected",
    dek: "ISKCON Sector 33 Noida gears up for historic Janmashtami festival with 1008 Bhog offerings, immersive cultural pavilions, and round-the-clock spiritual festivities.",
    category: "india",
    image: "/uploads/iskcon-noida-janmashtami-2026.jpg",
    author: "NP News Metro Cultural Desk",
    publishedAt: "2026-08-22T15:30:00.000Z",
    paragraphs: [
      "Noida: The International Society for Krishna Consciousness (ISKCON) temple at Sector 33, Noida, has announced comprehensive arrangements for the forthcoming Sri Krishna Janmashtami celebrations.",
      "Temple administrators confirmed that over five lakh devotees from across the National Capital Region (NCR) are expected to visit the shrine over the three-day festivities.",
      "Key highlights include the 108 Sacred Kalash Maha Abhishek, 1008 Chhappan Bhog offerings prepared by international chefs, and immersive digital walkthroughs detailing the pastimes of Lord Krishna."
    ]
  },
  "dr-deepak-goswami": {
    title: "Dr. Deepak Goswami: Visionary Leader & Editorial Vanguard at NP News Metro",
    dek: "Leading investigative journalism and ground reporting across the nation.",
    category: "india",
    image: "/uploads/dr-deepak-goswami.jpg",
    author: "NP News Metro Editorial Board",
    publishedAt: "2026-08-20T10:00:00.000Z",
    paragraphs: [
      "Dr. Deepak Goswami has been at the forefront of digital news modernization in India, advocating for ethical journalism, investigative depth, and public accountability.",
      "Under his editorial stewardship, NP News Metro has expanded its reporting network to provide rigorous coverage of public policy, rural development, technology, and economic transformation."
    ]
  },
  "sugarcane-ethanol-future-featured": {
    title: "Sugarcane to Ethanol: The Fuel Revolution Transforming Rural India",
    dek: "How India's bio-energy roadmap is reviving farmer economics and cutting crude imports.",
    category: "business",
    image: "/uploads/sugarcane-ethanol-future-featured.jpg",
    author: "Agri-Business & Energy Bureau",
    publishedAt: "2026-08-22T02:30:00.000Z",
    paragraphs: [
      "New Delhi: India's accelerated ethanol blending programme is transforming the sugarcane agrarian belt into a renewable energy hub, providing timely liquidity to millions of cane growers while significantly lowering petroleum import bills.",
      "Distillery capacities across Uttar Pradesh, Maharashtra, and Karnataka have undergone massive technological modernization to support dual-feed ethanol manufacturing.",
      "Government policy incentives and guaranteed off-take pricing by Oil Marketing Companies (OMCs) have created a resilient economic ecosystem connecting farmers directly to national energy security."
    ]
  },
  "cabinet-approves-infrastructure-corridor-western-ports": {
    title: "Union Cabinet Approves ₹1.2 Lakh Crore Infrastructure Corridor Linking Major Western Ports to Industrial Nodes",
    dek: "The mega multi-modal logistics grid will slash transit times by 40% and connect key manufacturing hubs to JNPT and Mundra ports.",
    category: "india",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200",
    author: "NP Newsroom Infrastructure Bureau",
    publishedAt: "2026-08-19T02:00:00.000Z",
    paragraphs: [
      "New Delhi: The Union Cabinet on Wednesday gave its approval for a transformative ₹1.2 lakh crore multi-modal freight and industrial corridor connecting vital western maritime gateways directly with Northern and Central industrial clusters.",
      "The corridor integrates dedicated rail freight spines, access-controlled high-speed expressways, and automated multi-modal logistics parks equipped with inland container depots (ICDs).",
      "The project is expected to generate hundreds of thousands of formal employment opportunities and elevate India's ranking on the global Logistics Performance Index (LPI)."
    ]
  }
};

function buildCrawlerHtml({ title, description, canonicalUrl, shareUrl, ogType = "article", ogImage = DEFAULT_OG_IMAGE, jsonLd, bodyHtml }) {
  const imageExt = ogImage.split("?")[0].split(".").pop()?.toLowerCase();
  const imageMimeType = imageExt === "png" ? "image/png" : imageExt === "webp" ? "image/webp" : "image/jpeg";
  const finalShareUrl = shareUrl || canonicalUrl;

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | NP News Metro</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="googlebot-news" content="index, follow" />

  <meta property="og:site_name" content="NP News Metro" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${finalShareUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:url" content="${ogImage}" />
  <meta property="og:image:secure_url" content="${ogImage}" />
  <meta property="og:image:type" content="${imageMimeType}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="og:locale" content="hi_IN" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:domain" content="www.npnewsmetro.com" />
  <meta name="twitter:site" content="@NPNewsMetro" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:url" content="${finalShareUrl}" />
  <meta name="twitter:image" content="${ogImage}" />

  ${jsonLd ? `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>` : ""}

  <style>
    :root { --primary: #990000; --ink: #0f172a; --ink-muted: #64748b; --border: #e2e8f0; --bg: #faf8f5; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.75; color: var(--ink); max-width: 1040px; margin: 0 auto; padding: 20px; background-color: var(--bg); }
    header { border-bottom: 3px solid var(--primary); padding-bottom: 14px; margin-bottom: 24px; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 12px; }
    .brand { font-family: Georgia, serif; font-size: 28px; font-weight: 900; color: var(--primary); text-decoration: none; letter-spacing: -0.5px; }
    .tagline { font-size: 13px; color: var(--ink-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    nav { display: flex; flex-wrap: wrap; gap: 12px 18px; border-top: 1px solid var(--border); padding-top: 10px; }
    nav a { text-decoration: none; color: #334155; font-size: 13px; font-weight: 700; text-transform: uppercase; }
    nav a:hover, nav a.active { color: var(--primary); }
    .breadcrumbs { font-size: 12px; color: var(--ink-muted); margin-bottom: 20px; font-weight: 600; text-transform: uppercase; }
    .breadcrumbs a { color: var(--primary); text-decoration: none; }
    h1 { font-family: Georgia, serif; font-size: 32px; line-height: 1.25; color: var(--ink); margin: 12px 0 16px 0; font-weight: 800; }
    h2 { font-family: Georgia, serif; font-size: 22px; color: var(--ink); margin: 28px 0 12px 0; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
    .dek { font-size: 17px; color: #475569; line-height: 1.6; margin-bottom: 20px; border-left: 4px solid var(--primary); padding-left: 14px; }
    .byline { font-size: 13px; color: var(--ink-muted); margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    .featured-img { width: 100%; height: auto; max-height: 520px; object-fit: cover; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08); margin-bottom: 8px; }
    .caption { font-size: 12px; color: var(--ink-muted); font-style: italic; margin-bottom: 24px; }
    .article-body p { font-size: 17px; line-height: 1.8; margin-bottom: 20px; color: #1e293b; }
    .policy-section { margin-bottom: 28px; }
    .policy-section h2 { font-size: 20px; color: #1e293b; margin-top: 20px; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    .policy-section p { font-size: 15px; line-height: 1.7; margin-bottom: 12px; color: #334155; }
    .callout-box { background: #f1f5f9; border-left: 4px solid var(--primary); padding: 14px 18px; margin: 18px 0; border-radius: 2px; }
    .stories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin: 24px 0; }
    .story-card { background: #ffffff; border: 1px solid var(--border); border-radius: 4px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .story-card h3 { font-family: Georgia, serif; font-size: 17px; line-height: 1.4; margin: 0 0 8px 0; }
    .story-card h3 a { color: var(--ink); text-decoration: none; }
    .story-card h3 a:hover { color: var(--primary); }
    .story-card p { font-size: 13px; color: #475569; line-height: 1.5; margin: 6px 0 10px 0; }
    .story-card .meta { font-size: 11px; color: var(--ink-muted); font-weight: 600; text-transform: uppercase; }
    footer { margin-top: 50px; padding-top: 24px; border-top: 2px solid var(--border); font-size: 13px; color: var(--ink-muted); text-align: center; }
    footer a { color: #334155; text-decoration: none; margin: 0 8px; font-weight: 600; }
    footer a:hover { color: var(--primary); }
    footer .legal-links { margin-top: 14px; font-size: 12px; color: var(--ink-muted); }
  </style>
</head>
<body>
  <header>
    <div class="top-bar">
      <a href="${SITE_ORIGIN}/" class="brand">NP NEWS METRO</a>
      <span class="tagline">Real News. Real Impact.</span>
    </div>
    <nav>
      <a href="${SITE_ORIGIN}/">Home</a>
      <a href="${SITE_ORIGIN}/category/india">India</a>
      <a href="${SITE_ORIGIN}/category/politics">Politics</a>
      <a href="${SITE_ORIGIN}/category/business">Business</a>
      <a href="${SITE_ORIGIN}/category/technology">Tech &amp; AI</a>
      <a href="${SITE_ORIGIN}/category/world">World</a>
      <a href="${SITE_ORIGIN}/category/sports">Sports</a>
      <a href="${SITE_ORIGIN}/category/lifestyle">Lifestyle</a>
      <a href="${SITE_ORIGIN}/category/opinion">Opinion</a>
      <a href="${SITE_ORIGIN}/videos">Videos</a>
      <a href="${SITE_ORIGIN}/latest">Latest</a>
    </nav>
  </header>

  <main>
    ${bodyHtml}
  </main>

  <footer>
    <p>&copy; ${new Date().getFullYear()} NP News Metro. Independent Digital Journalism. All rights reserved.</p>
    <div class="legal-links">
      <a href="${SITE_ORIGIN}/about">About Us</a> &bull; 
      <a href="${SITE_ORIGIN}/editorial-team">Editorial Team</a> &bull; 
      <a href="${SITE_ORIGIN}/ethics">Code of Ethics</a> &bull; 
      <a href="${SITE_ORIGIN}/corrections">Corrections Policy</a> &bull; 
      <a href="${SITE_ORIGIN}/privacy">Privacy Policy</a> &bull; 
      <a href="${SITE_ORIGIN}/terms">Terms of Service</a> &bull; 
      <a href="${SITE_ORIGIN}/cookie-policy">Cookie Policy</a> &bull; 
      <a href="${SITE_ORIGIN}/disclaimer">Disclaimer</a> &bull; 
      <a href="${SITE_ORIGIN}/contact">Contact Us</a> &bull; 
      <a href="${SITE_ORIGIN}/sitemap.xml">XML Sitemap</a>
    </div>
  </footer>
</body>
</html>`;
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url || "/", SITE_ORIGIN);
    const rawSlugParam = (req.query?.slug || url.searchParams.get("slug") || "").trim();
    const rawCatParam = (req.query?.category || url.searchParams.get("category") || "").trim().toLowerCase();
    const pathParam = (req.query?.path || url.searchParams.get("path") || "").trim();
    const rawVersionParam = (req.query?.v || url.searchParams.get("v") || "").trim();
    const isHomepageReq = req.query?.homepage === "true" || url.searchParams.get("homepage") === "true";

    let cleanSlug = rawSlugParam;
    let cleanCategory = rawCatParam;

    try {
      if (cleanSlug) cleanSlug = decodeURIComponent(cleanSlug).trim();
      if (cleanCategory) cleanCategory = decodeURIComponent(cleanCategory).trim().toLowerCase();
    } catch (e) {}

    if (!cleanSlug && pathParam) {
      const parts = pathParam.replace(/^\/+|\/+$/g, "").split("/");
      if (parts.length >= 2) {
        cleanCategory = decodeURIComponent(parts[0]).toLowerCase();
        cleanSlug = decodeURIComponent(parts[1]);
      } else if (parts.length === 1) {
        cleanSlug = decodeURIComponent(parts[0]);
      }
    }

    // 1. HOMEPAGE CRAWLER PRE-RENDERER
    if (isHomepageReq || (!cleanSlug && !cleanCategory && !pathParam)) {
      const homeCacheKey = "view:homepage_crawler";
      const cachedHome = shareWarmCache.get(homeCacheKey);
      if (cachedHome && Date.now() - cachedHome.timestamp < SHARE_CACHE_TTL) {
        return sendResponse(res, 200, "text/html; charset=utf-8", cachedHome.html);
      }

      let homeArticles = [];
      try {
        const { data } = await supabase
          .from("articles")
          .select("title, title_hi, slug, excerpt, dek_hi, featured_image_url, published_at, author_name, is_lead, is_breaking_news, categories(name, slug)")
          .eq("status", "published")
          .order("is_lead", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(30);

        if (data && data.length > 0) {
          homeArticles = data;
        }
      } catch (e) {}

      if (homeArticles.length === 0) {
        homeArticles = FALLBACK_ARTICLES.map(a => ({
          title: a.title,
          slug: a.slug,
          excerpt: a.caption || a.title,
          featured_image_url: a.featuredImage,
          published_at: a.publishedAt,
          author_name: "NP News Metro Bureau",
          categories: { name: a.category.toUpperCase(), slug: a.category }
        }));
      }

      const leadStory = homeArticles[0] || homeArticles[0];
      const leadCat = leadStory?.categories?.slug || "india";
      const leadImage = leadStory?.featured_image_url ? getAbsoluteUrl(leadStory.featured_image_url) : DEFAULT_OG_IMAGE;
      const secondaryStories = homeArticles.slice(1, 7);
      const categoryStories = homeArticles.slice(7);

      const homeBodyHtml = `
        <div class="lead-section" style="margin-bottom: 32px; background: #ffffff; border: 1px solid var(--border); border-radius: 4px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
          <span style="background: var(--primary); color: #fff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 2px; text-transform: uppercase;">Lead Investigation</span>
          <h1 style="margin: 14px 0 10px 0;"><a href="${SITE_ORIGIN}/${leadCat}/${escapeHtml(leadStory.slug)}" style="color: var(--ink); text-decoration: none;">${escapeHtml(leadStory.title_hi || leadStory.title)}</a></h1>
          <p class="dek">${escapeHtml(leadStory.dek_hi || leadStory.excerpt || leadStory.title)}</p>
          <div class="byline">By ${escapeHtml(leadStory.author_name || "NP News Metro Bureau")} &bull; Published ${new Date(leadStory.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
          ${leadImage ? `<a href="${SITE_ORIGIN}/${leadCat}/${escapeHtml(leadStory.slug)}"><img src="${leadImage}" alt="${escapeHtml(leadStory.title)}" class="featured-img" /></a>` : ""}
        </div>

        <h2 style="font-size: 24px;">Top National Headlines &amp; Ground Reports</h2>
        <div class="stories-grid">
          ${secondaryStories.map(a => {
            const catSlug = a.categories?.slug || "india";
            const catName = a.categories?.name || CATEGORY_NAMES[catSlug] || catSlug.toUpperCase();
            return `
              <article class="story-card">
                <span class="meta" style="color: var(--primary);">${escapeHtml(catName)}</span>
                <h3><a href="${SITE_ORIGIN}/${catSlug}/${escapeHtml(a.slug)}">${escapeHtml(a.title_hi || a.title)}</a></h3>
                <p>${escapeHtml(a.dek_hi || a.excerpt || a.title)}</p>
                <div class="meta">${new Date(a.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} &bull; By ${escapeHtml(a.author_name || "Staff Correspondent")}</div>
              </article>
            `;
          }).join("")}
        </div>

        <h2 style="font-size: 24px; margin-top: 36px;">Latest Dispatches Across Desks</h2>
        <div class="stories-grid">
          ${categoryStories.map(a => {
            const catSlug = a.categories?.slug || "india";
            const catName = a.categories?.name || CATEGORY_NAMES[catSlug] || catSlug.toUpperCase();
            return `
              <article class="story-card">
                <span class="meta" style="color: var(--primary);">${escapeHtml(catName)}</span>
                <h3><a href="${SITE_ORIGIN}/${catSlug}/${escapeHtml(a.slug)}">${escapeHtml(a.title_hi || a.title)}</a></h3>
                <p>${escapeHtml(a.dek_hi || a.excerpt || a.title)}</p>
                <div class="meta">${new Date(a.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              </article>
            `;
          }).join("")}
        </div>

        <div class="editorial-statement" style="margin-top: 40px; padding: 24px; background: #ffffff; border: 1px solid var(--border); border-radius: 4px;">
          <h3 style="font-family: Georgia, serif; font-size: 20px; margin-top: 0; color: var(--primary);">About NP News Metro Journalism</h3>
          <p style="font-size: 15px; color: #334155; line-height: 1.7;">NP News Metro is an independent Indian digital newspaper committed to fact-verified, fearless journalism upholding public accountability, constitutional values, and democratic integrity. Our national newsroom operates across New Delhi, Lucknow, Chandigarh, Dehradun, and Patna, delivering multi-perspective reports in Hindi and English.</p>
        </div>
      `;

      const homeJsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "NewsMediaOrganization",
            "@id": `${SITE_ORIGIN}/#organization`,
            "name": "NP News Metro",
            "url": SITE_ORIGIN,
            "logo": `${SITE_ORIGIN}/logo.png`,
            "sameAs": ["https://twitter.com/NPNewsMetro"]
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_ORIGIN}/#website`,
            "url": SITE_ORIGIN,
            "name": "NP News Metro",
            "publisher": { "@id": `${SITE_ORIGIN}/#organization` }
          },
          {
            "@type": "ItemList",
            "name": "NP News Metro Top Stories",
            "itemListElement": homeArticles.slice(0, 10).map((a, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `${SITE_ORIGIN}/${a.categories?.slug || "india"}/${a.slug}`,
              "name": a.title
            }))
          }
        ]
      };

      const homeHtml = buildCrawlerHtml({
        title: "NP NEWS METRO — Real News. Real Impact. | Indian Digital Newspaper",
        description: "NP News Metro delivers real news, hard-hitting investigative journalism, politics, economy, technology, sports, and culture across India.",
        canonicalUrl: `${SITE_ORIGIN}/`,
        ogType: "website",
        ogImage: leadImage,
        jsonLd: homeJsonLd,
        bodyHtml: homeBodyHtml
      });

      shareWarmCache.set(homeCacheKey, { html: homeHtml, timestamp: Date.now() });
      return sendResponse(res, 200, "text/html; charset=utf-8", homeHtml);
    }

    // 2. STATIC LEGAL & TRUST PAGES
    const normalizedSlug = (cleanSlug || "").toLowerCase();
    const staticKey = STATIC_ALIASES[normalizedSlug] || (STATIC_PAGES[normalizedSlug] ? normalizedSlug : null);

    if (staticKey && STATIC_PAGES[staticKey]) {
      const pageData = STATIC_PAGES[staticKey];
      const pageCacheKey = `static:${staticKey}`;
      const cachedStatic = shareWarmCache.get(pageCacheKey);
      if (cachedStatic && Date.now() - cachedStatic.timestamp < SHARE_CACHE_TTL) {
        return sendResponse(res, 200, "text/html; charset=utf-8", cachedStatic.html);
      }

      const pageCanonical = `${SITE_ORIGIN}/${staticKey}`;
      const staticBodyHtml = `
        <div class="breadcrumbs">
          <a href="${SITE_ORIGIN}/">Home</a> &rsaquo; <span>${escapeHtml(pageData.heading.split("(")[0].trim())}</span>
        </div>

        <article style="background: #ffffff; border: 1px solid var(--border); border-radius: 4px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
          <h1 style="margin-top: 0;">${escapeHtml(pageData.heading)}</h1>
          <p class="dek" style="margin-bottom: 28px;">${escapeHtml(pageData.subheading)}</p>

          ${pageData.sections.map(sec => `
            <section class="policy-section">
              <h2>${escapeHtml(sec.heading)}</h2>
              ${sec.paragraphs.map(p => {
                if (p.startsWith("IMPORTANT THIRD-PARTY ADVERTISING DISCLOSURE:")) {
                  return `<div class="callout-box"><strong style="color: var(--primary);">${escapeHtml(p)}</strong></div>`;
                }
                return `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`;
              }).join("\n")}
            </section>
          `).join("\n")}

          <div style="margin-top: 36px; padding: 20px; background: #f8fafc; border-top: 2px solid var(--primary); border-radius: 2px;">
            <p style="margin: 0; font-size: 13px; color: #475569;">
              <strong>Editorial Transparency:</strong> For inquiries regarding our standards, editorial guidelines, or legal compliance, contact our senior newsroom desk directly at <a href="mailto:editor@npnewsmetro.com" style="color: var(--primary); font-weight: bold;">editor@npnewsmetro.com</a>.
            </p>
          </div>
        </article>
      `;

      const staticJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": pageData.title,
        "description": pageData.description,
        "url": pageCanonical,
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": "NP News Metro",
          "url": SITE_ORIGIN,
          "logo": `${SITE_ORIGIN}/logo.png`
        }
      };

      const staticHtml = buildCrawlerHtml({
        title: pageData.title,
        description: pageData.description,
        canonicalUrl: pageCanonical,
        ogType: "website",
        ogImage: DEFAULT_OG_IMAGE,
        jsonLd: staticJsonLd,
        bodyHtml: staticBodyHtml
      });

      shareWarmCache.set(pageCacheKey, { html: staticHtml, timestamp: Date.now() });
      return sendResponse(res, 200, "text/html; charset=utf-8", staticHtml);
    }

    // 3. CATEGORY PRE-RENDERER
    if ((cleanCategory && !cleanSlug) || cleanCategory === "category") {
      const targetCat = (cleanSlug || cleanCategory).toLowerCase();
      const catCacheKey = `cat:${targetCat}`;
      const cachedCat = shareWarmCache.get(catCacheKey);
      if (cachedCat && Date.now() - cachedCat.timestamp < SHARE_CACHE_TTL) {
        return sendResponse(res, 200, "text/html; charset=utf-8", cachedCat.html);
      }

      const catDisplayName = CATEGORY_NAMES[targetCat] || targetCat.toUpperCase();
      const canonicalCatUrl = `${SITE_ORIGIN}/category/${targetCat}`;

      let catArticles = [];
      try {
        let catQuery = supabase
          .from("articles")
          .select("title, title_hi, slug, excerpt, dek_hi, featured_image_url, published_at, author_name, categories(id, name, slug)")
          .eq("status", "published");

        if (targetCat !== "latest") {
          const { data: catRow } = await supabase.from("categories").select("id").eq("slug", targetCat).maybeSingle();
          if (catRow?.id) {
            catQuery = catQuery.eq("category_id", catRow.id);
          }
        }

        const { data: catData } = await catQuery.order("published_at", { ascending: false }).limit(15);
        if (catData && catData.length > 0) {
          catArticles = catData;
        }
      } catch (e) {}

      if (catArticles.length < 6) {
        const matchingFallbacks = FALLBACK_ARTICLES.filter(
          a => a.category.toLowerCase() === targetCat || targetCat === "latest"
        ).map(a => ({
          title: a.title,
          slug: a.slug,
          excerpt: a.caption || a.title,
          featured_image_url: a.featuredImage,
          published_at: a.publishedAt,
          author_name: "NP News Metro Desk",
          categories: { slug: a.category, name: CATEGORY_NAMES[a.category] || a.category.toUpperCase() }
        }));

        for (const fb of matchingFallbacks) {
          if (!catArticles.some(a => a.slug === fb.slug)) {
            catArticles.push(fb);
          }
        }
      }

      const topCatImage = catArticles.find(a => a.featured_image_url)?.featured_image_url;
      const catImage = topCatImage ? getAbsoluteUrl(topCatImage) : DEFAULT_OG_IMAGE;

      const catBodyHtml = `
        <div class="breadcrumbs">
          <a href="${SITE_ORIGIN}/">Home</a> &rsaquo; <span>${escapeHtml(catDisplayName)} News</span>
        </div>

        <div style="margin-bottom: 24px;">
          <h1 style="margin-bottom: 8px;">${escapeHtml(catDisplayName)} News &amp; Latest Coverage</h1>
          <p class="dek">Explore authoritative, fact-verified journalism, policy dispatches, and in-depth investigative reports from NP News Metro's ${escapeHtml(catDisplayName)} desk.</p>
        </div>

        <div class="stories-grid">
          ${catArticles.map(a => {
            const artCat = a.categories?.slug || targetCat;
            const artTitle = a.title_hi || a.title;
            const artExcerpt = a.dek_hi || a.excerpt || a.title;
            const artDate = new Date(a.published_at || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
            const artAuthor = a.author_name || "Staff Journalist";

            return `
              <article class="story-card">
                <span class="meta" style="color: var(--primary);">${escapeHtml(catDisplayName)}</span>
                <h3><a href="${SITE_ORIGIN}/${artCat}/${escapeHtml(a.slug)}">${escapeHtml(artTitle)}</a></h3>
                <p>${escapeHtml(artExcerpt)}</p>
                <div class="meta">Published: ${artDate} &bull; By ${escapeHtml(artAuthor)}</div>
              </article>
            `;
          }).join("\n")}
        </div>

        <div style="margin-top: 36px; padding: 20px; background: #ffffff; border: 1px solid var(--border); border-radius: 4px;">
          <h3 style="font-family: Georgia, serif; font-size: 18px; margin-top: 0; color: var(--primary);">Editorial Standards for ${escapeHtml(catDisplayName)}</h3>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">Our correspondents and beat editors adhere strictly to on-ground factual verification, impartial sourcing, and statutory Press Council guidelines across all ${escapeHtml(catDisplayName)} coverage.</p>
        </div>
      `;

      const catJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${catDisplayName} News | NP News Metro`,
        "url": canonicalCatUrl,
        "description": `Latest breaking headlines, reports, and exclusive analysis in ${catDisplayName} from NP News Metro.`,
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": "NP News Metro",
          "url": SITE_ORIGIN,
          "logo": `${SITE_ORIGIN}/logo.png`
        },
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": catArticles.map((a, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `${SITE_ORIGIN}/${a.categories?.slug || targetCat}/${a.slug}`,
            "name": a.title
          }))
        }
      };

      const catHtml = buildCrawlerHtml({
        title: `${catDisplayName} News & Latest Analysis | NP News Metro`,
        description: `Latest breaking headlines, reports, and exclusive analysis in ${catDisplayName} from NP News Metro.`,
        canonicalUrl: canonicalCatUrl,
        ogType: "website",
        ogImage: catImage,
        jsonLd: catJsonLd,
        bodyHtml: catBodyHtml
      });

      shareWarmCache.set(catCacheKey, { html: catHtml, timestamp: Date.now() });
      return sendResponse(res, 200, "text/html; charset=utf-8", catHtml);
    }

    // 4. SINGLE VIDEO / ARTICLE PRE-RENDERER
    let mediaItem = null;
    const bypassCache = !!rawVersionParam || req.query?.fresh === "true" || url.searchParams.get("fresh") === "true";
    const articleCacheKey = `item:${cleanCategory}:${cleanSlug || rawSlugParam}:${rawVersionParam || "default"}`;

    if (!bypassCache) {
      const cachedItem = shareWarmCache.get(articleCacheKey);
      if (cachedItem && Date.now() - cachedItem.timestamp < SHARE_CACHE_TTL) {
        return sendResponse(res, 200, "text/html; charset=utf-8", cachedItem.html);
      }
    }

    if (cleanCategory === "videos" && cleanSlug) {
      try {
        const { data: vData } = await supabase
          .from("videos")
          .select("title, description, thumbnail_url, youtube_url, published_at, slug")
          .eq("slug", cleanSlug)
          .maybeSingle();

        if (vData) {
          mediaItem = {
            title: vData.title,
            dek: vData.description || vData.title,
            category: "videos",
            image: vData.thumbnail_url || DEFAULT_OG_IMAGE,
            slug: vData.slug || cleanSlug,
            type: "video.other",
            videoUrl: vData.youtube_url,
            publishedAt: vData.published_at || new Date().toISOString(),
            author: "NP News Metro Video Bureau",
            paragraphs: [vData.description || vData.title]
          };
        }
      } catch (e) {}

      if (!mediaItem) {
        const fbVideo = FALLBACK_VIDEOS.find(v => v.slug === cleanSlug);
        if (fbVideo) {
          mediaItem = {
            title: fbVideo.title,
            dek: fbVideo.description,
            category: "videos",
            image: fbVideo.thumbnailUrl,
            slug: cleanSlug,
            type: "video.other",
            videoUrl: fbVideo.videoUrl,
            publishedAt: fbVideo.publishedAt,
            author: "NP News Metro Video Bureau",
            paragraphs: [fbVideo.description]
          };
        }
      }
    }

    if (!mediaItem && cleanSlug) {
      try {
        const ARTICLE_FIELDS = `
          title, 
          title_hi,
          seo_title, 
          excerpt, 
          dek_hi,
          content,
          blocks,
          meta_description, 
          featured_image_url, 
          featured_image_caption,
          author_name,
          author_role,
          author_avatar,
          custom_author,
          published_at, 
          updated_at,
          slug,
          categories (slug)
        `;

        let { data } = await supabase
          .from("articles")
          .select(ARTICLE_FIELDS)
          .eq("slug", cleanSlug)
          .eq("status", "published")
          .maybeSingle();

        if (!data && rawSlugParam && rawSlugParam !== cleanSlug) {
          const { data: rawData } = await supabase
            .from("articles")
            .select(ARTICLE_FIELDS)
            .eq("slug", rawSlugParam)
            .eq("status", "published")
            .maybeSingle();
          if (rawData) data = rawData;
        }

        if (data) {
          const rawCat = data.categories;
          const resolvedCat = (Array.isArray(rawCat) ? rawCat[0]?.slug : rawCat?.slug) || cleanCategory;

          let bodyParagraphs = [];
          let rawBlocks = data.blocks;
          if (typeof rawBlocks === "string") {
            try { rawBlocks = JSON.parse(rawBlocks); } catch (e) {}
          }
          if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
            bodyParagraphs = rawBlocks
              .filter(b => b && (b.type === "paragraph" || b.type === "heading" || !b.type) && b.content)
              .map(b => String(b.content).trim())
              .filter(Boolean);
          }
          if (bodyParagraphs.length === 0 && typeof data.content === "string" && data.content.trim()) {
            bodyParagraphs = data.content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
          }
          if (bodyParagraphs.length === 0) {
            bodyParagraphs = [data.meta_description || data.excerpt || data.dek_hi || data.title].filter(Boolean);
          }

          const authorName = data.custom_author?.name || data.author_name || "NP News Metro Bureau";
          mediaItem = {
            title: data.seo_title || data.title_hi || data.title,
            dek: data.meta_description || data.dek_hi || data.excerpt || data.title,
            category: resolvedCat || "india",
            image: data.featured_image_url,
            caption: data.featured_image_caption || data.title,
            slug: data.slug || cleanSlug,
            publishedAt: data.published_at || new Date().toISOString(),
            modifiedAt: data.updated_at || data.published_at || new Date().toISOString(),
            author: authorName,
            authorRole: data.custom_author?.role || data.author_role || "Staff Journalist",
            paragraphs: bodyParagraphs,
            type: "article"
          };
        }
      } catch (e) {}

      if (!mediaItem) {
        const mockArticle = FALLBACK_ARTICLES.find(p => p.slug === cleanSlug);
        if (mockArticle) {
          mediaItem = {
            title: mockArticle.title,
            dek: mockArticle.caption || mockArticle.title,
            category: mockArticle.category,
            image: mockArticle.featuredImage,
            caption: mockArticle.caption || mockArticle.title,
            slug: cleanSlug,
            publishedAt: mockArticle.publishedAt || new Date().toISOString(),
            modifiedAt: mockArticle.publishedAt || new Date().toISOString(),
            author: "NP News Metro Bureau",
            authorRole: "Editorial Desk",
            paragraphs: [mockArticle.caption || mockArticle.title],
            type: "article"
          };
        }
      }

      if (!mediaItem && FALLBACK_SLUGS[cleanSlug]) {
        const f = FALLBACK_SLUGS[cleanSlug];
        mediaItem = {
          title: f.title,
          dek: f.dek,
          category: f.category,
          image: f.image,
          caption: f.title,
          slug: cleanSlug,
          publishedAt: f.publishedAt || new Date().toISOString(),
          modifiedAt: f.publishedAt || new Date().toISOString(),
          author: f.author || "NP News Metro Bureau",
          authorRole: "Editorial Desk",
          paragraphs: f.paragraphs || [f.dek],
          type: "article"
        };
      }
    }

    if (!mediaItem) {
      return sendResponse(res, 404, "text/html; charset=utf-8", `<!DOCTYPE html>
<html lang="hi">
<head><meta charset="UTF-8"><title>404 - पृष्ठ नहीं मिला | NP News Metro</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 60px 20px;">
  <h1 style="color: #990000;">404 — सामग्री नहीं मिली</h1>
  <p>यह पृष्ठ या समाचार लेख उपलब्ध नहीं है।</p>
  <p><a href="${SITE_ORIGIN}/" style="color: #990000; font-weight: bold;">मुख्य पृष्ठ पर वापस जाएं &rarr;</a></p>
</body>
</html>`);
    }

    const title = mediaItem.title;
    const category = mediaItem.category;
    const slug = mediaItem.slug;
    const description = mediaItem.dek || mediaItem.title;
    const imageVersion = mediaItem.modifiedAt ? `${new Date(mediaItem.modifiedAt).getTime()}_v3` : `${Date.now()}_v3`;
    let image = getAbsoluteUrl(mediaItem.image, slug);
    image = image.includes("?") ? `${image}&v=${imageVersion}` : `${image}?v=${imageVersion}`;
    const isVideo = category === "videos";
    const canonicalUrl = isVideo ? `${SITE_ORIGIN}/videos/${slug}` : `${SITE_ORIGIN}/${category}/${slug}`;
    const publishedIso = mediaItem.publishedAt;
    const modifiedIso = mediaItem.modifiedAt || publishedIso;
    const authorName = mediaItem.author || "NP News Metro Desk";
    const authorRole = mediaItem.authorRole || "Editorial";
    const paragraphs = mediaItem.paragraphs && mediaItem.paragraphs.length > 0 ? mediaItem.paragraphs : [description];

    const articleBodyHtml = `
      <div class="breadcrumbs">
        <a href="${SITE_ORIGIN}/">Home</a> &rsaquo; 
        <a href="${SITE_ORIGIN}/category/${category}">${escapeHtml(CATEGORY_NAMES[category] || category.toUpperCase())}</a> &rsaquo; 
        <span>Report</span>
      </div>

      <article>
        <h1 style="margin-top: 0;">${escapeHtml(title)}</h1>
        <p class="dek">${escapeHtml(description)}</p>
        <div class="byline">
          <strong>By ${escapeHtml(authorName)}</strong> &bull; ${escapeHtml(authorRole)} &bull; Published on ${new Date(publishedIso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </div>

        ${image ? `
          <img src="${image}" alt="${escapeHtml(title)}" class="featured-img" />
          <div class="caption">${escapeHtml(mediaItem.caption || title)} &bull; Credit: NP News Metro Photo Desk</div>
        ` : ""}

        <div class="article-body">
          ${paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("\n        ")}
        </div>

        <div style="margin: 36px 0 20px 0; text-align: center;">
          <a href="${SITE_ORIGIN}/${category}/${slug}" style="display: inline-block; background-color: var(--primary); color: #ffffff; padding: 12px 24px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">ताज़ा ख़बरें और पूरा डिजिटल संस्करण पढ़ें &rarr;</a>
        </div>
      </article>
    `;

    const shareUrl = rawVersionParam ? `${canonicalUrl}?v=${encodeURIComponent(rawVersionParam)}` : `${canonicalUrl}?v=${imageVersion}`;

    const structuredData = isVideo ? {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": title,
      "description": description,
      "thumbnailUrl": image,
      "uploadDate": publishedIso,
      "embedUrl": mediaItem.videoUrl || canonicalUrl,
      "publisher": { "@type": "Organization", "name": "NP News Metro", "logo": { "@type": "ImageObject", "url": `${SITE_ORIGIN}/logo.png` } }
    } : {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
      "headline": title,
      "description": description,
      "image": [image],
      "datePublished": publishedIso,
      "dateModified": modifiedIso,
      "author": { "@type": "Person", "name": authorName },
      "publisher": { "@type": "Organization", "name": "NP News Metro", "logo": { "@type": "ImageObject", "url": `${SITE_ORIGIN}/logo.png` } }
    };

    const articleHtml = buildCrawlerHtml({
      title,
      description,
      canonicalUrl,
      shareUrl,
      ogType: mediaItem.type || "article",
      ogImage: image,
      jsonLd: structuredData,
      bodyHtml: articleBodyHtml
    });

    shareWarmCache.set(articleCacheKey, { html: articleHtml, timestamp: Date.now() });
    return sendResponse(res, 200, "text/html; charset=utf-8", articleHtml);
  } catch (err) {
    console.error("Crawler share pre-renderer error:", err);
    return sendResponse(res, 500, "text/html; charset=utf-8", `<!DOCTYPE html><html><body><h1>Internal Server Error</h1></body></html>`);
  }
}
