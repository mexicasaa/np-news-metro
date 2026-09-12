import React, { useState } from 'react';
import { 
  Plus, Newspaper, ArrowRight, CheckCircle2, AlertTriangle, 
  Clock, RefreshCw, UserPlus, Video, X
} from 'lucide-react';
import { UserRole, ROLE_PERMISSIONS } from '../../types/admin';
import { mockAuditLogs } from '../../data/mockAdminData';

interface DashboardHomeProps {
  onOpenPublishingCenter: (initialTab?: string) => void;
  onNewArticle: () => void;
  onOpenVideos?: () => void;
  videoCount?: number;
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
  onOpenVideos,
  videoCount = 12,
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

  const getUserBadge = (user: string, isAlert: boolean) => {
    if (isAlert) {
      return (
        <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (user.toLowerCase().includes('bot') || user.toLowerCase().includes('system')) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
          SYS
        </div>
      );
    }
    const initials = user
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
        {initials || 'U'}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-8">
      {/* Header & Creative Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time status and activity monitoring across NP News Metro newsroom.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {onOpenVideos && (
            <button
              onClick={onOpenVideos}
              className="px-4 py-2 bg-white/90 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-full text-xs font-bold text-slate-900 shadow-2xs hover:shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Video className="w-3.5 h-3.5 text-red-600" />
              <span>Video Studio</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 rounded-full">
                {videoCount}
              </span>
            </button>
          )}

          <button
            onClick={() => onOpenPublishingCenter('all')}
            className="px-4 py-2 bg-white/90 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-full text-xs font-bold text-slate-900 shadow-2xs hover:shadow-xs flex items-center gap-2 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <Newspaper className="w-3.5 h-3.5 text-red-600" />
            <span>Open Publishing Center</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={onNewArticle}
            disabled={!permissions.canCreate}
            className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all ${
              permissions.canCreate
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white cursor-pointer hover:shadow-xs hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* ======================================================================
          1. CREATIVE METRIC CARDS (No Colored Lines, Clean Editorial Telemetry)
          ====================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Published Today */}
        <div 
          onClick={() => onOpenPublishingCenter('published')}
          className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Published Today
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight my-1">
            {publishedCount}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            ↑ 14% vs yesterday
          </div>
        </div>

        {/* Awaiting Review */}
        <div 
          onClick={() => onOpenPublishingCenter('review')}
          className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Awaiting Review
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight my-1">
            {awaitingReviewCount}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {permissions.canReview ? 'Action needed' : 'In review queue'}
          </div>
        </div>

        {/* Scheduled */}
        <div 
          onClick={() => onOpenPublishingCenter('scheduled')}
          className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Scheduled
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight my-1">
            {scheduledCount}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Next: 08:00 AM IST
          </div>
        </div>

        {/* Breaking News (Clean Card - No Color Border Line) */}
        <div 
          onClick={() => onOpenPublishingCenter('breaking')}
          className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              <span>Breaking News</span>
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-black text-red-600 tracking-tight my-1">
            {breakingCount}
          </div>
          <div className="text-[11px] text-red-600 font-medium">
            Live on homepage banner
          </div>
        </div>

        {/* Site Health */}
        <div 
          onClick={() => onOpenPublishingCenter(failedCount > 0 ? 'failed' : 'all')}
          className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Site Health
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight my-1 flex items-center gap-2">
            <span>98%</span>
            <CheckCircle2 className="w-4 h-4 text-slate-900 inline" />
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            {failedCount} failed task in retry queue
          </div>
        </div>
      </div>

      {/* ======================================================================
          2. MAIN 2-COLUMN SPLIT: RECENT ACTIVITY (Left) + SYSTEM HEALTH & TASKS (Right)
          ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Recent Activity (7 cols) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900"></span>
              <h2 className="font-serif font-bold text-base text-slate-900">
                Recent Activity
              </h2>
            </div>
            <button
              onClick={() => onOpenPublishingCenter('history')}
              className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-full text-[10px] font-mono font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {mockAuditLogs.map((log) => {
              const isAlert = log.badgeType === 'danger';
              return (
                <div 
                  key={log.id} 
                  className={`p-4 sm:px-6 sm:py-4 flex items-start gap-3.5 transition-colors ${
                    isAlert ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {getUserBadge(log.user, isAlert)}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-800 leading-snug">
                      <span className="font-bold text-slate-900">{log.user}</span>{' '}
                      <span className="text-slate-500 font-normal">{log.action}</span>{' '}
                      <span className="font-semibold text-slate-900 hover:text-red-600 transition-colors">"{log.target}"</span>
                    </p>
                    {log.details && (
                      <div className="mt-1">
                        <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 bg-slate-100/70 rounded-md border border-slate-200/50 truncate inline-block max-w-full">
                          {log.details}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: System Health & Admin Tasks (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          {/* System Health Card */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-serif font-bold text-base text-slate-900">
                System Health
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60">
                Active Monitor
              </span>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  <span className="text-slate-900 font-semibold">Main Server (US-East)</span>
                </div>
                <span className="text-slate-900 font-bold">Operational</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  <span className="text-slate-900 font-semibold">Database Backups</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-900 font-bold block">Healthy</span>
                  <span className="text-[10px] text-slate-400">Last: 2 hrs ago</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span className="text-slate-900 font-semibold">WAF (Firewall)</span>
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold block">Alert (Minor)</span>
                  <span className="text-[10px] text-slate-400">Spike blocked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Tasks Card */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-3.5">
            <h2 className="font-serif font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Admin Tasks
            </h2>

            <div className="space-y-2.5 pt-0.5">
              <button
                onClick={handleClearCache}
                disabled={cacheClearing}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-white ${cacheClearing ? 'animate-spin' : ''}`} />
                <span>{cacheClearing ? 'Purging Targeted Edge Caches...' : 'Clear Cache'}</span>
              </button>

              {cachePurgedTime && (
                <p className="text-[11px] text-slate-700 font-mono bg-slate-100 border border-slate-200/60 py-1.5 px-3 rounded-xl text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                  <span>Cache Purged ({cachePurgedTime})</span>
                </p>
              )}

              <button
                onClick={() => setInviteModalOpen(true)}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-900 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-700" />
                <span>Invite User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 relative">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Invite Newsroom Team Member
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Send an onboarding invitation with designated role and permission scope.
              </p>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="editor.name@npnewsmetro.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-800 font-medium text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Newsroom Role
                </label>
                <select className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-800 font-medium text-slate-800 transition-all cursor-pointer">
                  <option value="reporter">Reporter / Author (Draft & Upload)</option>
                  <option value="copy_editor">Copy Editor (Review & Approve)</option>
                  <option value="editor">Senior Editor (Publish & Curation)</option>
                  <option value="seo_manager">SEO Manager (Search & Schema)</option>
                  <option value="ad_manager">Ad Manager (Monetization)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteSent}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
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
