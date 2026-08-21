import React, { useState } from 'react';
import { 
  Image as ImageIcon, Search, DollarSign, Users, BarChart3, 
  Settings, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, 
  Plus, ExternalLink, Globe, Database, Cpu, Radio, Check
} from 'lucide-react';
import { mockAuthors, mockCategories } from '../../data/mockWpData';
import { mockAdminUsers } from '../../data/mockAdminData';
import { ROLE_PERMISSIONS } from '../../types/admin';

/* ======================================================================
   1. MEDIA LIBRARY VIEW
   ====================================================================== */
export const MediaLibraryView: React.FC = () => {
  const mediaItems = [
    {
      id: 'med-1',
      title: 'Parliament House New Delhi Session',
      url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=600',
      dimensions: '1920 × 1080',
      credit: 'PTI / Vijay Verma',
      alt: 'Parliament building exterior during winter session',
      focal: 'Center (50%, 50%)',
    },
    {
      id: 'med-2',
      title: 'Western Port Maritime Corridor Freight Yard',
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=600',
      dimensions: '2400 × 1350',
      credit: 'Reuters / Amit Dave',
      alt: 'Container logistics and ship freight loading',
      focal: 'Top-Right (65%, 35%)',
    },
    {
      id: 'med-3',
      title: 'Dal Lake Srinagar Ecological Drone Panorama',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
      dimensions: '1920 × 1080',
      credit: 'Meera Iyer / NP News',
      alt: 'Aerial perspective of Dal Lake and houseboats',
      focal: 'Center (50%, 50%)',
    },
    {
      id: 'med-4',
      title: 'Supreme Court of India Constitution Bench',
      url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
      dimensions: '1600 × 900',
      credit: 'Express Archives',
      alt: 'Gavel and legal volumes in courtroom library',
      focal: 'Center (50%, 50%)',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
            Media Library & Asset Management
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Canonical WordPress media synchronization with reserved dimensions and focal-point verification.
          </p>
        </div>
        <button className="px-4 py-2 bg-editorial-red text-white text-xs font-bold rounded-sm shadow-xs hover:bg-red-800 transition-colors flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Asset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <div key={item.id} className="bg-surface-lowest border border-border-subtle rounded-sm overflow-hidden shadow-subtle group">
            <div className="aspect-[16/9] w-full bg-slate-900 overflow-hidden relative">
              <img src={item.url} alt={item.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                {item.dimensions}
              </span>
            </div>
            <div className="p-3.5 space-y-1.5 text-xs">
              <h4 className="font-bold text-ink truncate">{item.title}</h4>
              <p className="text-[11px] text-ink-muted">Credit: {item.credit}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-mono text-emerald-700 font-bold">
                <span>Alt Text ✓</span>
                <span>{item.focal}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ======================================================================
   2. MONETIZATION VIEW
   ====================================================================== */
export const MonetizationView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
          Monetization & Ad Profiles
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Named editorial ad slot profiles (A1–A7) and active sponsor campaign rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-surface-lowest border border-border-subtle p-5 rounded-sm shadow-subtle space-y-3">
          <span className="font-mono text-[11px] font-bold uppercase text-primary">Profile 1</span>
          <h3 className="font-serif font-bold text-base text-ink">Standard Article</h3>
          <p className="text-xs text-ink-secondary">4 Named Slots: Leaderboard A1, In-Content A4, Sidebar A5, Mobile Inline A7.</p>
          <div className="text-[11px] font-mono text-emerald-700 font-bold">Active on 85% of content</div>
        </div>

        <div className="bg-surface-lowest border border-border-subtle p-5 rounded-sm shadow-subtle space-y-3">
          <span className="font-mono text-[11px] font-bold uppercase text-editorial-red">Profile 2</span>
          <h3 className="font-serif font-bold text-base text-ink">Breaking Minimal</h3>
          <p className="text-xs text-ink-secondary">2 Slots Only: Leaderboard A1, Single In-Content A4. Prioritizes reading urgency.</p>
          <div className="text-[11px] font-mono text-primary font-bold">Auto-assigned to Breaking</div>
        </div>

        <div className="bg-surface-lowest border border-border-subtle p-5 rounded-sm shadow-subtle space-y-3">
          <span className="font-mono text-[11px] font-bold uppercase text-amber-700">Profile 3</span>
          <h3 className="font-serif font-bold text-base text-ink">Sponsored Native</h3>
          <p className="text-xs text-ink-secondary">Displays clear editorial disclosure header and partner attribution badge.</p>
          <div className="text-[11px] font-mono text-amber-800 font-bold">Requires Sponsor Tag</div>
        </div>
      </div>
    </div>
  );
};

/* ======================================================================
   3. SEO HEALTH VIEW
   ====================================================================== */
export const SeoHealthView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
          SEO & Structured Discovery Health
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Automated auditing of Google News Article schemas, canonical tags, and XML sitemaps.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-surface-lowest p-5 border border-border-subtle rounded-sm shadow-subtle">
          <span className="text-ink-muted uppercase">NewsArticle Schema</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">100% Valid</div>
          <p className="text-[11px] text-ink-muted mt-1">Validated via Schema.org validator</p>
        </div>
        <div className="bg-surface-lowest p-5 border border-border-subtle rounded-sm shadow-subtle">
          <span className="text-ink-muted uppercase">Google News Sitemap</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">Live Pinned</div>
          <p className="text-[11px] text-ink-muted mt-1">Last pinged: 2 mins ago</p>
        </div>
        <div className="bg-surface-lowest p-5 border border-border-subtle rounded-sm shadow-subtle">
          <span className="text-ink-muted uppercase">Canonical Redirects</span>
          <div className="text-2xl font-bold text-ink mt-2">Zero 404s</div>
          <p className="text-[11px] text-ink-muted mt-1">301 redirect engine active</p>
        </div>
      </div>
    </div>
  );
};

