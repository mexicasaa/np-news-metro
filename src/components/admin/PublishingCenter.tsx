import React, { useState } from 'react';
import { 
  Plus, Search, Filter, ArrowRight, Eye, Edit3, CheckCircle2, 
  Clock, AlertTriangle, Flame, ShieldAlert, Sparkles, RefreshCw, 
  Trash2, Send, ExternalLink, Check, MoreVertical, FileText,
  Calendar, Layers, Radio, Globe, UserCheck, HelpCircle, X, ChevronRight
} from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { DeletedArticle } from '../../services/articleService';
import { RotateCcw } from 'lucide-react';
import { 
  UserRole, EditorialStatus, ROLE_PERMISSIONS, PublishingOperation 
} from '../../types/admin';
import { mockAuthors, mockCategories } from '../../data/mockWpData';
import { mockFailedOperations } from '../../data/mockAdminData';
import { getStoredPosts, isPostPublished } from '../../utils/newsStorage';

export type PublishingTab = 
  | 'all'
  | 'drafts'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'breaking'
  | 'corrections'
  | 'failed'
  | 'trash'
  | 'history';

interface PublishingCenterProps {
  posts?: WpPost[];
  initialTab?: PublishingTab;
  userRole: UserRole;
  onNewArticle: () => void;
  onEditArticle: (post: WpPost) => void;
  onEmergencyBreaking: () => void;
  onViewLiveStory: (post: WpPost) => void;
  onPublishPostDirect: (post: WpPost) => void;
  onApprovePost: (post: WpPost) => void;
  onSchedulePostModal: (post: WpPost) => void;
  onRetryFailedOp: (opId: string) => void;
  onDeleteArticle?: (post: WpPost) => void;
  deletedArticles?: DeletedArticle[];
  onRestoreArticle?: (recoveryId: string) => void;
  onPermanentDelete?: (recoveryId: string) => void;
}

