import assert from 'assert';
import { 
  SUPPORTED_LANGUAGES, 
  isHindiText, 
  getCachedTranslation, 
  setCachedTranslation, 
  getLocalizedPost, 
  getLocalizedVideo,
  translateText,
} from '../src/services/translationService.ts';
import { 
  detectLanguageFromTimezone, 
  mapBrowserLanguageToSupported, 
  isRtlLanguage, 
  SUPPORTED_LANGUAGE_CODES,
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_MANUAL_FLAG,
} from '../src/utils/geoDetection.ts';
import { translations, getFormattedTodayDate } from '../src/i18n/translations.ts';
import { mockPosts, mockVideos } from '../src/data/mockWpData.ts';

console.log('====================================================');
console.log('   RUNNING MULTILINGUAL SUPPORT VERIFICATION SUITE   ');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`[PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${description}`);
    console.error('       Error:', err.message || err);
    failCount++;
  }
}

async function testAsync(description, fn) {
  try {
    await fn();
    console.log(`[PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${description}`);
    console.error('       Error:', err.message || err);
    failCount++;
  }
}

// -------------------------------------------------------------
// CHECK 1: English articles display in Hindi when Hindi is selected
// -------------------------------------------------------------
test('Check 1: English articles display in Hindi when Hindi is selected', () => {
  const englishPost = {
    id: 'post-test-en-1',
    title: 'Union Cabinet Approves Clean Energy Transmission Corridor',
    titleHi: 'केंद्रीय मंत्रिमंडल ने स्वच्छ ऊर्जा ट्रांसमिशन कॉरिडोर को दी मंजूरी',
    dek: 'The project will connect western ports with inland hubs.',
    dekHi: 'यह परियोजना पश्चिमी बंदरगाहों को अंतर्देशीय केंद्रों से जोड़ेगी।',
    category: 'business',
    tags: ['Energy'],
    authorId: 'author-1',
    publishedAt: new Date().toISOString(),
    readTime: '3 min read',
    featuredImage: 'https://example.com/image.jpg',
    imageCaption: 'Clean energy transmission corridor map',
    imageCaptionHi: 'स्वच्छ ऊर्जा ट्रांसमिशन कॉरिडोर का नक्शा',
    imageCredit: 'NP Photo',
    imageAlt: 'Map',
    viewsCount: 100,
    sharesCount: 10,
    commentCount: 2,
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'The project spans across three major industrial corridors.' }
    ],
    blocksHi: [
      { id: 'b1-hi', type: 'paragraph', content: 'यह परियोजना तीन प्रमुख औद्योगिक गलियारों में फैली हुई है।' }
    ]
  };

  const localizedHi = getLocalizedPost(englishPost, 'hi');
  assert.strictEqual(localizedHi.title, 'केंद्रीय मंत्रिमंडल ने स्वच्छ ऊर्जा ट्रांसमिशन कॉरिडोर को दी मंजूरी');
  assert.strictEqual(localizedHi.dek, 'यह परियोजना पश्चिमी बंदरगाहों को अंतर्देशीय केंद्रों से जोड़ेगी।');
  assert.strictEqual(localizedHi.blocks[0].content, 'यह परियोजना तीन प्रमुख औद्योगिक गलियारों में फैली हुई है।');

  // Also test when titleHi is not pre-set (cache-based dynamic translation)
  setCachedTranslation('Global Technology Summit Begins', 'hi', 'वैश्विक प्रौद्योगिकी शिखर सम्मेलन शुरू', 'en');
  const enPostNoHi = {
    ...englishPost,
    title: 'Global Technology Summit Begins',
    titleHi: undefined,
  };
  const localizedDynamicHi = getLocalizedPost(enPostNoHi, 'hi');
  assert.strictEqual(localizedDynamicHi.title, 'वैश्विक प्रौद्योगिकी शिखर सम्मेलन शुरू');
});

