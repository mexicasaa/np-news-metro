// @ts-nocheck
import './_suppressWarnings.js';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { createClient } from '@supabase/supabase-js';

const SQS_QUEUE_URL = process.env.AWS_SQS_TELEMETRY_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/721563685765/np-news-telemetry';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

// In Vercel serverless, AWS_ACCESS_KEY_ID can be reserved by Vercel's internal Lambda execution role.
// We support custom prefixes (APP_AWS_ACCESS_KEY_ID or SQS_ACCESS_KEY_ID) as well as standard names.
let sqsClient = null;
function getSqsClient() {
  if (!sqsClient) {
    const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID || process.env.SQS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.SQS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

    const config = { region: AWS_REGION };
    if (accessKeyId && secretAccessKey) {
      config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }
    sqsClient = new SQSClient(config);
  }
  return sqsClient;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  } else {
    body = req.body || {};
  }

  const { type, articleId, campaignId, placementId } = body;

  if (!type || (!articleId && !campaignId)) {
    return res.status(400).json({ error: 'Valid metric type and target ID required' });
  }

  try {
    const client = getSqsClient();
    await client.send(
      new SendMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MessageBody: JSON.stringify({
          type,
          articleId: articleId || null,
          campaignId: campaignId || null,
          placementId: placementId || null,
          timestamp: Date.now(),
        }),
      })
    );

    res.setHeader('Cache-Control', 'no-store');
    return res.status(202).json({ success: true, queued: true });
  } catch (err) {
    console.warn('[Telemetry] SQS enqueue fallback:', err.message);

    // Resilient Fallback (Rule 35): Record directly to Supabase daily aggregate if SQS is offline/unauthenticated
    try {
      const today = new Date().toISOString().split('T')[0];
      if (articleId) {
        await supabase.rpc('increment_article_metric', {
          p_article_id: articleId,
          p_date: today,
          p_views: type === 'view' ? 1 : 0,
          p_shares: type === 'share' ? 1 : 0,
          p_likes: 0,
          p_comments: 0,
        });
      } else if (campaignId) {
        await supabase.rpc('increment_ad_metric', {
          p_campaign_id: campaignId,
          p_placement_id: placementId || null,
          p_date: today,
          p_impressions: type === 'click' ? 0 : 1,
          p_clicks: type === 'click' ? 1 : 0,
        });
      }
    } catch (dbErr) {
      console.warn('[Telemetry] DB fallback recording warning:', dbErr.message);
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(202).json({ success: true, fallback: true, recorded: true });
  }
}
