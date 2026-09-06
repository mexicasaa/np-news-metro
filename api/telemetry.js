// @ts-nocheck
import './_suppressWarnings.js';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const SQS_QUEUE_URL = process.env.AWS_SQS_TELEMETRY_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/721563685765/np-news-telemetry';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Reuse SQS client across warm serverless invocations
let sqsClient = null;
function getSqsClient() {
  if (!sqsClient) {
    const config = { region: AWS_REGION };
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
    console.warn('[Telemetry] SQS enqueue failed:', err.message);
    // Never let client telemetry errors degrade user experience
    res.setHeader('Cache-Control', 'no-store');
    return res.status(202).json({ success: true, fallback: true });
  }
}