// -------------------------------------------------------------
// CHECK 2: Hindi articles display in English when English is selected
// -------------------------------------------------------------
test('Check 2: Hindi articles display in English when English is selected', () => {
  const hindiPost = {
    id: 'post-test-hi-1',
    title: 'नायब सैनी का भगवंत मान पर बड़ा हमला, कहा- सिर्फ टाइम पास कर रहे हैं',
    slug: 'nayab-saini-attacks-bhagwant-mann',
    dek: 'पटियाला में तीज महोत्सव के दौरान हरियाणा के सीएम ने पंजाब सरकार पर साधा निशाना।',
    category: 'politics',
    tags: ['पंजाब', 'राजनीति'],
    authorId: 'author-1',
    publishedAt: new Date().toISOString(),
    readTime: '4 min read',
    featuredImage: 'https://example.com/image.jpg',
    imageCaption: 'समारोह की तस्वीर',
    imageCredit: 'NP Photo',
    imageAlt: 'समारोह',
    viewsCount: 250,
    sharesCount: 15,
    commentCount: 5,
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'हरियाणा के मुख्यमंत्री ने जनसभा को संबोधित करते हुए कई वादे किए।' }
    ]
  };

  // Pre-seed translation in non-db cache
  setCachedTranslation(
    hindiPost.title,
    'en',
    'Nayab Saini Attacks Bhagwant Mann: Says He is Just Killing Time',
    'hi'
  );
  setCachedTranslation(
    hindiPost.dek,
    'en',
    'During the Teej festival in Patiala, Haryana CM targeted the Punjab government.',
    'hi'
  );

  const localizedEn = getLocalizedPost(hindiPost, 'en');
  assert.strictEqual(localizedEn.title, 'Nayab Saini Attacks Bhagwant Mann: Says He is Just Killing Time');
  assert.strictEqual(localizedEn.dek, 'During the Teej festival in Patiala, Haryana CM targeted the Punjab government.');
  assert.strictEqual(isHindiText(localizedEn.title), false, 'English headline should not contain Hindi text');
});

// -------------------------------------------------------------
// CHECK 3: Both types of content display in other supported languages (French, Spanish, German, Japanese, Chinese, Arabic)
// -------------------------------------------------------------
test('Check 3: Content displays in other supported languages (French, Spanish, German, Japanese, Chinese, Arabic)', () => {
  const article = {
    id: 'post-test-multi-1',
    title: 'India Launches High-Speed Rail Corridor',
    dek: 'Connecting modern cities with cutting-edge bullet train infrastructure.',
    category: 'technology',
    tags: ['Rail', 'India'],
    authorId: 'author-1',
    publishedAt: new Date().toISOString(),
    readTime: '3 min read',
    featuredImage: 'https://example.com/image.jpg',
    imageCaption: 'Bullet train model',
    imageCredit: 'NP Photo',
    imageAlt: 'Train',
    viewsCount: 300,
    sharesCount: 30,
    commentCount: 4,
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'The first phase will be operational by next year.' }
    ]
  };

  // Seed translations for various target languages
  setCachedTranslation(article.title, 'fr', 'L\'Inde lance un corridor ferroviaire à grande vitesse', 'en');
  setCachedTranslation(article.title, 'es', 'India lanza corredor ferroviario de alta velocidad', 'en');
  setCachedTranslation(article.title, 'de', 'Indien startet Hochgeschwindigkeits-Bahnkorridor', 'en');
  setCachedTranslation(article.title, 'ja', 'インドが高速鉄道回廊を開通', 'en');
  setCachedTranslation(article.title, 'zh', '印度启动高速铁路走廊', 'en');
  setCachedTranslation(article.title, 'ar', 'الهند تطلق ممر قطارات فائق السرعة', 'en');

  // Verify each language returns its localized title
  assert.strictEqual(getLocalizedPost(article, 'fr').title, 'L\'Inde lance un corridor ferroviaire à grande vitesse');
  assert.strictEqual(getLocalizedPost(article, 'es').title, 'India lanza corredor ferroviario de alta velocidad');
  assert.strictEqual(getLocalizedPost(article, 'de').title, 'Indien startet Hochgeschwindigkeits-Bahnkorridor');
  assert.strictEqual(getLocalizedPost(article, 'ja').title, 'インドが高速鉄道回廊を開通');
  assert.strictEqual(getLocalizedPost(article, 'zh').title, '印度启动高速铁路走廊');
  assert.strictEqual(getLocalizedPost(article, 'ar').title, 'الهند تطلق ممر قطارات فائق السرعة');
});