export const PublishingCenter: React.FC<PublishingCenterProps> = ({
  posts: externalPosts,
  initialTab = 'all',
  userRole,
  onNewArticle,
  onEditArticle,
  onEmergencyBreaking,
  onViewLiveStory,
  onPublishPostDirect,
  onApprovePost,
  onSchedulePostModal,
  onRetryFailedOp,
  onDeleteArticle,
  deletedArticles = [],
  onRestoreArticle,
  onPermanentDelete,
}) => {
  const [activeTab, setActiveTab] = useState<PublishingTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState('all');
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(true);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const permissions = ROLE_PERMISSIONS[userRole];
  const allPosts = externalPosts && externalPosts.length > 0 ? externalPosts : getStoredPosts();

  // Extended posts with status & word counts
  const extendedPosts = allPosts.map((post: any) => {
    const isPub = isPostPublished(post) || post.status === 'published' || post.editorialStatus === 'published';
    const status: EditorialStatus = isPub ? 'published' : (post.editorialStatus || post.status || 'draft');
    return {
      ...post,
      editorialStatus: status as EditorialStatus,
      wordCount: post.blocks ? post.blocks.reduce((acc: number, b: any) => acc + (b.content?.split(/\s+/).length || 0), 0) : Math.floor((post.dek?.length || 80) * 3),
      scheduledFor: status === 'scheduled' ? (post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'Scheduled') : undefined,
    };
  });

  const draftsCount = extendedPosts.filter(p => p.editorialStatus === 'draft' && !isPostPublished(p) && p.status !== 'published').length;
  const reviewCount = extendedPosts.filter(p => p.editorialStatus === 'review').length;
  const approvedCount = extendedPosts.filter(p => p.editorialStatus === 'approved').length;
  const scheduledCount = extendedPosts.filter(p => p.editorialStatus === 'scheduled').length;
  const publishedCount = extendedPosts.filter(p => p.editorialStatus === 'published' || isPostPublished(p) || p.status === 'published').length;
  const breakingCount = extendedPosts.filter(p => p.isBreaking || p.isLead).length;

  // Tab definitions with counts and human-friendly icons
  const tabs: { id: PublishingTab; label: string; count: number; badgeColor?: string; dotColor: string }[] = [
    { id: 'all', label: 'All Stories (सभी खबरें)', count: extendedPosts.length, dotColor: 'bg-slate-500' },
    { id: 'drafts', label: 'Drafts (ड्राफ्ट)', count: draftsCount, dotColor: 'bg-slate-400' },
    { id: 'review', label: 'Needs Review (रिव्यू बाकी)', count: reviewCount, badgeColor: 'bg-amber-100 text-amber-900 border-amber-300', dotColor: 'bg-amber-500' },
    { id: 'approved', label: 'Approved (मंजूर)', count: approvedCount, badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300', dotColor: 'bg-emerald-500' },
    { id: 'scheduled', label: 'Scheduled (शेड्यूल)', count: scheduledCount, badgeColor: 'bg-blue-100 text-blue-900 border-blue-300', dotColor: 'bg-blue-500' },
    { id: 'published', label: 'Published (लाइव)', count: publishedCount, dotColor: 'bg-emerald-600' },
    { id: 'breaking', label: 'Breaking News (ब्रेकिंग)', count: breakingCount, badgeColor: 'bg-red-100 text-editorial-red border-red-300', dotColor: 'bg-editorial-red' },
    { id: 'failed', label: 'Failed Retries (पुनः प्रयास)', count: mockFailedOperations.length, badgeColor: 'bg-rose-100 text-rose-800 border-rose-300', dotColor: 'bg-rose-600' },
    { id: 'trash', label: 'Trash / Recovery (कचरा / रिकवरी)', count: deletedArticles.length, badgeColor: 'bg-red-100 text-editorial-red border-red-300', dotColor: 'bg-red-600' },
  ];

  const filteredPosts = extendedPosts.filter((post) => {
    // Tab Filter: Drafts tab strictly excludes any published article
    if (activeTab === 'drafts') {
      if (post.editorialStatus !== 'draft' || isPostPublished(post) || post.status === 'published') return false;
    }
    if (activeTab === 'review' && post.editorialStatus !== 'review') return false;
    if (activeTab === 'approved' && post.editorialStatus !== 'approved') return false;
    if (activeTab === 'scheduled' && post.editorialStatus !== 'scheduled') return false;
    if (activeTab === 'published') {
      if (post.editorialStatus !== 'published' && !isPostPublished(post) && post.status !== 'published') return false;
    }
    if (activeTab === 'breaking' && !post.isBreaking && !post.isLead) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(q);
      const dekMatch = post.dek.toLowerCase().includes(q);
      const tagMatch = post.tags.some((t: string) => t.toLowerCase().includes(q));
      if (!titleMatch && !dekMatch && !tagMatch) return false;
    }

    // Category Filter
    if (selectedCategoryFilter !== 'all' && post.category !== selectedCategoryFilter) return false;

    // Author Filter
    if (selectedAuthorFilter !== 'all' && post.authorId !== selectedAuthorFilter) return false;

    return true;
  });

  // Helper for Status Badge styling
  const getStatusBadge = (status: EditorialStatus, isBreaking?: boolean) => {
    if (isBreaking) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-editorial-red border border-red-300 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-editorial-red"></span>
          <span>🔴 Breaking News</span>
        </span>
      );
    }
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>🟢 Published (लाइव)</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>🟡 Needs Review (समीक्षा बाकी)</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span>✅ Approved (स्वीकृत)</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>⏰ Scheduled (शेड्यूल)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>⚪ Draft (ड्राफ्ट)</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-16 animate-fadeIn">
      
      {/* ======================================================================
          1. HEADER & PRIMARY ACTIONS
          ====================================================================== */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
              Daily Publishing Center
            </h1>
            <span className="bg-red-50 text-editorial-red border border-red-200 text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded">
              P0 Newsroom Hub
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            सरल एवं स्पष्ट न्यूज़ डेस्क: खबर लिखने से लेकर लाइव प्रकाशित करने तक का संपूर्ण प्रबंधन।
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {permissions.canPublishBreaking && (
            <button
              onClick={onEmergencyBreaking}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-editorial-red border-2 border-editorial-red/40 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Flame className="w-4 h-4 text-editorial-red animate-pulse" />
              <span>⚡ Emergency Breaking</span>
            </button>
          )}

          <button
            onClick={onNewArticle}
            className="px-5 py-2.5 bg-editorial-red hover:bg-red-800 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Write New Story (नई खबर लिखें)</span>
          </button>
        </div>
      </div>

      {/* ======================================================================
          2. EASY 3-STEP NEWSROOM WORKFLOW GUIDE (SIMPLE FOR REPORTERS & STAFF)
          ====================================================================== */}
      {showWorkflowGuide && (
        <div className="bg-gradient-to-r from-red-50 via-amber-50 to-blue-50 border border-slate-200 rounded-lg p-5 relative shadow-2xs">
          <button
            onClick={() => setShowWorkflowGuide(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            title="Hide workflow guide"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-editorial-red" />
            <h3 className="font-serif font-bold text-sm text-slate-900">
              Newsroom Workflow Quick Guide (कर्मचारियों के लिए आसान निर्देश):
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Step 1 */}
            <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span>
                <span>Write Story (खबर लिखें)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Click <strong>+ Write New Story</strong>, write your headline, paste the article text in the long writing box, and upload a 16:9 photo.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">2</span>
                <span>Review & SEO (जांच करें)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Check green checkmarks in <strong>SEO Check</strong> (headline, author, image alt, tags) and submit for editor review.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                <span>Publish Live (लाइव प्रकाशित)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Click <strong>Publish Now</strong>. The story will instantly go live on the homepage, category section, and Google News feed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          3. TAB NAVIGATION (CLEAR, HIGH-CONTRAST BADGES)
          ====================================================================== */}
      <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-md whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${t.dotColor}`}></span>
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================================
          4. SEARCH & FILTER STRIP
          ====================================================================== */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search headline, keyword, tag, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-md focus:border-editorial-red focus:outline-hidden bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Section:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-md bg-white font-semibold text-slate-800 text-xs focus:outline-hidden focus:border-editorial-red uppercase"
            >
              <option value="all">All Sections (सभी श्रेणियां)</option>
              {mockCategories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Reporter:</span>
            <select
              value={selectedAuthorFilter}
              onChange={(e) => setSelectedAuthorFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-md bg-white font-semibold text-slate-800 text-xs focus:outline-hidden focus:border-editorial-red"
            >
              <option value="all">All Reporters (सभी लेखक)</option>
              {Object.values(mockAuthors).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================================
          5. CLEAN, HUMAN-FRIENDLY ARTICLE CARDS / TABLE
          ====================================================================== */}
      <div className="space-y-3">
        {activeTab === 'trash' ? (
          deletedArticles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
              <Trash2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-serif font-bold text-lg text-slate-800">
                Trash is empty (कचरा खाली है)
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No deleted stories in the database recovery table. Any story you delete will be archived here for safe recovery.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg text-xs flex items-center justify-between">
                <span>
                  <strong>Database Recovery Archive:</strong> Deleted stories are stored in <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">public.deleted_articles</code>. You can restore them to active articles at any time.
                </span>
                <span className="font-mono font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-amber-300">
                  {deletedArticles.length} Recoverable Stories
                </span>
              </div>
              {deletedArticles.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-red-200/80 rounded-lg p-3.5 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-20 h-14 sm:w-28 sm:h-18 rounded-md overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                      {item.featuredImageUrl ? (
                        <img src={item.featuredImageUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">No Image</div>
                      )}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-red-100 text-editorial-red text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                          Deleted / Archived
                        </span>
                        {item.categorySlug && (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                            {item.categorySlug}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 line-clamp-1 leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono flex-wrap pt-0.5">
                        <span>Author: {item.authorName || 'Staff'}</span>
                        <span>•</span>
                        <span>Deleted: {new Date(item.deletedAt).toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-slate-400">Slug: {item.slug}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end flex-wrap">
                    {onRestoreArticle && (
                      <button
                        onClick={() => {
                          if (window.confirm("Restore \"" + item.title.slice(0, 40) + "...\" back to active articles?")) {
                            onRestoreArticle(item.id);
                          }
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Restore article back to database"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Story (पुनर्स्थापित करें)</span>
                      </button>
                    )}
                    {onPermanentDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm("PERMANENT DELETE: This will permanently purge this article from recovery. Proceed?")) {
                            onPermanentDelete(item.id);
                          }
                        }}
                        className="px-3 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-300 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Permanently remove from database"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Delete Permanently</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-serif font-bold text-lg text-slate-800">
              No stories found in this section
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No articles match your current tab or search criteria. Click below to write a new story.
            </p>
            <button
              onClick={onNewArticle}
              className="px-4 py-2 bg-editorial-red text-white text-xs font-bold rounded-md hover:bg-red-800 transition-colors"
            >
              + Write New Story
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-slate-200 hover:border-slate-400 rounded-lg p-3.5 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4"
            >
              {/* Left Details: Thumbnail, Title, Category, Author, Meta */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* 16:9 Thumbnail */}
                <div className="w-20 h-14 sm:w-28 sm:h-18 rounded-md overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Category & Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(post.editorialStatus, post.isBreaking)}
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    {post.isLead && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                        ★ Homepage Lead
                      </span>
                    )}
                  </div>

                  {/* Headline */}
                  <h3 
                    onClick={() => onEditArticle(post)}
                    className="font-serif font-bold text-base sm:text-lg text-slate-900 hover:text-editorial-red cursor-pointer transition-colors line-clamp-1 leading-snug"
                    title={post.title}
                  >
                    {post.title}
                  </h3>

                  {/* Subheadline Snippet */}
                  {post.dek && (
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {post.dek}
                    </p>
                  )}

                  {/* Author Byline & Timestamps */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono flex-wrap pt-0.5">
                    <span className="font-semibold text-slate-700">
                      By {mockAuthors[post.authorId]?.name || 'Staff Reporter'}
                    </span>
                    <span>•</span>
                    <span>{post.wordCount} words</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                    <span>•</span>
                    <span>Updated today</span>
                  </div>
                </div>
              </div>

              {/* Right: Clean Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end flex-wrap">
                <button
                  onClick={() => onEditArticle(post)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open story in article editor"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Story (संपादित करें)</span>
                </button>

                {post.editorialStatus === 'review' && permissions.canApprove && (
                  <button
                    onClick={() => onApprovePost(post)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve (मंजूर करें)</span>
                  </button>
                )}

                {post.editorialStatus !== 'published' && permissions.canPublish && (
                  <button
                    onClick={() => onPublishPostDirect(post)}
                    className="px-3.5 py-2 bg-editorial-red hover:bg-red-800 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publish (प्रकाशित करें)</span>
                  </button>
                )}

                <button
                  onClick={() => onViewLiveStory(post)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="View live article on reader website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Live ↗</span>
                </button>

                {onDeleteArticle && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to move \"" + post.title.slice(0, 40) + "...\" to Trash / Recovery?")) {
                        onDeleteArticle(post);
                      }
                    }}
                    className="px-2.5 py-2 bg-red-50 hover:bg-red-100 text-editorial-red border border-red-200 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Move story to Trash / Database Recovery"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
