// @ts-check

/**
 * AWS Lambda SQS consumer for NP News Metro telemetry
 * Consumes batched page views, shares, likes, and ad impressions/clicks from SQS
 * and aggregates them into Supabase metrics tables in bulk.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

async function callRpc(functionName, params) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/${functionName}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`RPC ${functionName} failed: ${response.status} ${text}`);
  }
}

export const handler = async (event) => {
  console.log(`[Telemetry Lambda] Processing ${event.Records?.length || 0} records from SQS`);
  
  if (!event.Records || event.Records.length === 0) {
    return { statusCode: 200, body: 'No records to process' };
  }

  const today = new Date().toISOString().split('T')[0];

  // Aggregation buckets
  // articleId -> { views, shares, likes, comments }
  const articleAggregates = new Map();

  // campaignId:placementId -> { impressions, clicks }
  const adAggregates = new Map();

  for (const record of event.Records) {
    try {
      const payload = typeof record.body === 'string' ? JSON.parse(record.body) : (record.body || {});
      const { type, articleId, campaignId, placementId } = payload;

      if (articleId) {
        if (!articleAggregates.has(articleId)) {
          articleAggregates.set(articleId, { views: 0, shares: 0, likes: 0, comments: 0 });
        }
        const stats = articleAggregates.get(articleId);
        if (type === 'view') stats.views += 1;
        else if (type === 'share') stats.shares += 1;
        else if (type === 'like') stats.likes += 1;
        else if (type === 'comment') stats.comments += 1;
      }

      if (campaignId) {
        const key = `${campaignId}:${placementId || 'default'}`;
        if (!adAggregates.has(key)) {
          adAggregates.set(key, { campaignId, placementId: placementId || null, impressions: 0, clicks: 0 });
        }
        const stats = adAggregates.get(key);
        if (type === 'click') stats.clicks += 1;
        else stats.impressions += 1; // Default to impression
      }
    } catch (parseErr) {
      console.warn('[Telemetry Lambda] Failed to parse SQS record body:', parseErr);
    }
  }

  console.log(`[Telemetry Lambda] Aggregated metrics for ${articleAggregates.size} articles and ${adAggregates.size} ads.`);

  // Flush article metrics to Supabase
  for (const [articleId, stats] of articleAggregates.entries()) {
    try {
      await callRpc('increment_article_metric', {
        p_article_id: articleId,
        p_date: today,
        p_views: stats.views,
        p_likes: stats.likes,
        p_shares: stats.shares,
        p_comments: stats.comments
      });
    } catch (err) {
      console.error(`[Telemetry Lambda] Error updating article ${articleId}:`, err);
    }
  }

  // Flush ad metrics to Supabase
  for (const stats of adAggregates.values()) {
    try {
      await callRpc('increment_ad_metric', {
        p_campaign_id: stats.campaignId,
        p_placement_id: stats.placementId,
        p_date: today,
        p_impressions: stats.impressions,
        p_clicks: stats.clicks
      });
    } catch (err) {
      console.error(`[Telemetry Lambda] Error updating ad ${stats.campaignId}:`, err);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      processedArticles: articleAggregates.size,
      processedAds: adAggregates.size
    })
  };
};