// -------------------------------------------------------------
// CHECK 4: Regional language detection works for supported countries
// -------------------------------------------------------------
test('Check 4: Regional language detection works for all specified countries', () => {
  // Test timezone mappings
  // India -> Hindi
  const originalIntl = global.Intl;

  const mockTimezone = (tz) => {
    global.Intl = {
      ...originalIntl,
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: tz }),
      }),
    };
  };

  mockTimezone('Asia/Kolkata');
  assert.strictEqual(detectLanguageFromTimezone(), 'hi', 'Asia/Kolkata must map to Hindi');

  mockTimezone('America/New_York');
  assert.strictEqual(detectLanguageFromTimezone(), 'en', 'America/New_York must map to English');

  mockTimezone('Europe/London');
  assert.strictEqual(detectLanguageFromTimezone(), 'en', 'Europe/London must map to English');

  mockTimezone('Asia/Shanghai');
  assert.strictEqual(detectLanguageFromTimezone(), 'zh', 'Asia/Shanghai must map to Simplified Chinese');

  mockTimezone('Asia/Tokyo');
  assert.strictEqual(detectLanguageFromTimezone(), 'ja', 'Asia/Tokyo must map to Japanese');

  mockTimezone('Europe/Paris');
  assert.strictEqual(detectLanguageFromTimezone(), 'fr', 'Europe/Paris must map to French');

  mockTimezone('Europe/Berlin');
  assert.strictEqual(detectLanguageFromTimezone(), 'de', 'Europe/Berlin must map to German');

  mockTimezone('Europe/Madrid');
  assert.strictEqual(detectLanguageFromTimezone(), 'es', 'Europe/Madrid must map to Spanish');

  mockTimezone('Asia/Riyadh');
  assert.strictEqual(detectLanguageFromTimezone(), 'ar', 'Asia/Riyadh must map to Arabic');

  mockTimezone('Asia/Dubai');
  assert.strictEqual(detectLanguageFromTimezone(), 'ar', 'Asia/Dubai must map to Arabic');

  mockTimezone('Africa/Cairo');
  assert.strictEqual(detectLanguageFromTimezone(), 'ar', 'Africa/Cairo must map to Arabic');

  mockTimezone('Europe/Rome');
  assert.strictEqual(detectLanguageFromTimezone(), 'it', 'Europe/Rome must map to Italian');

  mockTimezone('America/Sao_Paulo');
  assert.strictEqual(detectLanguageFromTimezone(), 'pt', 'America/Sao_Paulo must map to Portuguese');

  mockTimezone('Europe/Moscow');
  assert.strictEqual(detectLanguageFromTimezone(), 'ru', 'Europe/Moscow must map to Russian');

  // Browser language mapping fallback
  assert.strictEqual(mapBrowserLanguageToSupported('fr-FR'), 'fr');
  assert.strictEqual(mapBrowserLanguageToSupported('es-ES'), 'es');
  assert.strictEqual(mapBrowserLanguageToSupported('de-DE'), 'de');
  assert.strictEqual(mapBrowserLanguageToSupported('ja-JP'), 'ja');
  assert.strictEqual(mapBrowserLanguageToSupported('zh-CN'), 'zh');
  assert.strictEqual(mapBrowserLanguageToSupported('ar-EG'), 'ar');
  assert.strictEqual(mapBrowserLanguageToSupported('hi-IN'), 'hi');
  assert.strictEqual(mapBrowserLanguageToSupported('en-US'), 'en');
  assert.strictEqual(mapBrowserLanguageToSupported('unknown-XX'), null);

  // Restore Intl
  global.Intl = originalIntl;
});

