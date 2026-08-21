import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Link2, Quote, List, AlignLeft, AlignCenter, AlignRight, 
  Bold, Italic, Settings, X, ChevronDown, ChevronUp, Eye, FileText, Search,
  ImagePlus, ExternalLink, RefreshCw, ArrowLeft, CheckCircle2, Sparkles,
  HelpCircle, Globe, Clock, ShieldCheck, Tag, Layout, Type, AlertCircle,
  UserCheck, Calendar, User, Image as ImageIcon, Trash2, ArrowUp, ArrowDown,
  Plus, Check, MapPin, Newspaper, FileCheck, Award, Flame
} from 'lucide-react';
import { WpPost, EditorialCategorySlug, GutenbergBlock } from '../../types/wordpress';
import { UserRole, EditorialStatus } from '../../types/admin';
import { StandardArticleTemplate } from '../../templates/04_StandardArticleTemplate';

export interface EditorBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'pullquote';
  content?: string;
  level?: 2 | 3;
  imageUrl?: string;
  imageCaption?: string;
  imageCredit?: string;
}

interface ArticleEditorProps {
  initialPost?: WpPost;
  userRole: UserRole;
  currentAuthorId: string;
  onSaveDraft: (postData: Partial<WpPost>) => void;
  onSubmitForReview?: (postData: Partial<WpPost>) => void;
  onApproveCopy?: (postData: Partial<WpPost>) => void;
  onSchedulePost?: (postData: Partial<WpPost>, scheduleTime: string) => void;
  onRunReadinessCheck?: (postData: Partial<WpPost>) => void;
  onPublishNow: (postData: Partial<WpPost>) => void;
  onBack?: () => void;
  onOpenRevisions?: () => void;
}

