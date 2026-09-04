import { SubscriberRepository } from '../repositories/supabase/SubscriberRepository';
import { SubscriberRecord } from '../repositories/types';

export const subscribeNewsletter = async (
  email: string,
  topics: string[] = ['daily_morning']
): Promise<{ success: boolean; error?: string }> => {
  // 1. Try serverless API
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, topics }),
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {}

  // 2. Repository fallback
  return SubscriberRepository.getInstance().subscribe(email, topics);
};

export const unsubscribeNewsletter = async (email: string): Promise<boolean> => {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        return true;
      }
    }
  } catch {}

  return SubscriberRepository.getInstance().unsubscribe(email);
};

export const getSubscribersList = async (
  statusFilter?: string,
  limit = 200
): Promise<SubscriberRecord[]> => {
  return SubscriberRepository.getInstance().getAllSubscribers(statusFilter, limit);
};

export const downloadSubscribersCsv = async (): Promise<void> => {
  const csv = await SubscriberRepository.getInstance().exportSubscribersCsv();
  if (typeof window === 'undefined') return;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `np-news-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