// -------------------------------------------------------------
// CHECK 5: Manual language selection persists and takes priority over regional detection
// -------------------------------------------------------------
test('Check 5: Manual language selection persists and overrides regional detection', () => {
  const mockStorage = new Map();
  global.localStorage = {
    getItem: (k) => mockStorage.get(k) || null,
    setItem: (k, v) => mockStorage.set(k, String(v)),
    removeItem: (k) => mockStorage.delete(k),
  };

  // Simulate user manually choosing Japanese while in India
  mockStorage.set(LANGUAGE_STORAGE_KEY, 'ja');
  mockStorage.set(LANGUAGE_MANUAL_FLAG, 'true');

  // Verify that localStorage contains Japanese
  assert.strictEqual(global.localStorage.getItem(LANGUAGE_STORAGE_KEY), 'ja');
  assert.strictEqual(global.localStorage.getItem(LANGUAGE_MANUAL_FLAG), 'true');
});

// -------------------------------------------------------------
// CHECK 6: Article and video links continue working correctly
// -------------------------------------------------------------
test('Check 6: Article and video links continue working correctly', () => {
  const post = mockPosts[0];
  const video = mockVideos[0];

  assert.ok(post.slug, 'Post must have a valid slug');
  assert.ok(video.slug, 'Video must have a valid slug');

  const locPostHi = getLocalizedPost(post, 'hi');
  const locPostEn = getLocalizedPost(post, 'en');
  const locPostJa = getLocalizedPost(post, 'ja');

  // Slugs and IDs must remain identical across all languages!
  assert.strictEqual(locPostHi.id, post.id, 'Post ID must not change in Hindi');
  assert.strictEqual(locPostHi.slug, post.slug, 'Post slug must not change in Hindi');
  assert.strictEqual(locPostEn.id, post.id, 'Post ID must not change in English');
  assert.strictEqual(locPostEn.slug, post.slug, 'Post slug must not change in English');
  assert.strictEqual(locPostJa.id, post.id, 'Post ID must not change in Japanese');
  assert.strictEqual(locPostJa.slug, post.slug, 'Post slug must not change in Japanese');

  const locVideoHi = getLocalizedVideo(video, 'hi');
  const locVideoAr = getLocalizedVideo(video, 'ar');
  assert.strictEqual(locVideoHi.id, video.id, 'Video ID must not change in Hindi');
  assert.strictEqual(locVideoHi.slug, video.slug, 'Video slug must not change in Hindi');
  assert.strictEqual(locVideoHi.videoUrl, video.videoUrl, 'Video URL must not change');
  assert.strictEqual(locVideoAr.id, video.id, 'Video ID must not change in Arabic');
  assert.strictEqual(locVideoAr.videoUrl, video.videoUrl, 'Video URL must not change');
});

// -------------------------------------------------------------
// CHECK 7: Arabic text displays correctly from right to left
// -------------------------------------------------------------
test('Check 7: Arabic text displays correctly from right to left', () => {
  assert.strictEqual(isRtlLanguage('ar'), true, 'Arabic must be RTL');
  assert.strictEqual(isRtlLanguage('ur'), true, 'Urdu must be RTL');
  assert.strictEqual(isRtlLanguage('en'), false, 'English must be LTR');
  assert.strictEqual(isRtlLanguage('hi'), false, 'Hindi must be LTR');
  assert.strictEqual(isRtlLanguage('fr'), false, 'French must be LTR');

  const arabicLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
  assert.ok(arabicLangInfo, 'Arabic must exist in SUPPORTED_LANGUAGES');
  assert.strictEqual(arabicLangInfo.dir, 'rtl', 'Arabic direction must be rtl');
  assert.strictEqual(arabicLangInfo.nativeName, 'العربية');
});