const CATEGORIES_LIST: { slug: EditorialCategorySlug; label: string; color: string }[] = [
  { slug: 'india', label: 'National / India', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { slug: 'politics', label: 'Politics', color: 'bg-red-50 text-red-800 border-red-200' },
  { slug: 'business', label: 'Business & Economy', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { slug: 'technology', label: 'Technology', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { slug: 'world', label: 'World News', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { slug: 'sports', label: 'Sports', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { slug: 'entertainment', label: 'Entertainment', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { slug: 'lifestyle', label: 'Lifestyle', color: 'bg-pink-50 text-pink-800 border-pink-200' },
  { slug: 'opinion', label: 'Opinion / Editorial', color: 'bg-slate-100 text-slate-800 border-slate-300' },
];

const ARTICLE_TYPES = [
  'Standard News Report',
  'Breaking Flash',
  'In-Depth Analysis',
  'Editorial / Opinion',
  'Exclusive Investigation',
  'Explainer / Q&A',
  'Live Blog Dispatch'
];

const AUTHORS_LIST = [
  { id: 'author-1', name: 'Siddharth Varma', role: 'Senior National Affairs Editor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
  { id: 'author-2', name: 'Ananya Deshmukh', role: 'Chief Economics Correspondent', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400' },
  { id: 'author-3', name: 'Rohan Sen', role: 'Technology & Geopolitics Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
  { id: 'author-4', name: 'Prof. K. R. Nambiar', role: 'Contributing Columnist & Scholar', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
  { id: 'author-desk', name: 'NP News Metro Desk', role: 'Editorial Staff Dispatch', avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=400' },
];

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialPost,
  userRole,
  currentAuthorId,
  onSaveDraft,
  onPublishNow,
  onBack,
}) => {
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const authorAvatarInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initialPost?.title || '');
  const [dek, setDek] = useState(initialPost?.dek || '');
  
  const [content, setContent] = useState(() => {
    if (initialPost?.blocks && initialPost.blocks.length > 0) {
      return initialPost.blocks.map(b => {
        if (b.type === 'image') return `![${b.imageCaption || 'Image'}](${b.imageUrl || ''})`;
        if (b.type === 'heading') return `## ${b.content}`;
        if (b.type === 'pullquote') return `> "${b.content}"`;
        return b.content;
      }).join('\n\n');
    }
    return '';
  });

  const [category, setCategory] = useState<EditorialCategorySlug>(
    (initialPost?.category as EditorialCategorySlug) || 'india'
  );
  const [subcategory, setSubcategory] = useState('National Policy');
  const [articleType, setArticleType] = useState('Standard News Report');
  const [location, setLocation] = useState('New Delhi');
  const [sourceAgency, setSourceAgency] = useState('NP News Metro Special Bureau');
  const [tags, setTags] = useState<string[]>(initialPost?.tags || ['National News', 'Policy', 'Breaking']);
  const [tagInput, setTagInput] = useState('');

  const [authorType, setAuthorType] = useState<'staff' | 'external'>(
    initialPost?.customAuthor?.name ? 'external' : 'staff'
  );
  const [authorId, setAuthorId] = useState<string>(
    initialPost?.authorId || currentAuthorId || 'author-1'
  );
  const [customAuthorName, setCustomAuthorName] = useState<string>(
    initialPost?.customAuthor?.name || ''
  );
  const [customAuthorRole, setCustomAuthorRole] = useState<string>(
    initialPost?.customAuthor?.role || 'Guest Contributor'
  );
  const [customAuthorAvatar, setCustomAuthorAvatar] = useState<string>(
    initialPost?.customAuthor?.avatar || ''
  );

  const [status, setStatus] = useState<EditorialStatus>('draft');
  const [visibility, setVisibility] = useState('Public');
  const [isBreaking, setIsBreaking] = useState(initialPost?.isBreaking || false);
  const [publishDateType, setPublishDateType] = useState<'now' | 'custom'>('now');
  const [customPublishDate, setCustomPublishDate] = useState<string>(() => {
    if (initialPost?.publishedAt) {
      try {
        const d = new Date(initialPost.publishedAt);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      } catch (e) {}
    }
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  const [featuredImage, setFeaturedImage] = useState(initialPost?.featuredImage || '');
  const [imageCredit, setImageCredit] = useState(initialPost?.imageCredit || 'NP News Metro Photo Desk');
  const [imageCaption, setImageCaption] = useState(initialPost?.imageCaption || '');
  const [imageAlt, setImageAlt] = useState(initialPost?.imageAlt || '');

  const [primaryTopic, setPrimaryTopic] = useState('National Affairs');
  const [focusKeyphrase, setFocusKeyphrase] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialPost?.seoDescription || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');

  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState<number | null>(null);

  const [boxesOpen, setBoxesOpen] = useState({
    publish: true,
    author: true,
    featuredImage: true,
    details: true,
    seo: true,
    seoCheck: true,
    tags: true
  });

  const toggleBox = (box: keyof typeof boxesOpen) => {
    setBoxesOpen(prev => ({ ...prev, [box]: !prev[box] }));
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialPost && title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60));
    }
  }, [title, initialPost, slug]);

  // Synchronize state when initialPost changes (editing different articles)
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || '');
      setDek(initialPost.dek || '');
      if (initialPost.blocks && initialPost.blocks.length > 0) {
        setContent(initialPost.blocks.map(b => {
          if (b.type === 'image') return `![${b.imageCaption || 'Image'}](${b.imageUrl || ''})`;
          if (b.type === 'heading') return `## ${b.content}`;
          if (b.type === 'pullquote') return `> "${b.content}"`;
          return b.content;
        }).join('\n\n'));
      } else {
        setContent(initialPost.dek || '');
      }
      setCategory((initialPost.category as EditorialCategorySlug) || 'india');
      setTags(initialPost.tags || ['National News', 'Policy', 'Breaking']);
      setAuthorType(initialPost.customAuthor?.name ? 'external' : 'staff');
      setAuthorId(initialPost.authorId || currentAuthorId || 'author-1');
      setCustomAuthorName(initialPost.customAuthor?.name || '');
      setCustomAuthorRole(initialPost.customAuthor?.role || 'Guest Contributor');
      setCustomAuthorAvatar(initialPost.customAuthor?.avatar || '');
      setIsBreaking(initialPost.isBreaking || false);
      setFeaturedImage(initialPost.featuredImage || '');
      setImageCredit(initialPost.imageCredit || 'NP News Metro Photo Desk');
      setImageCaption(initialPost.imageCaption || '');
      setImageAlt(initialPost.imageAlt || '');
      setSeoTitle(initialPost.seoTitle || '');
      setMetaDescription(initialPost.seoDescription || '');
      setSlug(initialPost.slug || '');
    }
  }, [initialPost?.id]);

  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFeaturedImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAuthorAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setCustomAuthorAvatar(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleStartInlineImage = () => {
    if (textareaRef.current) {
      setCursorPos(textareaRef.current.selectionStart);
    }
    inlineImageInputRef.current?.click();
  };

  const handleInlineImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const cleanCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const objectUrl = ev.target.result as string;
          const imageTag = `\n\n![${cleanCaption}](${objectUrl})\n\n`;
          const pos = cursorPos !== null ? cursorPos : (textareaRef.current?.selectionStart ?? content.length);
          const newContent = content.substring(0, pos) + imageTag + content.substring(pos);
          setContent(newContent);
          setCursorPos(null);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const insertTextFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end) || 'text';
    const replacement = `${before}${selectedText}${after}`;
    const newContent = previousText.substring(0, start) + replacement + previousText.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  const parseBlocks = (textContent: string): GutenbergBlock[] => {
    return textContent.split('\n\n').filter(p => p.trim()).map((chunk, i) => {
      const imgMatch = chunk.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        return {
          id: `img-${i}`,
          type: 'image',
          imageUrl: imgMatch[2],
          imageCaption: imgMatch[1],
          imageCredit: 'NP News Metro Photo Archive',
          content: '',
        } as GutenbergBlock;
      }
      
      const h2Match = chunk.match(/^##\s+(.*)$/);
      if (h2Match) {
        return {
          id: `h2-${i}`,
          type: 'heading',
          level: 2,
          content: h2Match[1],
        } as GutenbergBlock;
      }

      const h3Match = chunk.match(/^###\s+(.*)$/);
      if (h3Match) {
        return {
          id: `h3-${i}`,
          type: 'heading',
          level: 3,
          content: h3Match[1],
        } as GutenbergBlock;
      }

      const quoteMatch = chunk.match(/^>\s+"?(.*?)"?$/);
      if (quoteMatch) {
        return {
          id: `quote-${i}`,
          type: 'pullquote',
          content: quoteMatch[1],
        } as GutenbergBlock;
      }
      
      return {
        id: `p-${i}`,
        type: 'paragraph',
        content: chunk.trim(),
      } as GutenbergBlock;
    });
  };

  const parsedBlocks = parseBlocks(content);
  const inlineImages = parsedBlocks.filter(b => b.type === 'image');

  const handleUpdateImageCaption = (oldUrl: string, newCaption: string) => {
    const updated = content.replace(
      new RegExp(`!\\[(.*?)\\]\\(${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
      `![${newCaption}](${oldUrl})`
    );
    setContent(updated);
  };

  const handleRemoveInlineImage = (urlToRemove: string) => {
    const updated = content.replace(
      new RegExp(`!\\[(.*?)\\]\\(${urlToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)(\\n\\n)?`, 'g'),
      ''
    );
    setContent(updated);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const getCalculatedPublishDate = (): string => {
    if (publishDateType === 'custom' && customPublishDate) {
      try {
        return new Date(customPublishDate).toISOString();
      } catch (e) {}
    }
    return new Date().toISOString();
  };

  const getPostData = (): Partial<WpPost> => ({
    id: initialPost?.id || `post-${Date.now()}`,
    title: title || 'Auto Draft',
    titleHi: title || 'Auto Draft',
    slug: slug || 'auto-draft',
    category,
    authorId: authorId,
    customAuthor: authorType === 'external' && customAuthorName.trim() ? {
      name: customAuthorName.trim(),
      role: customAuthorRole.trim() || 'Guest Contributor',
      avatar: customAuthorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      isGuest: true
    } : undefined,
    tags,
    featuredImage: featuredImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
    imageCredit: imageCredit,
    imageCaption: imageCaption,
    imageAlt: imageAlt || title,
    isBreaking: isBreaking,
    seoTitle: seoTitle || title,
    seoDescription: metaDescription || dek || title,
    blocks: parsedBlocks,
    publishedAt: getCalculatedPublishDate(),
    updatedAt: new Date().toISOString(),
    viewsCount: 0,
    commentCount: 0,
    dek: dek || '',
    readTime: `${readTimeMin} min read`,
    sharesCount: 0
  });

  useEffect(() => {
    setIsSaving(true);
    const postData = getPostData();
    try {
      localStorage.setItem('np_news_preview_draft', JSON.stringify(postData));
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('np_news_preview_channel');
        channel.postMessage({ type: 'UPDATE_PREVIEW', post: postData });
        channel.close();
      }
    } catch (err) {}
    
    const timer = setTimeout(() => {
      setIsSaving(false);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 400);

    return () => clearTimeout(timer);
  }, [title, dek, content, category, subcategory, articleType, location, sourceAgency, authorType, authorId, customAuthorName, customAuthorRole, customAuthorAvatar, publishDateType, customPublishDate, tags, featuredImage, imageCredit, imageCaption, imageAlt, isBreaking, seoTitle, metaDescription, slug, primaryTopic, focusKeyphrase, secondaryKeywords]);

  const handleOpenNewTabPreview = () => {
    const postData = getPostData();
    try {
      localStorage.setItem('np_news_preview_draft', JSON.stringify(postData));
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('np_news_preview_channel');
        channel.postMessage({ type: 'UPDATE_PREVIEW', post: postData });
        channel.close();
      }
    } catch (err) {}
    const previewUrl = window.location.origin + window.location.pathname + '?preview=true';
    window.open(previewUrl, '_blank');
  };

  const selectedAuthor = AUTHORS_LIST.find(a => a.id === authorId) || AUTHORS_LIST[0];

  // Dynamic SEO Checklist
  const seoChecklist = [
    { label: 'Keyword / topic covered in story', passed: focusKeyphrase ? content.toLowerCase().includes(focusKeyphrase.toLowerCase()) || title.toLowerCase().includes(focusKeyphrase.toLowerCase()) : false },
    { label: 'Headline character length optimal (40-90)', passed: title.length >= 40 && title.length <= 90 },
    { label: 'Subheadline (Dek) or Meta description ready', passed: (metaDescription || dek).length >= 40 },
    { label: 'Featured hero image set (16:9 ratio)', passed: !!featuredImage },
    { label: 'Photo Alt text configured for accessibility', passed: !!(imageAlt || imageCaption) },
    { label: 'Author byline accreditation assigned', passed: authorType === 'external' ? !!customAuthorName.trim() : !!authorId },
    { label: 'Source accreditation established', passed: !!sourceAgency.trim() },
    { label: 'Desk category & subcategory mapped', passed: !!category && !!subcategory },
    { label: 'Canonical URL slug ready', passed: !!slug && slug.length >= 3 },
  ];

  const seoPassedCount = seoChecklist.filter(item => item.passed).length;
  const seoPercentage = Math.round((seoPassedCount / seoChecklist.length) * 100);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-24 antialiased selection:bg-[#162839] selection:text-white">
      {/* Hidden Upload Inputs */}
      <input type="file" ref={featuredImageInputRef} onChange={handleFeaturedImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={inlineImageInputRef} onChange={handleInlineImageSelected} accept="image/*" className="hidden" />
      <input type="file" ref={authorAvatarInputRef} onChange={handleAuthorAvatarUpload} accept="image/*" className="hidden" />

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Back to Publishing Center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg">
                  {initialPost ? 'Edit Article' : 'Article Creator'}
                </span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Publishing Center
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`}></span>
                  {isSaving ? 'Syncing...' : `Autosaved at ${lastSavedTime}`}
                </span>
                <span>•</span>
                <span>By: <strong className="text-slate-600">{authorType === 'external' && customAuthorName.trim() ? customAuthorName.trim() : selectedAuthor.name}</strong></span>
                <span>•</span>
                <span>{wordCount} words</span>
                <span>•</span>
                <span className="font-semibold text-emerald-600">SEO: {seoPassedCount}/{seoChecklist.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenNewTabPreview}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Preview in new tab with real-time sync"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Preview Tab</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Modal View</span>
            </button>

            <button
              type="button"
              onClick={() => onPublishNow(getPostData())}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Story</span>
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-[1340px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          <div className="flex-1 w-full space-y-6">
            
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              
              <div className="p-6 sm:p-8 pb-4 space-y-4">
                
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
                    <span className="font-bold text-slate-600 uppercase tracking-wider">Headline</span>
                    <span className={title.length > 90 || title.length < 40 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {title.length}/90 chars (Recommended 40-90)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter main article headline here..."
                    className="w-full text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 placeholder:text-slate-300 border-none focus:outline-hidden bg-transparent leading-snug tracking-tight"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
                    <span className="font-bold text-slate-600 uppercase tracking-wider">Subheadline (Dek) / Lead Summary</span>
                    <span>Optional</span>
                  </div>
                  <textarea
                    rows={2}
                    value={dek}
                    onChange={(e) => setDek(e.target.value)}
                    placeholder="Write a compelling 1-2 sentence executive summary (Dek)..."
                    className="w-full text-base sm:text-lg text-slate-600 font-sans placeholder:text-slate-300 border-none focus:outline-hidden bg-transparent resize-none leading-relaxed"
                  />
                </div>

                {title && (
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-400 truncate">https://npnewsmetro.in/{category}/</span>
                    <span className="font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded shrink-0">{slug}</span>
                  </div>
                )}
              </div>

              <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5 border-y border-slate-100 bg-slate-50/95 backdrop-blur-xs">
                <div className="flex flex-wrap items-center gap-1">
                  
                  <button
                    type="button"
                    onClick={handleStartInlineImage}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors mr-1 cursor-pointer shadow-2xs"
                    title="Insert photo at cursor position with instant visual preview"
                  >
                    <ImagePlus className="w-4 h-4 text-blue-600" />
                    <span>+ Insert Image at Cursor</span>
                  </button>

                  <div className="w-px h-5 bg-slate-200 mx-1"></div>

                  <button
                    type="button"
                    onClick={() => insertTextFormatting('## ', '')}
                    className="px-2.5 py-1 text-xs font-bold font-serif text-slate-700 hover:text-blue-600 hover:bg-white rounded transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('### ', '')}
                    className="px-2.5 py-1 text-xs font-bold font-serif text-slate-700 hover:text-blue-600 hover:bg-white rounded transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Heading 3"
                  >
                    H3
                  </button>

                  <div className="w-px h-5 bg-slate-200 mx-1"></div>

                  <button
                    type="button"
                    onClick={() => insertTextFormatting('**', '**')}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('*', '*')}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('> "', '"')}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Pull Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('\n- ', '')}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('[Link Text](', 'https://)')}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Add Hyperlink"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  {wordCount} words • {readTimeMin} min read
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing the full story body here...&#10;&#10;💡 Place cursor anywhere and click '+ Insert Image at Cursor' to add a photo!&#10;💡 Use 'H2' or 'H3' to divide your story into sections.&#10;💡 Use 'Bold' or 'Italic' to emphasize keywords."
                  className="w-full text-base sm:text-lg leading-relaxed text-slate-800 font-serif border-none focus:outline-hidden resize-y min-h-[380px] bg-white placeholder:text-slate-300"
                />
              </div>

              {inlineImages.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Embedded Article Photos ({inlineImages.length})
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400">Live preview of photos in story paragraphs</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {inlineImages.map((img, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2.5 relative group">
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                          <img src={img.imageUrl} alt={img.imageCaption || 'Photo'} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveInlineImage(img.imageUrl || '')}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Delete photo from article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Caption:</label>
                          <input
                            type="text"
                            value={img.imageCaption || ''}
                            onChange={(e) => handleUpdateImageCaption(img.imageUrl || '', e.target.value)}
                            placeholder="Enter image caption..."
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Interactive Editor Active</span>
                </span>
                <span>Estimated reading time: {readTimeMin} min</span>
              </div>

            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div 
                className="px-6 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none bg-slate-50/50"
                onClick={() => toggleBox('seo')}
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-800">SEO & KEYWORDS</h3>
                </div>
                {boxesOpen.seo ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {boxesOpen.seo && (
                <div className="p-6 space-y-6">
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Google Search Live Preview
                    </span>
                    <div className="text-xs text-emerald-800 font-sans truncate">
                      https://npnewsmetro.in/{category}/{slug || 'story-url'}
                    </div>
                    <div className="text-lg font-medium text-blue-700 hover:underline cursor-pointer font-sans leading-snug">
                      {seoTitle || title || 'Story Title — NP News Metro'}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed line-clamp-2">
                      {metaDescription || dek || content.slice(0, 160) || 'NP News Metro dispatch reporting on latest development in national news, policy and politics.'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Primary Topic</label>
                      <input
                        type="text"
                        value={primaryTopic}
                        onChange={(e) => setPrimaryTopic(e.target.value)}
                        placeholder="e.g. National Affairs"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Primary Focus Keyword</label>
                      <input
                        type="text"
                        value={focusKeyphrase}
                        onChange={(e) => setFocusKeyphrase(e.target.value)}
                        placeholder="e.g. parliament budget 2026"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Keywords</label>
                      <input
                        type="text"
                        value={secondaryKeywords}
                        onChange={(e) => setSecondaryKeywords(e.target.value)}
                        placeholder="Comma-separated keywords..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SEO Title (Appears in Search Engines)</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Title for search engine results..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description (150-160 chars recommended)</label>
                    <textarea
                      rows={2}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Write description shown in Google search results..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden resize-none"
                    />
                  </div>

                </div>
              )}
            </div>

          </div>

          <div className="w-full lg:w-[360px] shrink-0 space-y-5">
            
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div 
                className="px-5 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none bg-slate-50/50"
                onClick={() => toggleBox('publish')}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">PUBLISHING</h3>
                </div>
                {boxesOpen.publish ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {boxesOpen.publish && (
                <div className="p-5 space-y-4 text-sm">
                  
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleOpenNewTabPreview}
                      className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Preview in New Tab (Live Sync)</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSaveDraft(getPostData())}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors text-center cursor-pointer"
                      >
                        Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPreviewOpen(true)}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Modal Preview</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Publishing Timing:</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPublishDateType('now')}
                        className={`py-1.5 px-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                          publishDateType === 'now'
                            ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Publish Immediately
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublishDateType('custom')}
                        className={`py-1.5 px-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                          publishDateType === 'custom'
                            ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Schedule Date
                      </button>
                    </div>

                    {publishDateType === 'custom' && (
                      <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-600">Select Date & Time (IST):</label>
                        <input
                          type="datetime-local"
                          value={customPublishDate}
                          onChange={(e) => setCustomPublishDate(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Editorial Status:</span>
                      <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value as EditorialStatus)}
                        className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-semibold focus:outline-hidden"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Review / Copyedit</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Visibility:</span>
                      <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-semibold focus:outline-hidden"
                      >
                        <option value="Public">Public (All Readers)</option>
                        <option value="Subscribers">Subscribers Only</option>
                        <option value="Private">Private / Internal</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-medium text-slate-800">Mark as Breaking Story:</span>
                      <input
                        type="checkbox"
                        checked={isBreaking}
                        onChange={(e) => setIsBreaking(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onPublishNow(getPostData())}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Story</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div 
                className="px-5 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none bg-slate-50/50"
                onClick={() => toggleBox('seoCheck')}
              >
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                    SEO CHECK ({seoPassedCount}/{seoChecklist.length})
                  </h3>
                </div>
                {boxesOpen.seoCheck ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {boxesOpen.seoCheck && (
                <div className="p-5 space-y-2.5 text-xs">
                  {seoChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        item.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {item.passed ? <Check className="w-3 h-3" /> : '•'}
                      </span>
                      <span className={item.passed ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div 
                className="px-5 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none bg-slate-50/50"
                onClick={() => toggleBox('author')}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">AUTHOR & BYLINE</h3>
                </div>
                {boxesOpen.author ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {boxesOpen.author && (
                <div className="p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setAuthorType('staff')}
                      className={`py-1.5 px-2 rounded-md font-semibold text-center transition-all cursor-pointer ${
                        authorType === 'staff'
                          ? 'bg-white text-blue-700 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Company Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthorType('external')}
                      className={`py-1.5 px-2 rounded-md font-semibold text-center transition-all cursor-pointer ${
                        authorType === 'external'
                          ? 'bg-white text-blue-700 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Guest / Outside
                    </button>
                  </div>

                  {authorType === 'staff' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <img src={selectedAuthor.avatar} alt={selectedAuthor.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">{selectedAuthor.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{selectedAuthor.role}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Select Newsroom Reporter:</label>
                        <select
                          value={authorId}
                          onChange={(e) => setAuthorId(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden"
                        >
                          {AUTHORS_LIST.map((author) => (
                            <option key={author.id} value={author.id}>
                              {author.name} — ({author.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2 text-amber-800 font-bold">
                        <User className="w-4 h-4 text-amber-600" />
                        <span>External / Guest Writer Byline</span>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Author / Agency Full Name:</label>
                        <input
                          type="text"
                          value={customAuthorName}
                          onChange={(e) => setCustomAuthorName(e.target.value)}
                          placeholder="e.g. Dr. Rajesh Sharma / PTI / Reuters / Special Correspondent"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Wire Outlet (Optional):</label>
                        <input
                          type="text"
                          value={customAuthorRole}
                          onChange={(e) => setCustomAuthorRole(e.target.value)}
                          placeholder="e.g. Guest Columnist / Senior Economist / Press Trust of India"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Author Profile Image Upload Module */}
                      <div className="pt-2 border-t border-amber-200/80">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Author Photo / Avatar:</label>
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => authorAvatarInputRef.current?.click()}
                            className="relative group/avatar w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 bg-white shrink-0 shadow-xs cursor-pointer"
                            title="Click to upload author photo"
                          >
                            <img
                              src={customAuthorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                              alt="Author Avatar"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity text-[10px] font-bold">
                              <Camera className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          
                          <div className="space-y-1 flex-1">
                            <button
                              type="button"
                              onClick={() => authorAvatarInputRef.current?.click()}
                              className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-slate-800 border border-slate-300 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Camera className="w-3.5 h-3.5 text-amber-700" />
                              <span>{customAuthorAvatar ? 'Change Photo' : 'Upload Author Photo'}</span>
                            </button>
                            {customAuthorAvatar && (
                              <button
                                type="button"
                                onClick={() => setCustomAuthorAvatar('')}
                                className="text-[#BA1A1A] hover:underline text-[11px] font-medium block cursor-pointer"
                              >
                                Reset to default avatar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden border-l-4 border-l-blue-500">
              <div 
                className="px-5 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none bg-slate-50/50"
                onClick={() => toggleBox('featuredImage')}
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">FEATURED IMAGE</h3>
                </div>
                {boxesOpen.featuredImage ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {boxesOpen.featuredImage && (
                <div className="p-5 space-y-3.5 text-xs">
                  {featuredImage ? (
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-900">
                        <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                        <div 
                          onClick={() => featuredImageInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-medium text-xs gap-1.5"
                        >
                          <Camera className="w-4 h-4" /> Replace Image
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={imageCaption}
                          onChange={(e) => setImageCaption(e.target.value)}
                          placeholder="Image caption..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                        />
                        <input
                          type="text"
                          value={imageCredit}
                          onChange={(e) => setImageCredit(e.target.value)}
                          placeholder="Photo credit / Agency..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                        />
                        <input
                          type="text"
                          value={imageAlt}
                          onChange={(e) => setImageAlt(e.target.value)}
                          placeholder="Image Alt text for SEO & accessibility..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                        />
                      </div>

                      <button 
                        type="button"
                        onClick={() => setFeaturedImage('')} 
                        className="text-red-600 text-xs font-semibold hover:underline block cursor-pointer"
                      >
                        Remove featured image
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => featuredImageInputRef.current?.click()} 
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-50/40 transition-colors group"
                    >
                      <Camera className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                      <span className="text-blue-600 font-bold text-xs block">[Upload Image]</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">Recommended 16:9 aspect ratio</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div 
                className="px-5 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none bg-slate-50/50"
                onClick={() => toggleBox('details')}
              >
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">ARTICLE DETAILS</h3>
                </div>
                {boxesOpen.details ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {boxesOpen.details && (
                <div className="p-5 space-y-4 text-xs">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Category / Desk:</label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {CATEGORIES_LIST.map((cat) => {
                        const isSelected = category === cat.slug;
                        return (
                          <button
                            key={cat.slug}
                            type="button"
                            onClick={() => setCategory(cat.slug)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer border ${
                              isSelected 
                                ? `${cat.color} font-bold shadow-2xs ring-1 ring-blue-400` 
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>{cat.label}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory:</label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. Macroeconomics / Parliament / Markets"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Article Type:</label>
                    <select
                      value={articleType}
                      onChange={(e) => setArticleType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
                    >
                      {ARTICLE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Location:</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Source:</label>
                      <input
                        type="text"
                        value={sourceAgency}
                        onChange={(e) => setSourceAgency(e.target.value)}
                        placeholder="e.g. PTI / ANI / Desk"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div 
                className="px-5 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none bg-slate-50/50"
                onClick={() => toggleBox('tags')}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">TAGS</h3>
                </div>
                {boxesOpen.tags ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {boxesOpen.tags && (
                <div className="p-5 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add custom tag..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 transition-colors"
                      >
                        <span>{t}</span>
                        <button type="button" onClick={() => removeTag(t)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 animate-fadeIn">
          <div className="bg-white md:rounded-2xl w-full h-full md:h-[95vh] overflow-y-auto shadow-2xl relative flex flex-col">
            
            <div className="sticky top-0 z-[110] bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/30 text-blue-400">
                  <Eye className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">LIVE READER PREVIEW MODAL</h3>
                  <p className="text-xs text-slate-400">This renders the real website article page.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenNewTabPreview}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Separate Tab</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white relative">
              <StandardArticleTemplate
                post={getPostData() as WpPost}
                onSelectPost={() => {}}
                onNavigateHome={() => {}}
                onSelectCategory={() => {}}
                onSelectAuthor={() => {}}
              />
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
