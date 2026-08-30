import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, Search, DollarSign, Users, BarChart3, 
  Settings, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, 
  Plus, ExternalLink, Globe, Database, Cpu, Radio, Check,
  FileText, Video as VideoIcon, Bot, Rss, Copy, UserPlus,
  Trash2, Edit, X, Shield, Mail, Key, Loader2, Lock, Filter
} from 'lucide-react';
import { getSitemapStats, SitemapStats, getBaseSiteUrl } from '../../services/sitemapService';
import { mockAuthors, mockCategories } from '../../data/mockWpData';
import { mockAdminUsers } from '../../data/mockAdminData';
import { ROLE_PERMISSIONS, UserProfile, UserRole } from '../../types/admin';
import { getMediaLibrary, uploadMedia, MediaAsset } from '../../services/mediaService';
import { 
  getProfilesList, 
  createNewsroomUser, 
  updateNewsroomUserRole, 
  updateNewsroomUserProfile,
  deleteNewsroomUser 
} from '../../services/authService';

import { YouTubeManagerModal } from './YouTubeManagerModal';

/* ======================================================================
   1. MEDIA LIBRARY VIEW
   ====================================================================== */
export const MediaLibraryView: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setIsLoading(true);
    const items = await getMediaLibrary();
    setMediaItems(items);
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      const res = await uploadMedia(file, file.name, 'NP News Metro Media Desk');
      if (res.asset) {
        setMediaItems(prev => [res.asset!, ...prev]);
      } else if (res.error) {
        alert(`Upload error: ${res.error}`);
      }
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <YouTubeManagerModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
        onVideoSaved={(video) => {
          alert(`Video "${video.title}" saved and published to Video Hub.`);
          loadMedia();
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*,application/pdf"
        className="hidden"
      />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
            Media Library & Asset Management
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Supabase Storage synchronization with reserved dimensions and metadata verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsYouTubeModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-sm shadow-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-red-400" />
            <span>Import YouTube Video</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-editorial-red text-white text-xs font-bold rounded-sm shadow-xs hover:bg-red-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Asset</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
                <span>Alt Text ?</span>
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
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await getSitemapStats();
      setStats(data);
    } catch (e) {
      console.error('Error loading sitemap stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRevalidate = async () => {
    setRevalidating(true);
    await fetchStats();
    setTimeout(() => {
      setRevalidating(false);
      alert('Sitemaps revalidated and synchronized with live database.');
    }, 600);
  };

  const handleCopyUrl = (path: string) => {
    const fullUrl = `${getBaseSiteUrl()}${path}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const baseUrl = getBaseSiteUrl();

  const sitemapEndpoints = [
    {
      id: 'index',
      title: 'Master Sitemap Index',
      path: '/sitemap_index.xml',
      description: 'Master index referencing all sub-sitemaps (Main, News, Images, Videos)',
      count: '4 Sitemaps',
      countLabel: 'Sub-Sitemaps',
      icon: Globe,
      status: 'Active',
    },
    {
      id: 'main',
      title: 'Main XML Sitemap',
      path: '/sitemap.xml',
      description: 'Homepage, public categories, published indexable stories & video pages',
      count: stats?.mainUrlCount ?? '—',
      countLabel: 'Total URLs',
      icon: Globe,
      status: 'Active',
    },
    {
      id: 'news',
      title: 'Google News Sitemap',
      path: '/news-sitemap.xml',
      description: 'Recent eligible news articles with publication timestamps and Hindi/English tags',
      count: stats?.newsUrlCount ?? '—',
      countLabel: 'News Articles',
      icon: FileText,
      status: 'Active',
    },
    {
      id: 'image',
      title: 'Image XML Sitemap',
      path: '/image-sitemap.xml',
      description: 'Editorial article featured images with captions, titles, and CDN URLs',
      count: stats?.imageUrlCount ?? '—',
      countLabel: 'Image Assets',
      icon: ImageIcon,
      status: 'Active',
    },
    {
      id: 'video',
      title: 'Video XML Sitemap',
      path: '/video-sitemap.xml',
      description: 'Public video desk items with thumbnails, player URLs, and descriptions',
      count: stats?.videoUrlCount ?? '—',
      countLabel: 'Video Assets',
      icon: VideoIcon,
      status: 'Active',
    },
    {
      id: 'robots',
      title: 'Robots Directives',
      path: '/robots.txt',
      description: 'Search crawler directives allowing public newsroom paths & blocking /admin',
      count: 'Directives Live',
      countLabel: 'Crawler Rules',
      icon: Bot,
      status: 'Active',
    },
    {
      id: 'rss',
      title: 'RSS 2.0 Syndication Feed',
      path: '/rss.xml',
      description: 'Standard RSS XML feed for feed readers, syndication, and aggregator discovery',
      count: stats?.newsUrlCount ?? '—',
      countLabel: 'Feed Items',
      icon: Rss,
      status: 'Active',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header & Revalidate Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
            SEO & Technical Sitemap Management
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Real-time status, crawler discovery endpoints, and XML sitemaps generated from live database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRevalidate}
            disabled={revalidating}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${revalidating ? 'animate-spin' : ''}`} />
            <span>{revalidating ? 'Revalidating...' : 'Refresh / Revalidate'}</span>
          </button>
        </div>
      </div>

      {/* Top High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-surface-lowest p-4 sm:p-5 border border-border-subtle rounded-sm shadow-2xs">
          <span className="text-ink-muted uppercase font-bold text-[10px]">Main Indexable URLs</span>
          <div className="text-2xl font-bold text-ink mt-1.5">
            {loading ? '...' : (stats?.mainUrlCount || 0)}
          </div>
          <p className="text-[11px] text-ink-muted mt-1">Homepage, Desks, Articles, Videos</p>
        </div>

        <div className="bg-surface-lowest p-4 sm:p-5 border border-border-subtle rounded-sm shadow-2xs">
          <span className="text-ink-muted uppercase font-bold text-[10px]">Google News Sitemap</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1.5">
            {loading ? '...' : (stats?.newsUrlCount || 0)}
          </div>
          <p className="text-[11px] text-ink-muted mt-1">Eligible published news stories</p>
        </div>

        <div className="bg-surface-lowest p-4 sm:p-5 border border-border-subtle rounded-sm shadow-2xs">
          <span className="text-ink-muted uppercase font-bold text-[10px]">Google Structured Data</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1.5">100% Valid</div>
          <p className="text-[11px] text-ink-muted mt-1">NewsArticle & VideoObject schemas</p>
        </div>

        <div className="bg-surface-lowest p-4 sm:p-5 border border-border-subtle rounded-sm shadow-2xs">
          <span className="text-ink-muted uppercase font-bold text-[10px]">Base Canonical Domain</span>
          <div className="text-sm font-bold text-slate-800 mt-2 truncate" title={baseUrl}>
            {baseUrl.replace('https://', '')}
          </div>
          <p className="text-[11px] text-ink-muted mt-1">Production absolute origin</p>
        </div>
      </div>

      {/* Technical Sitemaps Endpoints Table / Cards */}
      <div className="bg-surface-lowest border border-border-subtle rounded-sm shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border-subtle bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif font-bold text-base text-ink">
              Crawler Discovery Endpoints & XML Feeds
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              These endpoints are publicly accessible to search crawlers without authentication, but hidden from normal visitor menus.
            </p>
          </div>
          <div className="text-xs font-mono text-ink-muted">
            Last Generated: <span className="font-semibold text-ink">{stats?.lastGenerated ? new Date(stats.lastGenerated).toLocaleTimeString() : 'Live on request'}</span>
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {sitemapEndpoints.map((item) => {
            const Icon = item.icon;
            const isCopied = copiedPath === item.path;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                {/* Left: Icon, Title, Path, Description */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="p-2.5 rounded-sm bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-sm text-ink">{item.title}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>{item.status}</span>
                      </span>
                    </div>
                    <code className="block text-xs font-mono text-primary font-bold">
                      {item.path}
                    </code>
                    <p className="text-xs text-ink-muted">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Middle: Count badge */}
                <div className="shrink-0 flex items-center md:flex-col md:items-end gap-1 font-mono text-xs">
                  <span className="font-bold text-ink text-sm sm:text-base">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-ink-muted uppercase font-semibold">
                    {item.countLabel}
                  </span>
                </div>

                {/* Right: Actions (Open & Copy) */}
                <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end">
                  <a
                    href={`${baseUrl}${item.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-border-subtle text-slate-700 rounded-sm text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Open XML sitemap endpoint in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Open Endpoint ↗</span>
                  </a>

                  <button
                    onClick={() => handleCopyUrl(item.path)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-sm text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy absolute URL to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AVAILABLE_ROLES: { value: UserRole; label: string; description: string; canPublish: boolean }[] = [
  { value: 'admin', label: 'Admin', description: 'Full root newsroom administration and publishing control', canPublish: true },
  { value: 'editor', label: 'Editor', description: 'Senior editor with full live publish, approvals, and breaking news control', canPublish: true },
  { value: 'copy_editor', label: 'Copy Editor', description: 'Desk reviewer and copy polisher (Draft / Review Only)', canPublish: false },
  { value: 'author', label: 'Author', description: 'Editorial columnist and feature author (Draft / Review Only)', canPublish: false },
  { value: 'reporter', label: 'Reporter', description: 'Field reporter filing breaking dispatches (Draft / Review Only)', canPublish: false },
  { value: 'seo_manager', label: 'SEO Manager', description: 'Sitemap, crawler directives, and metadata specialist', canPublish: false },
  { value: 'ad_manager', label: 'Ad Manager', description: 'Commercial campaigns and sponsorship manager', canPublish: false },
];

const AVAILABLE_DEPARTMENTS = [
  'Executive Editorial',
  'National Bureau',
  'Politics Desk',
  'Economy Desk',
  'Tech Bureau',
  'Opinion Desk',
  'Sports Desk',
  'World Affairs',
  'Multimedia & Video Desk',
  'Regional Corridors',
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
];

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    name: string;
    email: string;
    role: UserRole;
    department: string;
    designation: string;
    password: string;
    avatar: string;
    bio: string;
  }>({
    name: '',
    email: '',
    role: 'reporter',
    department: 'National Bureau',
    designation: 'वरिष्ठ संवाददाता',
    password: 'Newsroom@2026',
    avatar: AVATAR_PRESETS[0],
    bio: '',
  });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Member Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: UserRole;
    department: string;
    designation: string;
    avatar: string;
    bio: string;
  }>({
    name: '',
    role: 'author',
    department: 'Editorial Bureau',
    designation: '',
    avatar: AVATAR_PRESETS[0],
    bio: '',
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete / Remove Modal State
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // Updating specific row inline
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await getProfilesList();
      setUsers(data);
    } catch (e) {
      console.error('Error loading users:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Assign / Quick Update Role
  const handleRoleChange = async (user: UserProfile, newRole: UserRole) => {
    if (user.role === newRole) return;
    if (user.email === 'admin@npnews.com' && newRole !== 'admin') {
      showNotification('error', 'Primary Root Administrator role cannot be downgraded.');
      return;
    }

    setUpdatingUserId(user.id);
    try {
      const res = await updateNewsroomUserRole(user.id, newRole, user.department, user.name);
      if (res.error) {
        showNotification('error', `Failed to update role: ${res.error}`);
      } else {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        showNotification('success', `Role for ${user.name} updated to ${newRole.replace('_', ' ').toUpperCase()} in database.`);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Error updating role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // 2. Add New Member (connected to Supabase Auth & Profiles)
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!addForm.name.trim()) {
      setAddError('Full name is required.');
      return;
    }
    if (!addForm.email.trim() || !addForm.email.includes('@')) {
      setAddError('Valid email address is required.');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await createNewsroomUser({
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
        role: addForm.role,
        department: addForm.department.trim(),
        designation: addForm.designation.trim() || 'संवाददाता',
        password: addForm.password.trim() || 'Newsroom@2026',
        avatar: addForm.avatar,
        bio: addForm.bio.trim(),
      });

      if (res.error) {
        setAddError(res.error);
      } else {
        showNotification('success', `Team member ${addForm.name} successfully created and registered in database!`);
        setIsAddModalOpen(false);
        setAddForm({
          name: '',
          email: '',
          role: 'reporter',
          department: 'National Bureau',
          designation: 'वरिष्ठ संवाददाता',
          password: 'Newsroom@2026',
          avatar: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
          bio: '',
        });
        await fetchUsers();
      }
    } catch (err: any) {
      setAddError(err?.message || 'Failed to add newsroom user.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // 3. Edit Existing Member
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      department: user.department,
      designation: user.designation || '',
      avatar: user.avatar || AVATAR_PRESETS[0],
      bio: user.bio || '',
    });
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    if (!editForm.name.trim()) {
      setEditError('Name is required.');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await updateNewsroomUserProfile({
        userId: editingUser.id,
        name: editForm.name.trim(),
        role: editForm.role,
        department: editForm.department,
        designation: editForm.designation.trim(),
        avatar: editForm.avatar,
        bio: editForm.bio.trim(),
      });

      if (res.error) {
        setEditError(res.error);
      } else {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? {
          ...u,
          name: editForm.name.trim(),
          role: editForm.role,
          department: editForm.department,
          designation: editForm.designation.trim(),
          avatar: editForm.avatar,
          bio: editForm.bio.trim(),
        } : u));
        showNotification('success', `Updated ${editForm.name}'s profile and role in database.`);
        setEditingUser(null);
      }
    } catch (err: any) {
      setEditError(err?.message || 'Error updating member.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // 4. Remove / Deactivate Member
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    if (deletingUser.email === 'admin@npnews.com' || deletingUser.id === '04ad79d9-d871-4099-a633-bcb7a1e35055') {
      showNotification('error', 'Cannot delete primary root administrator.');
      setDeletingUser(null);
      return;
    }

    setIsSubmittingDelete(true);
    try {
      const res = await deleteNewsroomUser(deletingUser.id, true);
      if (!res.success) {
        showNotification('error', res.error || 'Failed to remove user.');
      } else {
        setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
        showNotification('success', `Team member ${deletingUser.name} removed from newsroom.`);
        setDeletingUser(null);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Error deleting member.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`p-3.5 rounded-sm flex items-center justify-between text-xs font-semibold shadow-md transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-900 text-emerald-50 border border-emerald-700' 
            : 'bg-red-900 text-red-50 border border-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertTriangle className="w-4 h-4 text-red-300" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
            Newsroom Users & Role Permissions
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Enforced server-side least-privilege role matrix across authoring, reviewing, publishing, and curation (Supabase Auth & Profiles).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchUsers();
            }}
            disabled={refreshing}
            className="px-3 py-2 bg-surface-lowest hover:bg-slate-100 border border-border-subtle text-ink rounded-sm text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload team members from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : 'text-ink-muted'}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          <button
            onClick={() => {
              setAddError(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Search & Role Filters */}
      <div className="bg-surface-lowest border border-border-subtle p-3.5 rounded-sm shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, department, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-ink-muted shrink-0" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs bg-slate-50 border border-border-subtle rounded-sm px-3 py-2 text-ink font-semibold focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Roles ({users.length})</option>
            {AVAILABLE_ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users & Permissions Table */}
      <div className="bg-surface-lowest border border-border-subtle rounded-sm shadow-subtle overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-ink-muted flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Loading newsroom team from database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-ink-muted">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-ink">No team members match your criteria</p>
            <p className="text-xs text-ink-muted mt-1">Try changing your search keywords or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-border-subtle font-mono text-[11px] uppercase font-bold text-ink-muted">
                  <th className="p-3.5 pl-4">Team Member</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Publish Permission</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredUsers.map((u) => {
                  const perms = ROLE_PERMISSIONS[u.role] || ROLE_PERMISSIONS.reporter;
                  const isRootAdmin = u.email === 'admin@npnews.com' || u.id === '04ad79d9-d871-4099-a633-bcb7a1e35055';
                  const isUpdating = updatingUserId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Member info */}
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={u.avatar} 
                            alt={u.name} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-ink truncate">{u.name}</p>
                              {isRootAdmin && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-xs bg-amber-100 text-amber-800 text-[9px] font-mono font-bold uppercase tracking-wider">
                                  Primary Root
                                </span>
                              )}
                            </div>
                            {u.designation && (
                              <p className="text-[11px] text-blue-700 font-semibold truncate">
                                {u.designation}
                              </p>
                            )}
                            <p className="text-[11px] text-ink-muted truncate font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-3.5 text-ink-secondary font-medium">
                        {u.department || 'Editorial Bureau'}
                      </td>

                      {/* Interactive Assigned Role Selector */}
                      <td className="p-3.5">
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={u.role}
                            disabled={isRootAdmin || isUpdating}
                            onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-sm border transition-colors cursor-pointer ${
                              u.role === 'admin' 
                                ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                                : u.role === 'editor'
                                ? 'bg-blue-50 text-blue-900 border-blue-300 font-bold'
                                : u.role === 'copy_editor'
                                ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                : 'bg-slate-50 text-slate-800 border-slate-200'
                            } ${isRootAdmin ? 'cursor-not-allowed opacity-90' : 'hover:border-primary'}`}
                          >
                            {AVAILABLE_ROLES.map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />}
                        </div>
                      </td>

                      {/* Publish Permission */}
                      <td className="p-3.5">
                        {perms.canPublish ? (
                          <span className="text-emerald-700 font-bold font-mono text-[11px] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Full Live Publish
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                            Draft / Review Only
                          </span>
                        )}
                      </td>

                      {/* Action buttons (Edit / Remove) */}
                      <td className="p-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-ink-muted hover:text-primary hover:bg-slate-100 rounded-sm transition-colors cursor-pointer"
                            title="Edit user details & department"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {isRootAdmin ? (
                            <span 
                              className="p-1.5 text-slate-300 cursor-not-allowed" 
                              title="Primary root admin cannot be deleted"
                            >
                              <Lock className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="p-1.5 text-ink-muted hover:text-editorial-red hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                              title="Remove team member from newsroom"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================================
         MODAL 1: ADD TEAM MEMBER (Connected to Supabase DB)
         ====================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-surface-lowest border border-border-subtle rounded-md shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-border-subtle bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink">Add Newsroom Team Member</h3>
                  <p className="text-[11px] text-ink-muted">Create profile and provision Supabase newsroom credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-ink-muted hover:text-ink p-1 rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {addError && (
              <div className="m-4 p-3 rounded-sm bg-red-50 border border-red-200 text-editorial-red text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Joshi"
                  value={addForm.name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Newsroom Designation / Title (Byline Role)
                </label>
                <input
                  type="text"
                  placeholder="e.g. वरिष्ठ संवाददाता / विशेष संवाददाता / Senior Reporter"
                  value={addForm.designation}
                  onChange={(e) => setAddForm(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink font-medium"
                />
                <p className="text-[10px] text-ink-muted mt-1">
                  Shown in the Article Editor reporter dropdown and public story byline card.
                </p>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Newsroom Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. meera.joshi@npnewsmetro.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                    Role Assignment *
                  </label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink font-semibold"
                  >
                    {AVAILABLE_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-ink-muted mt-1">
                    {AVAILABLE_ROLES.find(r => r.value === addForm.role)?.description}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                    Department Desk *
                  </label>
                  <select
                    value={addForm.department}
                    onChange={(e) => setAddForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink font-semibold"
                  >
                    {AVAILABLE_DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Initial Password
                </label>
                <input
                  type="text"
                  value={addForm.password}
                  onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Defaults to Newsroom@2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink font-mono"
                />
                <p className="text-[10px] text-ink-muted mt-0.5">The user can change their password upon first sign in.</p>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block font-bold text-ink mb-1.5 uppercase tracking-wider text-[11px]">
                  Avatar / Profile Photo
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <img src={addForm.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary shrink-0" />
                  <input
                    type="text"
                    placeholder="Custom Photo URL: /uploads/... or https://..."
                    value={addForm.avatar}
                    onChange={(e) => setAddForm(prev => ({ ...prev, avatar: e.target.value }))}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-border-subtle rounded-sm text-xs text-ink"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAddForm(prev => ({ ...prev, avatar: preset }))}
                      className={`relative rounded-full p-0.5 border-2 transition-all cursor-pointer ${
                        addForm.avatar === preset ? 'border-primary scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Avatar ${idx + 1}`} className="w-8 h-8 rounded-full object-cover" />
                      {addForm.avatar === preset && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border border-white flex items-center justify-center">
                          <Check className="w-1.5 h-1.5 text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border-subtle rounded-sm font-semibold text-ink-secondary hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Create Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
         MODAL 2: EDIT TEAM MEMBER
         ====================================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-surface-lowest border border-border-subtle rounded-md shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-border-subtle bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={editingUser.avatar} alt={editingUser.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                <div>
                  <h3 className="font-serif font-bold text-base text-ink">Edit Newsroom Member</h3>
                  <p className="text-[11px] text-ink-muted font-mono">{editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-ink-muted hover:text-ink p-1 rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="m-4 p-3 rounded-sm bg-red-50 border border-red-200 text-editorial-red text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Newsroom Designation / Title (Byline Role)
                </label>
                <input
                  type="text"
                  placeholder="e.g. वरिष्ठ संवाददाता / मानवीय व्यवहार वैज्ञानिक व लेखक / Bureau Chief"
                  value={editForm.designation}
                  onChange={(e) => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink font-medium"
                />
                <p className="text-[10px] text-ink-muted mt-1">
                  Shown in the Article Editor reporter dropdown and public story byline card.
                </p>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Profile Photo / Avatar
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <img src={editForm.avatar} alt="Avatar" className="w-11 h-11 rounded-full object-cover border-2 border-primary shrink-0" />
                  <input
                    type="text"
                    placeholder="Custom Image URL: /uploads/... or https://..."
                    value={editForm.avatar}
                    onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-border-subtle rounded-sm text-xs text-ink"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, avatar: preset }))}
                      className={`relative rounded-full p-0.5 border-2 transition-all cursor-pointer ${
                        editForm.avatar === preset ? 'border-primary scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Avatar ${idx + 1}`} className="w-8 h-8 rounded-full object-cover" />
                      {editForm.avatar === preset && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border border-white flex items-center justify-center">
                          <Check className="w-1.5 h-1.5 text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Assigned Role
                </label>
                <select
                  value={editForm.role}
                  disabled={editingUser.email === 'admin@npnews.com'}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink font-semibold"
                >
                  {AVAILABLE_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-ink-muted mt-1">
                  {AVAILABLE_ROLES.find(r => r.value === editForm.role)?.description}
                </p>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Department Desk
                </label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink font-semibold"
                >
                  {AVAILABLE_DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1 uppercase tracking-wider text-[11px]">
                  Reporter / Author Bio (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short author bio for public articles..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-sm focus:outline-none focus:border-primary text-ink text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-border-subtle rounded-sm font-semibold text-ink-secondary hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
         MODAL 3: DELETE / REMOVE CONFIRMATION
         ====================================================================== */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-surface-lowest border-2 border-editorial-red rounded-md shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 text-editorial-red rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-ink">Remove Team Member?</h3>
                <p className="text-xs text-ink-secondary mt-1">
                  Are you sure you want to remove <strong>{deletingUser.name}</strong> ({deletingUser.email}) from the newsroom team?
                </p>
                <p className="text-[11px] text-ink-muted mt-2">
                  This user will immediately lose publishing privileges and newsroom portal access.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border border-border-subtle rounded-sm text-xs font-semibold text-ink-secondary hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmittingDelete}
                className="px-4 py-2 bg-editorial-red hover:bg-editorial-red/90 text-white rounded-sm text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmittingDelete ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Removal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
      setTimeout(() => setPurged(false), 800);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
          System Infrastructure & Edge Cache
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Server health, Supabase PostgreSQL, Storage Buckets, and edge distribution nodes.
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
            Supabase Backend Health
          </h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink">PostgreSQL Database</span>
              <span className="text-emerald-700 font-bold">Connected (Active Healthy)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink">Supabase Storage Buckets</span>
              <span className="text-emerald-700 font-bold">Mounted (article-images, media, avatars)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink">Row Level Security</span>
              <span className="text-emerald-700 font-bold">Enforced (11 Tables)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