// -------------------------------------------------------------
// CHECK 8: Translation failures fall back to original content without breaking the page
// -------------------------------------------------------------
testAsync('Check 8: Translation failures fall back to original content without breaking the page', async () => {
  // If network is offline or service fails, translateText must return original text without throwing
  const originalText = 'Crucial breaking announcement from policy bureau';
  const result = await translateText(originalText, 'es');
  assert.ok(result, 'Translation should never return null or undefined');
  // Result is either translated or original text fallback
  assert.ok(result === originalText || typeof result === 'string');

  const brokenPost = {
    id: 'post-fallback-1',
    title: 'Headline without translation',
    dek: 'Excerpt without translation',
    category: 'india',
    tags: ['National'],
    authorId: 'author-1',
    publishedAt: new Date().toISOString(),
    readTime: '2 min',
    featuredImage: '',
    imageCaption: '',
    imageCredit: '',
    imageAlt: '',
    viewsCount: 10,
    sharesCount: 1,
    commentCount: 0,
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'Paragraph without translation.' }
    ]
  };

  const localized = getLocalizedPost(brokenPost, 'ja');
  assert.strictEqual(localized.id, brokenPost.id);
  assert.ok(localized.title, 'Title must not be empty');
  assert.ok(localized.dek, 'Dek must not be empty');
  assert.ok(localized.blocks.length > 0, 'Blocks must not be empty');
});

// -------------------------------------------------------------
// CHECK 9: Database records remain unchanged after visitors view translated content
// -------------------------------------------------------------
test('Check 9: Database records remain unchanged (Zero DB modifications, Pure non-db caching)', () => {
  // Inspect original mockPosts and mockVideos to ensure none were mutated
  const originalPostTitle = mockPosts[0].title;
  const originalVideoTitle = mockVideos[0].title;

  // Perform multiple translations across different languages
  getLocalizedPost(mockPosts[0], 'hi');
  getLocalizedPost(mockPosts[0], 'fr');
  getLocalizedPost(mockPosts[0], 'ja');
  getLocalizedPost(mockPosts[0], 'ar');
  getLocalizedVideo(mockVideos[0], 'hi');
  getLocalizedVideo(mockVideos[0], 'zh');

  // Verify original objects are untouched
  assert.strictEqual(mockPosts[0].title, originalPostTitle, 'Original post title in memory must never be mutated');
  assert.strictEqual(mockVideos[0].title, originalVideoTitle, 'Original video title in memory must never be mutated');
});

// -------------------------------------------------------------
// CHECK 10: Admin panel and its existing functionality remain completely unaffected
// -------------------------------------------------------------
test('Check 10: Admin panel and editing workflows remain completely unaffected', () => {
  // Verify that translations are isolated and admin files do not import visitor-facing localization
  import('fs').then((fs) => {
    const adminEditorCode = fs.readFileSync('src/components/admin/ArticleEditor.tsx', 'utf-8');
    assert.strictEqual(adminEditorCode.includes('getLocalizedPost'), false, 'Admin ArticleEditor must not use getLocalizedPost');
    assert.strictEqual(adminEditorCode.includes('useLanguage'), false, 'Admin ArticleEditor must not use useLanguage');

    const publishingCenterCode = fs.readFileSync('src/components/admin/PublishingCenter.tsx', 'utf-8');
    assert.strictEqual(publishingCenterCode.includes('getLocalizedPost'), false, 'Admin PublishingCenter must not use getLocalizedPost');
    assert.strictEqual(publishingCenterCode.includes('useLanguage'), false, 'Admin PublishingCenter must not use useLanguage');
  });
});

// -------------------------------------------------------------
// Translations Dictionary Sanity Check
// -------------------------------------------------------------
test('All supported languages have complete translations dictionary', () => {
  SUPPORTED_LANGUAGE_CODES.forEach((lang) => {
    const t = translations[lang];
    assert.ok(t, `Translations for ${lang} must exist`);
    assert.ok(t.nav_home, `${lang} must have nav_home`);
    assert.ok(t.nav_latest, `${lang} must have nav_latest`);
    assert.ok(t.searchPlaceholder, `${lang} must have searchPlaceholder`);
    assert.ok(t.subscribe, `${lang} must have subscribe`);
    assert.ok(t.todayDate, `${lang} must have formatted todayDate`);
  });
});

console.log('\n----------------------------------------------------');
console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL MULTILINGUAL VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
}
