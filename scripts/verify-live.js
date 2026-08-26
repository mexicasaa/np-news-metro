import https from 'https';

async function checkLiveUrl() {
  const url = 'https://www.npnewsmetro.com/india/aatha-dashaka-kee-prateekshaa-ke-baada-vaishvika-shikhara-para-st';
  
  console.log('--- Fetching as WhatsApp Bot ---');
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WhatsApp/2.21.12.21 i' }
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  
  const ogTitle = text.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
  const ogImage = text.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  const twitterImg = text.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1];
  
  console.log('og:title:', ogTitle);
  console.log('og:image:', ogImage);
  console.log('twitter:image:', twitterImg);
}
checkLiveUrl();
