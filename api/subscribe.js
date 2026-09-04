// @ts-nocheck
import './_suppressWarnings.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  const method = req.method;

  if (method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = (body.email || '').trim().toLowerCase();
    const topics = Array.isArray(body.topics) ? body.topics : ['daily_morning'];

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' });
    }

    try {
      // Upsert subscriber
      let subscriberId;
      const { data: existing } = await supabase
        .from('subscribers')
        .select('id, status')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        subscriberId = existing.id;
        if (existing.status === 'unsubscribed') {
          await supabase
            .from('subscribers')
            .update({ status: 'confirmed', confirmed_at: new Date().toISOString(), unsubscribed_at: null })
            .eq('id', subscriberId);
        }
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('subscribers')
          .insert({
            email,
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (insertError) {
          return res.status(500).json({ error: insertError.message });
        }
        subscriberId = inserted.id;
      }

      // Upsert preferences
      if (topics.length > 0) {
        const prefs = topics.map((t) => ({
          subscriber_id: subscriberId,
          topic: t,
          enabled: true,
        }));
        await supabase.from('subscriber_preferences').upsert(prefs, { onConflict: 'subscriber_id,topic' });
      }

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ success: true, email, subscriberId });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'DELETE') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    try {
      await supabase
        .from('subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
        .eq('email', email);

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ success: true, unsubscribed: email });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
