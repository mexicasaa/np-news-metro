import assert from 'assert';

const DEFAULT_SITE_ORIGIN = 'https://www.npnewsmetro.com';
const DEFAULT_OG_IMAGE = 'https://www.npnewsmetro.com/uploads/dr-deepak-goswami.jpg';

function getAbsoluteImageUrl(imageUrl, customOrigin) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return DEFAULT_OG_IMAGE;
  }
  const trimmed = imageUrl.trim();
  const origin = (customOrigin || DEFAULT_SITE_ORIGIN).replace(/\/+$/, '');

  if (trimmed.includes('supabase.co/storage/v1/object/public/')) {
    const pathAfter = trimmed.split('/storage/v1/object/public/')[1];
    if (pathAfter) {
      return `${origin}/api/image/${pathAfter.replace(/^\/+/, '')}`;
    }
    return `${origin}/api/image?url=${encodeURIComponent(trimmed)}`;
  }
  if (trimmed.includes('supabase.co/storage/v1/render/image/public/')) {
    const pathAfter = trimmed.split('/storage/v1/render/image/public/')[1]?.split('?')[0];
    if (pathAfter) {
      return `${origin}/api/image/${pathAfter.replace(/^\/+/, '')}`;
    }
    return `${origin}/api/image?url=${encodeURIComponent(trimmed)}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${origin}${cleanPath}`;
}

function getCanonicalArticleUrl(category, slug, customOrigin) {
  const origin = (customOrigin || DEFAULT_SITE_ORIGIN).replace(/\/+$/, '');
  if (!slug) return origin;
  const cleanCategory = (category || 'india').toLowerCase().trim();
  return `${origin}/${cleanCategory}/${slug}`;
}

function generateSocialShareLinks({ title, url, imageUrl, summary }) {
  const absoluteImage = getAbsoluteImageUrl(imageUrl);
  const cleanTitle = title.trim();
  const cleanUrl = url.trim();
  const cleanSummary = summary ? summary.trim() : '';

  const whatsAppText = `${cleanTitle}\n\n${cleanSummary ? `${cleanSummary}\n\n` : ''}🔗 Read Full Story:\n${cleanUrl}`;
  const twitterText = `${cleanTitle} — via @NPNewsMetro`;
  const telegramText = `${cleanTitle}\n\n${cleanSummary ? `${cleanSummary}\n\n` : ''}`;
  const emailSubject = `${cleanTitle} | NP News Metro`;
  const emailBody = `${cleanTitle}\n\n${cleanSummary ? `${cleanSummary}\n\n` : ''}Read the complete story on NP News Metro:\n${cleanUrl}`;

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`,
    whatsappWeb: `https://web.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(cleanUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(cleanUrl)}&text=${encodeURIComponent(telegramText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
    googleNews: `https://news.google.com/search?q=${encodeURIComponent(cleanTitle + ' NP News Metro')}`,
    absoluteImage,
  };
}

console.log('--- Starting Featured Image & Share Verification Tests ---');

// Test 1: Relative image paths
const rel1 = getAbsoluteImageUrl('/uploads/dr-deepak-goswami.jpg');
assert.strictEqual(rel1, 'https://www.npnewsmetro.com/uploads/dr-deepak-goswami.jpg');
console.log('✓ Test 1 Passed: Relative /uploads/ path resolved to absolute URL:', rel1);

const rel2 = getAbsoluteImageUrl('uploads/nayab-saini-patiala-teej.jpg');
assert.strictEqual(rel2, 'https://www.npnewsmetro.com/uploads/nayab-saini-patiala-teej.jpg');
console.log('✓ Test 2 Passed: Relative uploads/ path resolved to absolute URL:', rel2);

// Test 2: External full URLs
const unsplash = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200';
const ext = getAbsoluteImageUrl(unsplash);
assert.strictEqual(ext, unsplash);
console.log('✓ Test 3 Passed: External URL preserved intact:', ext);

// Test 3: Fallback on undefined or empty string
const empty = getAbsoluteImageUrl('');
assert.strictEqual(empty, DEFAULT_OG_IMAGE);
console.log('✓ Test 4 Passed: Empty image falls back to default branded OG image:', empty);

