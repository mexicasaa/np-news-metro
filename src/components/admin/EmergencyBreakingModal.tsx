import React, { useState } from 'react';
import { 
  Flame, Zap, AlertTriangle, CheckCircle2, X, ArrowRight, 
  ShieldCheck, Globe, RefreshCw, Send
} from 'lucide-react';
import { mockCategories, mockAuthors } from '../../data/mockWpData';

interface EmergencyBreakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishBreaking: (data: {
    headline: string;
    summary: string;
    category: string;
    authorId: string;
    activateBreakingStrip: boolean;
    pinAsHeroLead: boolean;
  }) => void;
}

export const EmergencyBreakingModal: React.FC<EmergencyBreakingModalProps> = ({
  isOpen,
  onClose,
  onPublishBreaking,
}) => {
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('politics');
  const [authorId, setAuthorId] = useState('author-1');
  const [activateBreakingStrip, setActivateBreakingStrip] = useState(true);
  const [pinAsHeroLead, setPinAsHeroLead] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onPublishBreaking({
        headline,
        summary,
        category,
        authorId,
        activateBreakingStrip,
        pinAsHeroLead,
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-surface-lowest border-2 border-editorial-red rounded-md shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header with High-Urgency Red Branding */}
        <div className="p-4 sm:p-5 bg-editorial-red text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-white/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <h2 className="font-serif font-black text-lg tracking-wide">
                  Emergency Breaking News Flow
                </h2>
              </div>
              <p className="text-[11px] text-white/80 font-sans mt-0.5">
                Minimal fields for 60-second live publishing to homepage and breaking strip.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fast Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-mono uppercase font-bold text-editorial-red mb-1 text-[11px]">
              Breaking Headline * (Broadcast Live)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Election Commission Announces Landmark Schedule for Key State Assemblies"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-2.5 font-serif font-bold text-base text-ink border-2 border-slate-300 rounded-sm focus:border-editorial-red focus:outline-hidden"
              autoFocus
            />
          </div>

          <div>
            <label className="block font-mono uppercase font-bold text-ink-muted mb-1 text-[10px]">
              Initial Wire Dispatch Summary (1-2 sentences)
            </label>
            <textarea
              rows={2}
              placeholder="Provide rapid verified facts. You can enrich the full article body immediately after publishing."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2.5 text-xs text-ink border border-border-subtle rounded-sm focus:border-editorial-red focus:outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono uppercase font-bold text-ink-muted mb-1 text-[10px]">
                Desk / Section
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-border-subtle rounded-sm bg-white font-semibold uppercase"
              >
                {mockCategories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono uppercase font-bold text-ink-muted mb-1 text-[10px]">
                Desk Byline
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full p-2 border border-border-subtle rounded-sm bg-white"
              >
                {Object.values(mockAuthors).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Automatic Distribution Toggles */}
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-ink block">Activate Top Breaking Bar</span>
                <span className="text-[10px] text-ink-muted">Displays pulsing red banner site-wide</span>
              </div>
              <input
                type="checkbox"
                checked={activateBreakingStrip}
                onChange={(e) => setActivateBreakingStrip(e.target.checked)}
                className="w-4 h-4 text-editorial-red cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-red-200/60">
              <div>
                <span className="font-bold text-ink block">Pin as Homepage Hero Lead</span>
                <span className="text-[10px] text-ink-muted">Takes over Slot 1 on frontpage</span>
              </div>
              <input
                type="checkbox"
                checked={pinAsHeroLead}
                onChange={(e) => setPinAsHeroLead(e.target.checked)}
                className="w-4 h-4 text-editorial-red cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 font-semibold text-ink-muted hover:text-ink cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!headline.trim() || isSubmitting}
              className="px-5 py-2.5 bg-editorial-red hover:bg-red-800 text-white font-bold rounded-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Dispatching Live...' : 'Publish Breaking Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
