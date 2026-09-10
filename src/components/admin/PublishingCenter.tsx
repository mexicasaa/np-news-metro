import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Search, Filter, Eye, Edit3, CheckCircle2, 
  Clock, Flame, Trash2, ExternalLink, MoreVertical, FileText,
  Calendar, Globe, X, ChevronLeft, ChevronRight, ChevronDown,
  RotateCcw, MessageSquare, AlertTriangle, Check
} from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { DeletedArticle } from '../../services/articleService';
import { 
  UserRole, EditorialStatus, ROLE_PERMISSIONS 
} from '../../types/admin';
import { mockAuthors, mockCategories } from '../../data/mockWpData';
import { getStoredPosts, isPostPublished } from '../../utils/newsStorage';

export type PublishingTab = 
  | 'all'
  | 'drafts'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'breaking'
  | 'failed'
  | 'trash';

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
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'status' | 'category' | 'author' | 'date' | 'pageSize' | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close actions menu or filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
      const target = event.target as HTMLElement;
      if (!target.closest?.('[data-filter-dropdown]')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published (लाइव)' },
    { value: 'drafts', label: 'Drafts (ड्राफ्ट)' },
    { value: 'review', label: 'Needs Review (रिव्यू)' },
    { value: 'approved', label: 'Approved (मंजूर)' },
    { value: 'scheduled', label: 'Scheduled (शेड्यूल)' },
    { value: 'breaking', label: 'Breaking News' },
  ];

  const sectionOptions = useMemo(() => [
    { value: 'all', label: 'All Sections' },
    ...mockCategories.map((c) => ({ value: c.slug, label: c.name })),
  ], []);

  const authorOptions = useMemo(() => [
    { value: 'all', label: 'All Reporters' },
    ...Object.values(mockAuthors).map((a) => ({ value: a.id, label: a.name })),
  ], []);

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Past 7 Days' },
    { value: 'month', label: 'Past 30 Days' },
  ];

  const pageSizeOptions = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
  ];

  const permissions = ROLE_PERMISSIONS[userRole];
  const allPosts = externalPosts && externalPosts.length > 0 ? externalPosts : getStoredPosts();

  const publishedTitles = useMemo(() => {
    return new Set(
      allPosts
        .filter(p => isPostPublished(p) || p.status === 'published' || p.editorialStatus === 'published')
        .map(p => (p.title || '').trim().toLowerCase())
        .filter(Boolean)
    );
  }, [allPosts]);

  // Extended posts with status & word counts
  const extendedPosts = useMemo(() => {
    return allPosts.map((post: any) => {
      const isPubBySelf = isPostPublished(post) || post.status === 'published' || post.editorialStatus === 'published';
      const isPubByMatch = Boolean(post.title && publishedTitles.has(post.title.trim().toLowerCase()));
      const isPub = isPubBySelf || isPubByMatch;
      const status: EditorialStatus = isPub ? 'published' : (post.editorialStatus || post.status || 'draft');
      
      return {
        ...post,
        editorialStatus: status as EditorialStatus,
        wordCount: post.blocks ? post.blocks.reduce((acc: number, b: any) => acc + (b.content?.split(/\s+/).length || 0), 0) : Math.floor((post.dek?.length || 80) * 3),
        scheduledFor: status === 'scheduled' ? (post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'Scheduled') : undefined,
      };
    });
  }, [allPosts, publishedTitles]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return extendedPosts.filter((post) => {
      // Status Filter
      if (activeStatusFilter !== 'all') {
        if (activeStatusFilter === 'drafts') {
          if (post.editorialStatus !== 'draft' || isPostPublished(post) || post.status === 'published') return false;
          if (post.title && publishedTitles.has(post.title.trim().toLowerCase())) return false;
        } else if (activeStatusFilter === 'published') {
          if (post.editorialStatus !== 'published' && !isPostPublished(post) && post.status !== 'published') return false;
        } else if (activeStatusFilter === 'review' && post.editorialStatus !== 'review') {
          return false;
        } else if (activeStatusFilter === 'approved' && post.editorialStatus !== 'approved') {
          return false;
        } else if (activeStatusFilter === 'scheduled' && post.editorialStatus !== 'scheduled') {
          return false;
        } else if (activeStatusFilter === 'breaking' && !post.isBreaking && !post.isLead) {
          return false;
        }
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = post.title?.toLowerCase().includes(q);
        const dekMatch = post.dek?.toLowerCase().includes(q);
        const tagMatch = post.tags?.some((t: string) => t.toLowerCase().includes(q));
        const slugMatch = post.slug?.toLowerCase().includes(q);
        if (!titleMatch && !dekMatch && !tagMatch && !slugMatch) return false;
      }

      // Section (Category) Filter
      if (selectedCategoryFilter !== 'all' && post.category !== selectedCategoryFilter) {
        return false;
      }

      // Author Filter
      if (selectedAuthorFilter !== 'all') {
        const authorMatch = post.authorId === selectedAuthorFilter || 
          (post.customAuthor?.name && post.customAuthor.name.toLowerCase().includes(selectedAuthorFilter.toLowerCase()));
        if (!authorMatch) return false;
      }

      // Date Filter
      if (selectedDateFilter !== 'all') {
        const postTime = new Date(post.publishedAt || post.updatedAt || Date.now()).getTime();
        const now = Date.now();
        if (selectedDateFilter === 'today' && now - postTime > 24 * 60 * 60 * 1000) return false;
        if (selectedDateFilter === 'week' && now - postTime > 7 * 24 * 60 * 60 * 1000) return false;
        if (selectedDateFilter === 'month' && now - postTime > 30 * 24 * 60 * 60 * 1000) return false;
      }

      return true;
    });
  }, [extendedPosts, activeStatusFilter, searchQuery, selectedCategoryFilter, selectedAuthorFilter, selectedDateFilter, publishedTitles]);

  // Deduplicate stories by title/id
  const displayedPosts = useMemo(() => {
    const seen = new Set<string>();
    return filteredPosts.filter((post) => {
      const key = (post.title || post.id).trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredPosts]);

  // Paginated Posts Slice
  const totalPages = Math.max(1, Math.ceil(displayedPosts.length / pageSize));
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return displayedPosts.slice(startIndex, startIndex + pageSize);
  }, [displayedPosts, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryFilter, selectedAuthorFilter, selectedDateFilter, activeStatusFilter, pageSize]);

  // Select all handler
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedPosts.map(p => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Helper for reporter name & initials
  const getReporterDetails = (post: any) => {
    const name = post.customAuthor?.name || post.authorName || mockAuthors[post.authorId]?.name || 'Staff Reporter';
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((part: string) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'SK';
    return { name, initials };
  };

  // Helper for human relative time
  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Updated today';
    const postDate = new Date(dateStr).getTime();
    if (isNaN(postDate)) return 'Updated today';
    const diffMs = Date.now() - postDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Status Badge Component
  const renderStatusPill = (status: EditorialStatus, isBreaking?: boolean) => {
    if (isBreaking) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200/80 animate-pulse whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          <span>Breaking</span>
        </span>
      );
    }
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Published</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Needs Review</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            <span>Approved</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Scheduled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Draft</span>
          </span>
        );
    }
  };

  // Section Badge styling matching design
  const renderSectionBadge = (category: string) => {
    const cat = (category || 'general').toLowerCase();
    let colorClass = 'bg-slate-100 text-slate-600';
    if (cat === 'politics') colorClass = 'bg-blue-50 text-blue-600';
    else if (cat === 'india') colorClass = 'bg-purple-50 text-purple-600';
    else if (cat === 'astrology') colorClass = 'bg-pink-50 text-pink-600';
    else if (cat === 'business') colorClass = 'bg-sky-50 text-sky-600';
    else if (cat === 'sports') colorClass = 'bg-orange-50 text-orange-600';
    else if (cat === 'entertainment') colorClass = 'bg-fuchsia-50 text-fuchsia-600';
    else if (cat === 'technology') colorClass = 'bg-cyan-50 text-cyan-600';
    else if (cat === 'lifestyle') colorClass = 'bg-emerald-50 text-emerald-600';
    else if (cat === 'world') colorClass = 'bg-indigo-50 text-indigo-600';

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${colorClass}`}>
        {cat}
      </span>
    );
  };

  return (
    <div className="w-full space-y-4 font-sans animate-fadeIn">
      
      {/* ======================================================================
          MAIN STORIES CARD (Frosted Glass Card matching design)
          ====================================================================== */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-3xl p-5 sm:p-6 space-y-5">
        
        {/* ====================================================================
            HEADER & ACTIONS: Clean Two-Tier Architecture (Zero Overlap & Never Squeezed)
            ==================================================================== */}
        <div className="space-y-3.5">
          
          {/* Row 1: Title & Total Count (Left) + Action Buttons (Right) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100/70">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-sans font-bold text-2xl sm:text-[28px] text-slate-900 tracking-tight leading-none">
                  Stories
                </h2>
                <span className="h-6 px-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center justify-center shadow-2xs">
                  {displayedPosts.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-normal leading-tight">
                Manage and publish your news stories
              </p>
            </div>

            {/* Primary Action Buttons (Right Aligned on Row 1) */}
            <div className="flex items-center gap-2.5 shrink-0">
              {permissions.canPublishBreaking && (
                <button
                  onClick={onEmergencyBreaking}
                  className="h-9 px-3.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                  title="Broadcast Emergency Breaking Story"
                >
                  <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  <span>Breaking</span>
                </button>
              )}

              <button
                onClick={onNewArticle}
                className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Story</span>
              </button>
            </div>
          </div>

          {/* Row 2: Filter Strip (Left) + Full-Width Search Input (Right) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            
            {/* Filter Dropdowns (Equal Height h-9 with Custom Frosted Popovers) */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              
              {/* Status Filter */}
              <div data-filter-dropdown="true" className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                  className={`h-9 bg-white border border-slate-200/80 rounded-xl px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/80 flex items-center gap-2 cursor-pointer select-none transition-all ${
                    openDropdown === 'status' ? 'ring-2 ring-slate-900/10 border-slate-400 bg-slate-50' : ''
                  }`}
                >
                  <span className="truncate max-w-[130px]">
                    {statusOptions.find((o) => o.value === activeStatusFilter)?.label || 'All Status'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openDropdown === 'status' ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'status' && (
                  <div className="absolute top-full left-0 mt-1.5 min-w-[185px] max-h-64 overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl p-1.5 z-50 text-xs text-left animate-fadeIn space-y-0.5 hide-scrollbar">
                    {statusOptions.map((opt) => {
                      const isSelected = activeStatusFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setActiveStatusFilter(opt.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors text-left ${
                            isSelected
                              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section Filter */}
              <div data-filter-dropdown="true" className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                  className={`h-9 bg-white border border-slate-200/80 rounded-xl px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/80 flex items-center gap-2 cursor-pointer select-none transition-all ${
                    openDropdown === 'category' ? 'ring-2 ring-slate-900/10 border-slate-400 bg-slate-50' : ''
                  }`}
                >
                  <span className="truncate max-w-[130px] uppercase">
                    {sectionOptions.find((o) => o.value === selectedCategoryFilter)?.label || 'All Sections'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openDropdown === 'category' ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'category' && (
                  <div className="absolute top-full left-0 mt-1.5 min-w-[170px] max-h-64 overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl p-1.5 z-50 text-xs text-left animate-fadeIn space-y-0.5 hide-scrollbar">
                    {sectionOptions.map((opt) => {
                      const isSelected = selectedCategoryFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter(opt.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors text-left ${
                            isSelected
                              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate uppercase">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reporter Filter */}
              <div data-filter-dropdown="true" className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'author' ? null : 'author')}
                  className={`h-9 bg-white border border-slate-200/80 rounded-xl px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/80 flex items-center gap-2 cursor-pointer select-none transition-all ${
                    openDropdown === 'author' ? 'ring-2 ring-slate-900/10 border-slate-400 bg-slate-50' : ''
                  }`}
                >
                  <span className="truncate max-w-[130px]">
                    {authorOptions.find((o) => o.value === selectedAuthorFilter)?.label || 'All Reporters'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openDropdown === 'author' ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'author' && (
                  <div className="absolute top-full left-0 mt-1.5 min-w-[185px] max-h-64 overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl p-1.5 z-50 text-xs text-left animate-fadeIn space-y-0.5 hide-scrollbar">
                    {authorOptions.map((opt) => {
                      const isSelected = selectedAuthorFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedAuthorFilter(opt.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors text-left ${
                            isSelected
                              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date Filter (Matching UI Design) */}
              <div data-filter-dropdown="true" className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
                  className={`h-9 bg-white border border-slate-200/80 rounded-xl px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/80 flex items-center gap-2 cursor-pointer select-none transition-all ${
                    openDropdown === 'date' ? 'ring-2 ring-slate-900/10 border-slate-400 bg-slate-50' : ''
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[130px]">
                    {dateOptions.find((o) => o.value === selectedDateFilter)?.label || 'All Time'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openDropdown === 'date' ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'date' && (
                  <div className="absolute top-full left-0 mt-1.5 min-w-[160px] max-h-64 overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl p-1.5 z-50 text-xs text-left animate-fadeIn space-y-0.5 hide-scrollbar">
                    {dateOptions.map((opt) => {
                      const isSelected = selectedDateFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedDateFilter(opt.value as any);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors text-left ${
                            isSelected
                              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Search Input (Far Right - Wide & NEVER Squeezed) */}
            <div className="relative w-full md:w-72 lg:w-80 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by headline, keyword, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-white border border-slate-200/80 rounded-xl pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Selected Items Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs shadow-md animate-fadeIn">
            <span className="font-semibold">
              {selectedIds.length} {selectedIds.length === 1 ? 'story' : 'stories'} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium cursor-pointer transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================
            STORIES TABLE (Exact Column Hierarchy & Alignment)
            ====================================================================== */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100/90 hide-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-3 px-4 w-12 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={paginatedPosts.length > 0 && selectedIds.length === paginatedPosts.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 font-semibold align-middle">Story</th>
                <th className="py-3 px-4 font-semibold align-middle w-32">Status</th>
                <th className="py-3 px-4 font-semibold align-middle w-28">Section</th>
                <th className="py-3 px-4 font-semibold align-middle w-36">Reporter</th>
                <th className="py-3 px-4 font-semibold align-middle w-28">Updated</th>
                <th className="py-3 px-4 pr-5 text-right font-semibold align-middle w-16">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/80">
              {paginatedPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-800">No stories match your search or filter</p>
                    <p className="text-xs text-slate-400 mt-1">Try selecting different filters or clear your search query.</p>
                  </td>
                </tr>
              ) : (
                paginatedPosts.map((post) => {
                  const reporter = getReporterDetails(post);
                  const isSelected = selectedIds.includes(post.id);

                  return (
                    <tr 
                      key={post.id}
                      className={`hover:bg-slate-50/70 transition-colors group ${
                        isSelected ? 'bg-slate-50/90' : ''
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td className="py-3.5 px-4 w-12 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(post.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* Story Column: Thumbnail + Headline + Metrics */}
                      <td className="py-3.5 px-4 min-w-[280px] max-w-md align-middle">
                        <div className="flex items-center gap-3">
                          {/* 16:9 Rounded Thumbnail */}
                          <div className="w-18 h-12 sm:w-20 sm:h-13 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-100 shadow-2xs">
                            <img
                              src={post.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=300'}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Headline & Meta row */}
                          <div className="min-w-0 flex-1">
                            <h3
                              onClick={() => onEditArticle(post)}
                              className="font-medium text-xs sm:text-sm text-slate-900 hover:text-red-600 transition-colors cursor-pointer line-clamp-1 leading-snug"
                              title={post.title}
                            >
                              {post.title}
                            </h3>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-sans">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-slate-400" />
                                <span>{post.viewsCount ? (post.viewsCount >= 1000 ? `${(post.viewsCount / 1000).toFixed(1)}K` : post.viewsCount) : '1.2K'}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-slate-400" />
                                <span>{post.commentCount || 12}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{post.readTime || '5 min read'}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        {renderStatusPill(post.editorialStatus, post.isBreaking)}
                      </td>

                      {/* Section Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        {renderSectionBadge(post.category)}
                      </td>

                      {/* Reporter Column: Initials Circle + Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {reporter.initials}
                          </div>
                          <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                            {reporter.name}
                          </span>
                        </div>
                      </td>

                      {/* Updated Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 align-middle">
                        {getRelativeTime(post.updatedAt || post.publishedAt)}
                      </td>

                      {/* Actions Column: Three Dots Dropdown Menu */}
                      <td className="py-3.5 px-4 pr-5 text-right whitespace-nowrap align-middle relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer ml-auto"
                          title="Story Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === post.id && (
                          <div 
                            ref={menuRef}
                            className="absolute right-5 mt-1 w-44 bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl p-1.5 z-40 text-xs text-left animate-fadeIn space-y-0.5"
                          >
                            <button
                              onClick={() => {
                                onEditArticle(post);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-medium cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit Story</span>
                            </button>

                            <button
                              onClick={() => {
                                onViewLiveStory(post);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-medium cursor-pointer transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Live ↗</span>
                            </button>

                            {post.editorialStatus !== 'published' && permissions.canPublish && (
                              <button
                                onClick={() => {
                                  onPublishPostDirect(post);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl font-semibold cursor-pointer transition-colors"
                              >
                                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Publish Live</span>
                              </button>
                            )}

                            {onDeleteArticle && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Move "${post.title.slice(0, 40)}..." to Trash / Recovery?`)) {
                                    onDeleteArticle(post);
                                  }
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium cursor-pointer transition-colors border-t border-slate-100"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                <span>Move to Trash</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ======================================================================
            TABLE FOOTER (Matching Screenshot: Show [10 ⌵] of 25 stories, < 1 2 3 >)
            ====================================================================== */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Left: Page Size Selector */}
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span>Show</span>
            <div data-filter-dropdown="true" className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'pageSize' ? null : 'pageSize')}
                className={`h-8 bg-white border border-slate-200/80 rounded-xl px-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/80 flex items-center gap-1.5 cursor-pointer select-none transition-all ${
                  openDropdown === 'pageSize' ? 'ring-2 ring-slate-900/10 border-slate-400 bg-slate-50' : ''
                }`}
              >
                <span>{pageSize}</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openDropdown === 'pageSize' ? 'rotate-180 text-slate-700' : ''
                  }`}
                />
              </button>

              {openDropdown === 'pageSize' && (
                <div className="absolute bottom-full left-0 mb-1.5 min-w-[85px] bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl p-1.5 z-50 text-xs text-left animate-fadeIn space-y-0.5 hide-scrollbar">
                  {pageSizeOptions.map((opt) => {
                    const isSelected = pageSize === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setPageSize(opt.value);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors text-left ${
                          isSelected
                            ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <span>of {displayedPosts.length} stories</span>
          </div>

          {/* Right: Pagination Navigation (< 1 2 3 >) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pNum = Math.min(currentPage - 2 + i, totalPages);
              }
              const isActive = currentPage === pNum;

              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