// Test 4: Canonical article URL generator
const articleUrl = getCanonicalArticleUrl('politics', 'nayab-saini-patiala-teej');
assert.strictEqual(articleUrl, 'https://www.npnewsmetro.com/politics/nayab-saini-patiala-teej');
console.log('✓ Test 5 Passed: Canonical URL correctly generated:', articleUrl);

// Test 5: Social Share link generator
const shareLinks = generateSocialShareLinks({
  title: 'Haryana CM Nayab Saini Celebrates Teej in Patiala',
  url: articleUrl,
  imageUrl: '/uploads/nayab-saini-patiala-teej.jpg',
  summary: 'CM brings festive Kothli gifts celebrating cultural heritage.',
  category: 'politics'
});

assert.ok(shareLinks.whatsapp.includes('whatsapp.com'));
assert.ok(shareLinks.whatsapp.includes(encodeURIComponent(articleUrl)));
assert.ok(shareLinks.twitter.includes('twitter.com'));
assert.ok(shareLinks.facebook.includes('facebook.com'));
assert.ok(shareLinks.telegram.includes('t.me'));
assert.ok(shareLinks.linkedin.includes('linkedin.com'));
assert.strictEqual(shareLinks.absoluteImage, 'https://www.npnewsmetro.com/uploads/nayab-saini-patiala-teej.jpg');
console.log('✓ Test 6 Passed: Social share links properly formatted and encoded');

// Test 7: Article 1 - Ananta Bandhana image URL conversion
const sup1 = 'https://jkzrjqclgqpfjdqxsnut.supabase.co/storage/v1/object/public/article-images/articles/general/1005537465-mtbur5bp.jpg';
const clean1 = getAbsoluteImageUrl(sup1);
assert.strictEqual(clean1, 'https://www.npnewsmetro.com/api/image/article-images/articles/general/1005537465-mtbur5bp.jpg');
console.log('✓ Test 7 Passed: Article 1 Supabase URL cleanly routed to /api/image/ path:', clean1);

// Test 8: Article 2 - Himaalaya Royaa image URL conversion
const sup2 = 'https://jkzrjqclgqpfjdqxsnut.supabase.co/storage/v1/object/public/article-images/articles/4524b399-18ca-4e9e-8c00-40055f45d5b4/1005537397-mtbu880l-mtbvs0et.jpg';
const clean2 = getAbsoluteImageUrl(sup2);
assert.strictEqual(clean2, 'https://www.npnewsmetro.com/api/image/article-images/articles/4524b399-18ca-4e9e-8c00-40055f45d5b4/1005537397-mtbu880l-mtbvs0et.jpg');
console.log('✓ Test 8 Passed: Article 2 Supabase URL cleanly routed to /api/image/ path:', clean2);

// Test 9: Verify image proxy serves transformed image < 300KB (WhatsApp requirement)
import('../api/image.js').then(async (mod) => {
  const handler = mod.default;
  let headers = {};
  let bodyBuffer = null;
  const mockRes = {
    statusCode: 200,
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    status: (code) => { mockRes.statusCode = code; return mockRes; },
    send: (b) => { bodyBuffer = b; },
    end: (b) => { if (b) bodyBuffer = b; }
  };
  await handler({ url: '/api/image?path=article-images/articles/general/1005537465-mtbur5bp.jpg', query: { path: 'article-images/articles/general/1005537465-mtbur5bp.jpg' } }, mockRes);
  assert.strictEqual(mockRes.statusCode, 200, 'Image handler should return 200');
  assert.strictEqual(headers['content-type'], 'image/jpeg', 'Content-Type must be image/jpeg');
  assert.ok(bodyBuffer && bodyBuffer.length < 300 * 1024, `Image must be under 300KB for WhatsApp, got: ${bodyBuffer?.length} bytes`);
  console.log(`✓ Test 9 Passed: Image handler served transformed image at ${bodyBuffer.length} bytes (< 300KB limit for WhatsApp)`);

  console.log('\n========================================');
  console.log('ALL FEATURED IMAGE SHARING TESTS PASSED!');
  console.log('========================================');
}).catch(e => {
  console.error('Test 9 error:', e);
  process.exit(1);
});
