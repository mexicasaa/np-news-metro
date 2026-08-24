import React, { useState } from 'react';
import { 
  Plus, Newspaper, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, 
  Clock, Flame, RefreshCw, UserPlus, FileText, Check, ExternalLink, Zap
} from 'lucide-react';
import { UserRole, ROLE_PERMISSIONS } from '../../types/admin';
import { mockAuditLogs } from '../../data/mockAdminData';

interface DashboardHomeProps {
  onOpenPublishingCenter: (initialTab?: string) => void;
  onNewArticle: () => void;
  userRole: UserRole;
  publishedCount?: number;
  awaitingReviewCount?: number;
  scheduledCount?: number;
  breakingCount?: number;
  failedCount?: number;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onOpenPublishingCenter,
  onNewArticle,
  userRole,
  publishedCount = 42,
  awaitingReviewCount = 8,
  scheduledCount = 13,
  breakingCount = 2,
  failedCount = 1,
}) => {
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cachePurgedTime, setCachePurgedTime] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const permissions = ROLE_PERMISSIONS[userRole];

  const handleClearCache = () => {
    setCacheClearing(true);
    setTimeout(() => {
      setCacheClearing(false);
      setCachePurgedTime('Just now');
    }, 900);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteModalOpen(false);
      setInviteEmail('');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-ink tracking-tight">
            System Overview
          </h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            Real-time status and activity monitoring across NP News Metro newsroom.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <button
            onClick={() => onOpenPublishingCenter('all')}
            className="px-4 py-2 bg-surface-lowest border border-border-subtle hover:border-slate-400 rounded-sm text-xs font-bold text-ink shadow-2xs hover:shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Newspaper className="w-3.5 h-3.5 text-editorial-red" />
            <span>Open Publishing Center</span>
            <ArrowRight className="w-3 h-3 text-ink-muted" />
          </button>

          <button
            onClick={onNewArticle}
            disabled={!permissions.canCreate}
            className={`px-4 py-2 rounded-sm text-xs font-bold flex items-center gap-2 shadow-xs transition-all ${
              permissions.canCreate
                ? 'bg-editorial-red hover:bg-red-800 text-white cursor-pointer hover:shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Article</span>
          </button>
        </div>
      </div>

      {/* ======================================================================
          1. PUBLISHING TODAY METRIC CARDS (Matching Screenshot 1)
          ====================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Published Today */}
        <div 
          onClick={() => onOpenPublishingCenter('published')}
          className="bg-surface-lowest p-3.5 sm:p-5 rounded-xs border border-border-subtle shadow-subtle hover:border-slate-400 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted group-hover:text-ink transition-colors">
            Published Today
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-ink mt-2">
            {publishedCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>↑ 14% vs yesterday</span>
          </div>
        </div>

        {/* Awaiting Review */}
        <div 
          onClick={() => onOpenPublishingCenter('review')}
          className="bg-surface-lowest p-3.5 sm:p-5 rounded-xs border border-border-subtle shadow-subtle hover:border-slate-400 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted group-hover:text-ink transition-colors">
            Awaiting Review
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-ink mt-2">
            {awaitingReviewCount}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {permissions.canReview ? 'Action needed' : 'In review queue'}
          </div>
        </div>

        {/* Scheduled */}
        <div 
          onClick={() => onOpenPublishingCenter('scheduled')}
          className="bg-surface-lowest p-3.5 sm:p-5 rounded-xs border border-border-subtle shadow-subtle hover:border-slate-400 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted group-hover:text-ink transition-colors">
            Scheduled
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-ink mt-2">
            {scheduledCount}
          </div>
          <div className="text-[11px] text-primary font-semibold mt-1">
            Next: 08:00 AM IST
          </div>
        </div>

        {/* Breaking News (With prominent red accent) */}
        <div 
          onClick={() => onOpenPublishingCenter('breaking')}
          className="bg-surface-lowest p-3.5 sm:p-5 rounded-xs border-y border-l border-border-subtle border-r-4 border-r-editorial-red shadow-subtle hover:border-slate-400 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-editorial-red group-hover:text-red-800 transition-colors flex items-center justify-between">
            <span>Breaking News</span>
            <span className="w-2 h-2 rounded-full bg-editorial-red animate-ping"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-editorial-red mt-2">
            {breakingCount}
          </div>
          <div className="text-[11px] text-editorial-red font-semibold mt-1">
            Live on homepage banner
          </div>
        </div>

        {/* Site Health / Failed Operations */}
        <div 
          onClick={() => onOpenPublishingCenter(failedCount > 0 ? 'failed' : 'all')}
          className="bg-surface-lowest p-3.5 sm:p-5 rounded-xs border border-border-subtle shadow-subtle hover:border-slate-400 transition-all cursor-pointer group"
        >
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted group-hover:text-ink transition-colors">
            Site Health
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-ink mt-2 flex items-center gap-2">
            <span>98%</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-[11px] text-ink-muted font-semibold mt-1">
            {failedCount} failed task in retry queue
          </div>
        </div>
      </div>

      {/* ======================================================================
          2. MAIN 2-COLUMN SPLIT: RECENT ACTIVITY (Left) + SYSTEM HEALTH & TASKS (Right)
          ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Activity (7 cols) */}
        <div className="lg:col-span-7 bg-surface-lowest border border-border-subtle rounded-xs shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-ink">
              Recent Activity
            </h2>
            <button
              onClick={() => onOpenPublishingCenter('history')}
              className="text-[11px] font-mono font-bold text-ink-muted uppercase hover:text-editorial-red tracking-wider transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-border-subtle">
            {mockAuditLogs.map((log) => {
              const isAlert = log.badgeType === 'danger';
              return (
                <div 
                  key={log.id} 
                  className={`p-4 flex items-start gap-3.5 transition-colors ${
                    isAlert ? 'bg-red-50/60' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="p-2 rounded-sm bg-slate-100 border border-border-subtle shrink-0">
                    {isAlert ? (
                      <AlertTriangle className="w-4 h-4 text-editorial-red" />
                    ) : log.action.includes('publish') ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : log.action.includes('scheduled') ? (
                      <Clock className="w-4 h-4 text-primary" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink leading-relaxed">
                      <span className="font-bold">{log.user}</span>{' '}
                      <span className="text-ink-secondary">{log.action}</span>{' '}
                      <span className="font-semibold text-ink">"{log.target}"</span>
                    </p>
                    {log.details && (
                      <p className="text-[11px] text-ink-muted mt-0.5 font-mono truncate">
                        {log.details}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: System Health & Admin Tasks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* System Health Card */}
          <div className="bg-surface-lowest border border-border-subtle rounded-xs p-5 shadow-subtle">
            <h2 className="font-serif font-bold text-base text-ink pb-3 border-b border-border-subtle mb-4">
              System Health
            </h2>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-ink font-semibold">Main Server (US-East)</span>
                </div>
                <span className="text-emerald-700 font-bold">Operational</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-ink font-semibold">Database Backups</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold block">Healthy</span>
                  <span className="text-[10px] text-ink-muted">Last: 2 hrs ago</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-editorial-red"></span>
                  <span className="text-ink font-semibold">WAF (Firewall)</span>
                </div>
                <div className="text-right">
                  <span className="text-editorial-red font-bold block">Alert (Minor)</span>
                  <span className="text-[10px] text-ink-muted">Spike blocked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Tasks Card */}
          <div className="bg-surface-lowest border border-border-subtle rounded-xs p-5 shadow-subtle space-y-3">
            <h2 className="font-serif font-bold text-base text-ink pb-3 border-b border-border-subtle">
              Admin Tasks
            </h2>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleClearCache}
                disabled={cacheClearing}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-border-subtle rounded-sm text-xs font-bold text-ink flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-primary ${cacheClearing ? 'animate-spin' : ''}`} />
                <span>{cacheClearing ? 'Purging Targeted Edge Caches...' : 'Clear Cache'}</span>
              </button>

              {cachePurgedTime && (
                <p className="text-[11px] text-emerald-600 font-semibold text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Homepage & Category CDN Cache Purged ({cachePurgedTime})</span>
                </p>
              )}

              <button
                onClick={() => setInviteModalOpen(true)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-border-subtle rounded-sm text-xs font-bold text-ink flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-primary" />
                <span>Invite User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-lowest border border-border-subtle rounded-md shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <h3 className="font-serif font-bold text-lg text-ink mb-1">
              Invite Newsroom Team Member
            </h3>
            <p className="text-xs text-ink-secondary mb-4">
              Send an onboarding invitation with designated role and permission scope.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="editor.name@npnewsmetro.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs p-2.5 border border-border-subtle rounded-sm focus:outline-hidden focus:border-editorial-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Assign Newsroom Role
                </label>
                <select className="w-full text-xs p-2.5 border border-border-subtle rounded-sm bg-white focus:outline-hidden focus:border-editorial-red">
                  <option value="reporter">Reporter / Author (Draft & Upload)</option>
                  <option value="copy_editor">Copy Editor (Review & Approve)</option>
                  <option value="editor">Senior Editor (Publish & Curation)</option>
                  <option value="seo_manager">SEO Manager (Search & Schema)</option>
                  <option value="ad_manager">Ad Manager (Monetization)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-ink-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteSent}
                  className="px-4 py-2 bg-editorial-red hover:bg-red-800 text-white rounded-sm text-xs font-bold transition-colors cursor-pointer"
                >
                  {inviteSent ? 'Invitation Sent!' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
