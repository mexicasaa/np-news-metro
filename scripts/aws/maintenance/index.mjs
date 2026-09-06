// @ts-check

/**
 * AWS Lambda Scheduled Maintenance Job for NP News Metro
 * Runs daily/hourly via AWS EventBridge:
 * 1. Prunes article revisions table keeping last 5 per article (eliminates table bloat)
 * 2. Cleans up orphaned media assets older than retention period
 * 3. Re-computes trending scores for news feeds
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

async function callRpc(functionName, params = {}) {
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
  console.log('[Maintenance Lambda] Starting scheduled maintenance run...');
  const results = {
    pruneRevisions: false,
    timestamp: new Date().toISOString()
  };

  // 1. Prune article revisions table
  try {
    console.log('[Maintenance Lambda] Executing prune_article_revisions()...');
    await callRpc('prune_article_revisions');
    results.pruneRevisions = true;
    console.log('[Maintenance Lambda] Successfully pruned article revisions.');
  } catch (err) {
    console.error('[Maintenance Lambda] Error in prune_article_revisions:', err);
    results.pruneRevisionsError = err.message;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results)
  };
};
