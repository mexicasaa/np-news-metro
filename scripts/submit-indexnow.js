import { fetchLiveArticles, BASE_URL, DEFAULT_CATEGORIES } from '../api/_sitemapHelper.js';

const INDEXNOW_KEY = '968b4404627f469a8e29b9a607c4b1e7';
const INDEXNOW_HOST = 'www.npnewsmetro.com';
const INDEXNOW_KEY_LOCATION = 'https://www.npnewsmetro.com/968b4404627f469a8e29b9a607c4b1e7.txt';

async function main() {
  const args = process.argv.slice(2);
  let urlList = [];

  if (args.length > 0) {
    urlList = args.filter(a => a.startsWith('http'));
  }

  if (urlList.length === 0) {
    console.log('Fetching live articles for IndexNow submission...');
    const articles = await fetchLiveArticles();
    console.log(`Found ${articles.length} articles.`);

    const articleUrls = articles.map(a => `${BASE_URL}/${a.category}/${a.slug}`);
    const categoryUrls = DEFAULT_CATEGORIES.map(cat => `${BASE_URL}/category/${cat}`);

    urlList = [
      `${BASE_URL}/`,
      ...categoryUrls,
      ...articleUrls
    ];
  }

  urlList = Array.from(new Set(urlList));

  console.log(`Submitting ${urlList.length} URLs to IndexNow (api.indexnow.org)...`);
  console.log(`Key Location: ${INDEXNOW_KEY_LOCATION}`);

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urlList.slice(0, 10000)
  };

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const bodyText = await response.text();
    console.log(`Response Status: ${response.status} (${response.statusText})`);
    if (bodyText) {
      console.log(`Response Body: ${bodyText}`);
    }

    if (response.status === 200) {
      console.log('Success! (HTTP 200: URLs submitted and key validated)');
    } else if (response.status === 202) {
      console.log('Accepted! (HTTP 202: URLs received and key validation in progress)');
    } else if (response.status === 400) {
      console.error('Error: HTTP 400 Bad Request');
    } else if (response.status === 403) {
      console.error('Error: HTTP 403 Forbidden - Key not valid or key file not accessible yet on site');
    } else if (response.status === 422) {
      console.error('Error: HTTP 422 Unprocessable Entity - URLs do not belong to the host');
    } else {
      console.log(`IndexNow returned HTTP ${response.status}`);
    }
  } catch (err) {
    console.error('Failed to submit to IndexNow:', err);
    process.exit(1);
  }
}

main();
