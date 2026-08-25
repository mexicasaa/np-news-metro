import assert from 'assert';

const DEFAULT_SITE_ORIGIN = 'https://npnewsmetro.com';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200';

function getAbsoluteImageUrl(imageUrl, customOrigin) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return DEFAULT_OG_IMAGE;
  }
  const trimmed = imageUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }
  const origin = (customOrigin || DEFAULT_SITE_ORIGIN).replace(/\/+$/, '');
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
assert.strictEqual(rel1, 'https://npnewsmetro.com/uploads/dr-deepak-goswami.jpg');
console.log('✓ Test 1 Passed: Relative /uploads/ path resolved to absolute URL:', rel1);

const rel2 = getAbsoluteImageUrl('uploads/nayab-saini-patiala-teej.jpg');
assert.strictEqual(rel2, 'https://npnewsmetro.com/uploads/nayab-saini-patiala-teej.jpg');
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
assert.strictEqual(articleUrl, 'https://npnewsmetro.com/politics/nayab-saini-patiala-teej');
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
assert.strictEqual(shareLinks.absoluteImage, 'https://npnewsmetro.com/uploads/nayab-saini-patiala-teej.jpg');
console.log('✓ Test 6 Passed: Social share links properly formatted and encoded');

console.log('\n========================================');
console.log('ALL FEATURED IMAGE SHARING TESTS PASSED!');
console.log('========================================');