/* ======================================================================
   4. USERS & ROLES VIEW
   ====================================================================== */
export const UsersView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
          Newsroom Users & Role Permissions
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Enforced server-side least-privilege role matrix across authoring, reviewing, publishing, and curation.
        </p>
      </div>

      <div className="bg-surface-lowest border border-border-subtle rounded-sm shadow-subtle overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-border-subtle font-mono text-[11px] uppercase font-bold text-ink-muted">
              <th className="p-3.5 pl-4">Team Member</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Publish Permission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {mockAdminUsers.map((u) => {
              const perms = ROLE_PERMISSIONS[u.role];
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3.5 pl-4 flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-ink">{u.name}</p>
                      <p className="text-[11px] text-ink-muted">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-3.5 text-ink-secondary">{u.department}</td>
                  <td className="p-3.5 capitalize font-semibold">{u.role.replace('_', ' ')}</td>
                  <td className="p-3.5">
                    {perms.canPublish ? (
                      <span className="text-emerald-700 font-bold font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Full Live Publish
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">Draft / Review Only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ======================================================================
   5. SYSTEM & CACHE VIEW
   ====================================================================== */
export const SystemView: React.FC = () => {
  const [clearing, setClearing] = useState(false);
  const [purged, setPurged] = useState(false);

  const handlePurge = () => {
    setClearing(true);
    setTimeout(() => {
      setClearing(false);
      setPurged(true);
      setTimeout(() => setPurged(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
          System Infrastructure & Edge Cache
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Server health, Redis object caching, selective CDN invalidation, and background workers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-surface-lowest border border-border-subtle p-5 rounded-sm shadow-subtle space-y-4">
          <h3 className="font-serif font-bold text-base text-ink pb-2 border-b border-slate-100">
            Edge CDN Cache Control
          </h3>
          <p className="text-xs text-ink-secondary">
            Purge targeted distribution routes for homepage, categories, and article feeds.
          </p>
          <button
            onClick={handlePurge}
            disabled={clearing}
            className="px-4 py-2 bg-primary hover:bg-slate-800 text-white rounded-sm text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${clearing ? 'animate-spin' : ''}`} />
            <span>{clearing ? 'Purging Edge...' : 'Purge Targeted Cache'}</span>
          </button>
          {purged && (
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Edge cache successfully refreshed across all nodes.
            </p>
          )}
        </div>

        <div className="bg-surface-lowest border border-border-subtle p-5 rounded-sm shadow-subtle space-y-4">
          <h3 className="font-serif font-bold text-base text-ink pb-2 border-b border-slate-100">
            WordPress REST API Status
          </h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink">REST Endpoint /wp/v2/posts</span>
              <span className="text-emerald-700 font-bold">200 OK (38ms)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink">Media Upload REST /wp/v2/media</span>
              <span className="text-emerald-700 font-bold">200 OK (82ms)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink">Database Replication</span>
              <span className="text-emerald-700 font-bold">Synced (0s lag)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
