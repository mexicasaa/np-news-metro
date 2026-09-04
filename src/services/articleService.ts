import { supabase } from '../lib/supabase';
import { WpPost, GutenbergBlock, EditorialCategorySlug } from '../types/wordpress';
import { EditorialStatus } from '../types/admin';
import { ensureAuthenticatedSession } from './authService';
import { slugifyText } from '../utils/slugify';
import { getAuthorAvatarUrl, DEFAULT_AUTHOR_AVATAR } from '../utils/imageFallback';
import { isPostPublished, removeStoredDraft, getStoredPosts, saveLiveArticlesCache } from '../utils/newsStorage';

// Category mapping helper
const CATEGORY_SLUG_TO_ID: Record<string, string> = {
  india: '11111111-1111-1111-1111-111111110001',
  politics: '11111111-1111-1111-1111-111111110002',
  business: '11111111-1111-1111-1111-111111110003',
  technology: '11111111-1111-1111-1111-111111110004',
  world: '11111111-1111-1111-1111-111111110005',
  sports: '11111111-1111-1111-1111-111111110006',
  entertainment: '11111111-1111-1111-1111-111111110007',
  lifestyle: '11111111-1111-1111-1111-111111110008',
  opinion: '11111111-1111-1111-1111-111111110009',
  crime: '11111111-1111-1111-1111-111111110010',
  social: '11111111-1111-1111-1111-111111110011',
  astrology: '11111111-1111-1111-1111-111111110012',
  religion: '11111111-1111-1111-1111-111111110013',
};

const CATEGORY_ID_TO_SLUG: Record<string, EditorialCategorySlug> = {
  '11111111-1111-1111-1111-111111110001': 'india',
  '11111111-1111-1111-1111-111111110002': 'politics',
  '11111111-1111-1111-1111-111111110003': 'business',
  '11111111-1111-1111-1111-111111110004': 'technology',
  '11111111-1111-1111-1111-111111110005': 'world',
  '11111111-1111-1111-1111-111111110006': 'sports',
  '11111111-1111-1111-1111-111111110007': 'entertainment',
  '11111111-1111-1111-1111-111111110008': 'lifestyle',
  '11111111-1111-1111-1111-111111110009': 'opinion',
  '11111111-1111-1111-1111-111111110010': 'crime',
  '11111111-1111-1111-1111-111111110011': 'social',
  '11111111-1111-1111-1111-111111110012': 'astrology',
  '11111111-1111-1111-1111-111111110013': 'religion',
};

const isValidUUID = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const mapDbToWpPost = (row: any, joinedTags?: string[]): WpPost => {
  const categorySlug = row.categories?.slug || CATEGORY_ID_TO_SLUG[row.category_id] || (row.category_id as string) || 'india';
  
  const tagList = joinedTags && joinedTags.length > 0 
    ? joinedTags 
    : (Array.isArray(row.article_tags) 
        ? row.article_tags.map((at: any) => at.tags?.name || at.tag_id).filter(Boolean)
        : (Array.isArray(row.tags) ? row.tags : ['National', 'Policy']));

  let parsedBlocks: GutenbergBlock[] = [];
  if (Array.isArray(row.blocks) && row.blocks.length > 0) {
    parsedBlocks = row.blocks;
  } else if (typeof row.content === 'string' && row.content.trim()) {
    parsedBlocks = [
      {
        id: 'b-content-1',
        type: 'paragraph',
        content: row.content,
      },
    ];
  } else {
    parsedBlocks = [
      {
        id: 'b-default-1',
        type: 'paragraph',
        content: row.excerpt || 'News dispatch from editorial desk.',
      },
    ];
  }

  const readTimeStr = row.reading_time_minutes 
    ? `${row.reading_time_minutes} min read` 
    : '3 min read';

  // Construct author object with reporter name and organizational position
  const authorName = row.custom_author?.name || row.author_name || (row.profiles?.full_name) || 'NP News Metro Bureau';
  const authorRole = row.custom_author?.role || row.author_role || (row.profiles?.position || row.profiles?.designation || row.profiles?.role) || 'Staff Reporter';
  const authorAvatar = getAuthorAvatarUrl(row.custom_author?.avatar || row.author_avatar || row.profiles?.avatar_url);
  const authorBio = row.custom_author?.bio || row.author_bio || row.profiles?.bio || undefined;

  const authorObj = {
    name: authorName,
    role: authorRole,
    avatar: authorAvatar,
    bio: authorBio,
    isGuest: row.custom_author?.isGuest || false,
  };

  return {
    id: row.id,
    title: row.title,
    titleHi: row.title_hi || undefined,
    slug: row.slug,
    dek: row.excerpt || '',
    dekHi: row.dek_hi || undefined,
    category: categorySlug as EditorialCategorySlug,
    categoryHi: undefined,
    location: row.location || 'New Delhi',
    tags: tagList,
    authorId: row.author_id || '04ad79d9-d871-4099-a633-bcb7a1e35055',
    customAuthor: authorObj,
    publishedAt: row.published_at || row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined,
    readTime: readTimeStr,
    featuredImage: row.featured_image_url || '',
    imageCaption: row.featured_image_caption || '',
    imageCaptionHi: undefined,
    imageCredit: row.image_credit || 'NP News Metro Photo Desk',
    imageAlt: row.featured_image_alt || row.title,
    isBreaking: !!row.is_breaking_news,
    isLead: !!row.is_lead,
    isFeatured: !!row.is_featured,
    isOpinion: !!row.is_opinion,
    isSponsored: !!row.is_sponsored,
    sponsorName: row.sponsor_name || undefined,
    keyTakeaways: Array.isArray(row.key_takeaways) ? row.key_takeaways : undefined,
    blocks: parsedBlocks,
    viewsCount: Number(row.view_count) || 140,
    sharesCount: 14,
    commentCount: 0,
    seoTitle: row.seo_title || undefined,
    seoDescription: row.meta_description || undefined,
    editorialStatus: (row.status || 'published') as EditorialStatus,
    status: row.status || 'published',
  };
};

export const generateUniqueSlug = async (
  titleOrSlug: string,
  currentArticleId?: string
): Promise<string> => {
  const baseSlug = slugifyText(titleOrSlug, 65);

  try {
    let candidate = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique && counter <= 50) {
      let query = supabase
        .from('articles')
        .select('id')
        .eq('slug', candidate);

      if (currentArticleId && isValidUUID(currentArticleId)) {
        query = query.neq('id', currentArticleId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        isUnique = true;
        return candidate;
      }

      counter++;
      candidate = `${baseSlug}-${counter}`;
    }

    return `${baseSlug}-${Date.now().toString(36)}`;
  } catch (err) {
    return `${baseSlug}-${Date.now().toString(36)}`;
  }
};

export const CARD_PROJECTION_SELECT = `
  id, slug, title, title_hi, excerpt, dek_hi, category_id,
  categories (id, name, slug),
  author_id, author_name, author_role, author_avatar,
  published_at, updated_at, status,
  is_breaking_news, is_lead, is_featured, is_opinion, is_sponsored,
  reading_time_minutes, view_count,
  featured_image_url, featured_image_alt, featured_image_caption
`;

export const ARTICLE_DETAIL_SELECT = `
  id, slug, title, title_hi, excerpt, dek_hi, content, blocks, key_takeaways,
  author_id, author_name, author_role, author_avatar, author_bio,
  category_id, categories (id, name, slug),
  published_at, updated_at, status,
  is_breaking_news, is_lead, is_featured, is_opinion, is_sponsored, sponsor_name,
  reading_time_minutes, view_count, location, image_credit,
  seo_title, meta_description, canonical_url, robots_index, robots_follow,
  featured_image_url, featured_image_alt, featured_image_caption, custom_author,
  article_tags (
    tags (id, name, slug)
  )
`;

export const EDITORIAL_SELECT = `
  id, slug, title, title_hi, excerpt, dek_hi, content, blocks, key_takeaways,
  author_id, author_name, author_role, author_avatar, author_bio,
  category_id, categories (id, name, slug),
  published_at, updated_at, status, created_at,
  is_breaking_news, is_lead, is_featured, is_opinion, is_sponsored, sponsor_name,
  reading_time_minutes, view_count, location, image_credit,
  seo_title, meta_description, canonical_url, robots_index, robots_follow,
  featured_image_url, featured_image_alt, featured_image_caption, custom_author,
  article_tags (
    tags (id, name, slug)
  )
`;

// Client-side in-memory cache to strictly protect Supabase DB and Egress limits
let cachedHomepageArticles: { data: WpPost[]; timestamp: number } | null = null;
const cachedCategoryArticles = new Map<string, { data: WpPost[]; timestamp: number }>();
const cachedLatestArticles = new Map<string, { data: WpPost[]; timestamp: number }>();
const cachedArticleBySlug = new Map<string, { data: WpPost; timestamp: number }>();

const CLIENT_ARTICLE_TTL = 2 * 60 * 1000; // 2 minutes
const CLIENT_SLUG_TTL = 5 * 60 * 1000;    // 5 minutes

export const invalidateArticleClientCache = () => {
  cachedHomepageArticles = null;
  cachedCategoryArticles.clear();
  cachedLatestArticles.clear();
  cachedArticleBySlug.clear();
};

export const getPublishedArticles = async (): Promise<WpPost[]> => {
  if (cachedHomepageArticles && Date.now() - cachedHomepageArticles.timestamp < CLIENT_ARTICLE_TTL) {
    return cachedHomepageArticles.data;
  }

  // 1. Fetch from Edge-cached public API (Zero direct DB connection from browser)
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/articles?view=homepage');
      if (res.ok) {
        const json = await res.json();
        if (json?.posts && Array.isArray(json.posts) && json.posts.length > 0) {
          const livePosts = json.posts.map((row: any) => mapDbToWpPost(row)).filter(isPostPublished);
          if (livePosts.length > 0) {
            cachedHomepageArticles = { data: livePosts, timestamp: Date.now() };
            // Save real live posts to localStorage for instant hydration on page reload
            saveLiveArticlesCache(livePosts);
            return livePosts;
          }
        }
      }
    }
  } catch (apiErr) {
    console.warn('Edge API fetch note:', apiErr);
  }

  // Return existing memory cache or stored live cache (Never call Supabase DB directly from public browser)
  const stored = getStoredPosts();
  if (stored && stored.length > 0) {
    return stored;
  }

  return [];
};

export const getCategoryArticles = async (
  categorySlug: string,
  page: number = 1,
  limit: number = 20
): Promise<WpPost[]> => {
  const cacheKey = `${categorySlug.toLowerCase()}:${page}:${limit}`;
  const cached = cachedCategoryArticles.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_ARTICLE_TTL) {
    return cached.data;
  }

  // Fetch from Edge-cached public API (Zero direct DB connection from browser)
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/articles?category=${encodeURIComponent(categorySlug)}&page=${page}&limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.posts && Array.isArray(json.posts)) {
          const mapped = json.posts.map((row: any) => mapDbToWpPost(row)).filter(isPostPublished);
          cachedCategoryArticles.set(cacheKey, { data: mapped, timestamp: Date.now() });
          return mapped;
        }
      }
    }
  } catch (apiErr) {}

  return cachedCategoryArticles.get(cacheKey)?.data || [];
};

export const getLatestArticles = async (
  page: number = 1,
  limit: number = 20
): Promise<WpPost[]> => {
  const cacheKey = `${page}:${limit}`;
  const cached = cachedLatestArticles.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_ARTICLE_TTL) {
    return cached.data;
  }

  // Fetch from Edge-cached public API (Zero direct DB connection from browser)
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/articles?view=latest&page=${page}&limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.posts && Array.isArray(json.posts)) {
          const mapped = json.posts.map((row: any) => mapDbToWpPost(row)).filter(isPostPublished);
          cachedLatestArticles.set(cacheKey, { data: mapped, timestamp: Date.now() });
          return mapped;
        }
      }
    }
  } catch (apiErr) {}

  return cachedLatestArticles.get(cacheKey)?.data || [];
};

export const searchArticles = async (
  queryText: string,
  limit: number = 20
): Promise<WpPost[]> => {
  if (!queryText.trim()) return [];

  // 1. Fetch from Edge-cached public API (Zero direct DB connection from browser)
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/articles?search=${encodeURIComponent(queryText)}&limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.posts && Array.isArray(json.posts)) {
          return json.posts.map((row: any) => mapDbToWpPost(row)).filter(isPostPublished);
        }
      }
    }
  } catch (apiErr) {}

  // 2. Offline / local fallback using cached stored articles (Zero direct DB connection)
  const stored = getStoredPosts();
  if (stored && stored.length > 0) {
    const q = queryText.toLowerCase().trim();
    return stored.filter(p => 
      p.title.toLowerCase().includes(q) ||
      (p.dek && p.dek.toLowerCase().includes(q)) ||
      (p.titleHi && p.titleHi.toLowerCase().includes(q))
    ).slice(0, limit);
  }

  return [];
};

export const getArticleBySlug = async (
  slug: string, 
  allowDraft: boolean = false
): Promise<WpPost | null> => {
  // Check client cache if not in draft mode
  if (!allowDraft) {
    const cached = cachedArticleBySlug.get(slug);
    if (cached && Date.now() - cached.timestamp < CLIENT_SLUG_TTL) {
      return cached.data;
    }
  }

  // 1. For public visitors (not in draft preview), fetch strictly via Edge-cached API (Zero direct DB connection)
  if (!allowDraft) {
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.post) {
            const mapped = mapDbToWpPost(json.post);
            if (isPostPublished(mapped)) {
              cachedArticleBySlug.set(slug, { data: mapped, timestamp: Date.now() });
              return mapped;
            }
          }
        }
      }
    } catch (apiErr) {}

    // Fallback to client stored posts if offline or edge cache warming
    const stored = getStoredPosts();
    const foundInStored = stored.find(p => p.slug === slug);
    if (foundInStored) {
      return foundInStored;
    }

    return null;
  }

  // 2. Draft preview for authenticated editors ONLY (from /admin preview)
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_DETAIL_SELECT)
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbToWpPost(data);
  } catch (err) {
    return null;
  }
};

export const getEditorialArticles = async (
  statusFilter?: string
): Promise<(WpPost & { editorialStatus: EditorialStatus; rawId: string })[]> => {
  try {
    let query = (supabase.from('articles') as any)
      .select(EDITORIAL_SELECT)
      .order('updated_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'breaking') {
        query = query.or('is_breaking_news.eq.true,is_lead.eq.true');
      } else {
        query = query.eq('status', statusFilter);
      }
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return [];
    }

    const liveEditorial = (data as any[]).map((row: any) => {
      const isPub = (row.status || '').toLowerCase() === 'published';
      const statusVal = isPub ? 'published' : (row.status || 'draft');
      return {
        ...mapDbToWpPost(row),
        rawId: row.id,
        editorialStatus: statusVal as EditorialStatus,
        status: statusVal,
      };
    });

    return liveEditorial;
  } catch (err) {
    console.error('Error fetching editorial articles:', err);
    return [];
  }
};

export const saveArticle = async (
  postData: Partial<WpPost> & { isEdit?: boolean },
  targetStatus: EditorialStatus = 'draft'
): Promise<{ post?: WpPost; error?: string }> => {
  // 1. Serverless Edge API first (Zero direct DB connection from browser, automatic warm cache & Cloudflare purge)
  try {
    if (typeof window !== 'undefined') {
      const apiRes = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postData, targetStatus }),
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json?.post) {
          const mapped = mapDbToWpPost(json.post);
          invalidateArticleClientCache();
          try {
            if (typeof BroadcastChannel !== 'undefined') {
              const channel = new BroadcastChannel('np_news_feed_channel');
              if (targetStatus === 'published') {
                channel.postMessage({ type: 'NEWS_PUBLISHED', articleId: mapped.id });
              } else {
                channel.postMessage({ type: 'ARTICLE_DRAFT_SAVED', articleId: mapped.id });
              }
              channel.close();
            }
          } catch (e) {}
          return { post: mapped };
        }
      }
    }
  } catch (apiErr) {
    console.warn('API saveArticle notice, proceeding to client fallback:', apiErr);
  }

  // 2. Direct Supabase fallback
  try {
    const title = postData.title?.trim() || 'Untitled News Story';
    const categoryId = CATEGORY_SLUG_TO_ID[postData.category || 'india'] || '11111111-1111-1111-1111-111111110001';
    
    // Ensure active authenticated session before Supabase write
    const activeUserId = (await ensureAuthenticatedSession()) || '04ad79d9-d871-4099-a633-bcb7a1e35055';

    // Determine author information (writer name and position in organization)
    const authorName = postData.customAuthor?.name || 'Umang Sharma';
    const authorRole = postData.customAuthor?.role || 'Editor-in-Chief';
    const authorAvatar = getAuthorAvatarUrl(postData.customAuthor?.avatar);
    const authorBio = postData.customAuthor?.bio || null;

    const customAuthorPayload = {
      name: authorName,
      role: authorRole,
      avatar: authorAvatar,
      bio: authorBio,
      isGuest: postData.customAuthor?.isGuest || false,
    };

    // Extract plain text content from blocks
    const contentText = postData.blocks && postData.blocks.length > 0
      ? postData.blocks.map(b => b.content || '').join('\n\n')
      : postData.dek || '';

    const readTimeMinutes = postData.readTime 
      ? parseInt(postData.readTime.replace(/[^\d]/g, ''), 10) || 3 
      : 3;

    // STRICT CHECK: An UPDATE occurs if:
    // 1. postData.id is a valid UUID (meaning the record already exists in Supabase as draft or published)
    // 2. OR when targetStatus is 'published', check if an existing draft exists for this title or ID
    let existingId: string | null = null;
    if (postData.id && isValidUUID(postData.id)) {
      existingId = postData.id;
    } else if (targetStatus === 'published') {
      try {
        const { data: draftMatches } = await supabase
          .from('articles')
          .select('id')
          .eq('title', title)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1);
        if (draftMatches && draftMatches.length > 0) {
          existingId = draftMatches[0].id;
        }
      } catch (e) {}
    }

    // Always generate a unique slug to guarantee no duplicates or collisions
    const rawSlugCandidate = postData.slug && postData.slug !== 'auto-draft' && postData.slug.trim().length > 1
      ? postData.slug.trim()
      : title;

    const slug = await generateUniqueSlug(rawSlugCandidate, existingId || undefined);

    const dbPayload: any = {
      title,
      title_hi: postData.titleHi || title,
      slug,
      excerpt: postData.dek || null,
      dek_hi: postData.dekHi || null,
      content: contentText,
      category_id: categoryId,
      status: targetStatus,
      featured_image_url: postData.featuredImage || null,
      featured_image_alt: postData.imageAlt || title,
      featured_image_caption: postData.imageCaption || null,
      image_credit: postData.imageCredit || 'NP News Metro Photo Desk',
      is_breaking_news: !!postData.isBreaking,
      is_lead: postData.isLead !== undefined ? !!postData.isLead : true,
      is_featured: postData.isFeatured !== undefined ? !!postData.isFeatured : true,
      is_opinion: !!postData.isOpinion,
      is_sponsored: !!postData.isSponsored,
      sponsor_name: postData.sponsorName || null,
      location: postData.location || 'New Delhi',
      author_id: activeUserId,
      author_name: authorName,
      author_role: authorRole,
      author_avatar: authorAvatar,
      author_bio: authorBio,
      custom_author: customAuthorPayload,
      blocks: postData.blocks || [],
      key_takeaways: postData.keyTakeaways || [],
      seo_title: postData.seoTitle || null,
      meta_description: postData.seoDescription || null,
      reading_time_minutes: readTimeMinutes,
      published_at: targetStatus === 'published' 
        ? (postData.publishedAt || new Date().toISOString()) 
        : (postData.publishedAt || null),
      updated_at: new Date().toISOString(),
    };

    let resultArticle: any = null;

    if (existingId) {
      const { data, error } = await supabase
        .from('articles')
        .update(dbPayload)
        .eq('id', existingId)
        .select(`
          *,
          categories (id, name, slug),
          article_tags (
            tags (id, name, slug)
          )
        `)
        .single();

      if (error) {
        return { error: `Database update error: ${error.message}` };
      }
      if (!data) {
        return { error: 'Database update failed: No article row returned from Supabase.' };
      }
      resultArticle = data;
    } else {
      const { data, error } = await supabase
        .from('articles')
        .insert(dbPayload)
        .select(`
          *,
          categories (id, name, slug),
          article_tags (
            tags (id, name, slug)
          )
        `)
        .single();

      if (error) {
        return { error: `Database insert error: ${error.message}` };
      }
      if (!data) {
        return { error: 'Database insert failed: No article row created in Supabase.' };
      }
      resultArticle = data;
    }

    // Record revision in history
    if (resultArticle?.id) {
      try {
        await supabase.from('article_revisions').insert({
          article_id: resultArticle.id,
          title: resultArticle.title,
          excerpt: resultArticle.excerpt,
          content: resultArticle.content,
          status: targetStatus,
        });
      } catch (revErr) {}
    }

    // When published, purge any lingering draft records with the same title or ID from Supabase and local drafts cache
    if (targetStatus === 'published' && resultArticle?.id) {
      try {
        await supabase
          .from('articles')
          .delete()
          .eq('status', 'draft')
          .eq('title', title)
          .neq('id', resultArticle.id);
      } catch (cleanErr) {}

      try {
        removeStoredDraft(resultArticle.id, title);
        if (resultArticle.slug) removeStoredDraft(resultArticle.slug, title);
      } catch (e) {}
    }

    invalidateArticleClientCache();

    // Broadcast across tabs/windows for instant sync
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('np_news_feed_channel');
        if (targetStatus === 'published') {
          channel.postMessage({ type: 'NEWS_PUBLISHED', articleId: resultArticle.id });
        } else {
          channel.postMessage({ type: 'ARTICLE_DRAFT_SAVED', articleId: resultArticle.id });
        }
        channel.close();
      }

      // Trigger edge cache invalidation
      if (resultArticle?.slug) {
        const catSlug = resultArticle.categories?.slug || CATEGORY_ID_TO_SLUG[resultArticle.category_id] || 'india';
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: resultArticle.slug, category: catSlug, action: targetStatus }),
        }).catch(() => {});
      }

      // Automatically ping IndexNow for instant search engine indexing (Bing, Yandex, etc.)
      if (targetStatus === 'published' && resultArticle?.slug) {
        const catSlug = resultArticle.categories?.slug || CATEGORY_ID_TO_SLUG[resultArticle.category_id] || 'india';
        const articleUrl = `https://www.npnewsmetro.com/${catSlug}/${resultArticle.slug}`;
        fetch('/api/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: [articleUrl, 'https://www.npnewsmetro.com/'] }),
        }).catch(err => console.warn('IndexNow auto-ping failed (non-fatal):', err));
      }
    } catch (e) {}

    const mapped = mapDbToWpPost(resultArticle, postData.tags);
    const finalPost: WpPost = {
      ...mapped,
      editorialStatus: (resultArticle.status || targetStatus) as EditorialStatus,
      status: resultArticle.status || targetStatus,
    };
    return { post: finalPost };
  } catch (err: any) {
    console.error('Unexpected error in saveArticle:', err);
    return { error: err?.message || 'Failed to save article in database.' };
  }
};

export interface DeletedArticle {
  id: string;
  originalArticleId?: string;
  title: string;
  slug: string;
  categorySlug?: string;
  authorId?: string;
  authorName?: string;
  status?: string;
  featuredImageUrl?: string;
  articlePayload: any;
  deletedAt: string;
  deletedBy?: string;
}

export const deleteArticleWithRecovery = async (
  idOrSlug: string
): Promise<{ success: boolean; recoveredId?: string; error?: string }> => {
  // 1. Try serverless Edge API first (Zero direct DB connection from browser)
  try {
    if (typeof window !== 'undefined') {
      const apiRes = await fetch(`/api/articles?id=${encodeURIComponent(idOrSlug)}`, {
        method: 'DELETE',
      });
      if (apiRes.ok) {
        invalidateArticleClientCache();
        return { success: true };
      }
    }
  } catch (apiErr) {}

  try {
    const activeUserId = await ensureAuthenticatedSession();

    // 1. Find existing article first to capture complete snapshot
    let selectQuery = (supabase.from('articles') as any).select('*');
    if (isValidUUID(idOrSlug)) {
      selectQuery = selectQuery.eq('id', idOrSlug);
    } else {
      selectQuery = selectQuery.eq('slug', idOrSlug);
    }

    const { data: existingRows, error: findError } = await selectQuery;
    if (findError) {
      return { success: false, error: 'Failed to find article: ' + findError.message };
    }

    const articleToArchive = existingRows && existingRows[0];
    if (!articleToArchive) {
      return { success: false, error: 'Article not found in database.' };
    }

    // 2. Archive to deleted_articles recovery table
    const archivePayload = {
      original_article_id: articleToArchive.id,
      title: articleToArchive.title,
      slug: articleToArchive.slug,
      category_slug: articleToArchive.category_slug || null,
      author_id: articleToArchive.author_id || null,
      author_name: articleToArchive.author_name || null,
      status: articleToArchive.status || 'published',
      featured_image_url: articleToArchive.featured_image_url || null,
      article_payload: articleToArchive,
      deleted_at: new Date().toISOString(),
      deleted_by: isValidUUID(activeUserId || '') ? activeUserId : null,
    };

    const { data: archiveRes, error: archiveError } = await ((supabase as any)
      .from('deleted_articles') as any)
      .insert(archivePayload)
      .select('id')
      .single();

    if (archiveError) {
      console.warn('Warning: Archive insertion returned error:', archiveError.message);
    }

    // 3. Delete from active articles table
    let deleteQuery = (supabase.from('articles') as any).delete();
    if (isValidUUID(idOrSlug)) {
      deleteQuery = deleteQuery.eq('id', idOrSlug);
    } else {
      deleteQuery = deleteQuery.eq('slug', idOrSlug);
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) {
      return { success: false, error: 'Failed to remove article from live table: ' + deleteError.message };
    }

    try {
      if (articleToArchive?.slug) {
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: articleToArchive.slug, category: articleToArchive.category_slug, action: 'delete' }),
        }).catch(() => {});
      }
    } catch (e) {}

    return { 
      success: true, 
      recoveredId: archiveRes?.id || articleToArchive.id 
    };
  } catch (err: any) {
    console.error('Error in deleteArticleWithRecovery:', err);
    return { success: false, error: err?.message || 'Failed to delete article.' };
  }
};

export const getDeletedArticles = async (): Promise<DeletedArticle[]> => {
  try {
    await ensureAuthenticatedSession();
    const { data, error } = await ((supabase as any)
      .from('deleted_articles') as any)
      .select('*')
      .order('deleted_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching deleted articles:', error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      originalArticleId: row.original_article_id,
      title: row.title,
      slug: row.slug,
      categorySlug: row.category_slug,
      authorId: row.author_id,
      authorName: row.author_name,
      status: row.status,
      featuredImageUrl: row.featured_image_url,
      articlePayload: row.article_payload,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
    }));
  } catch (err) {
    console.error('Unexpected error in getDeletedArticles:', err);
    return [];
  }
};

export const restoreDeletedArticle = async (
  recoveryId: string
): Promise<{ success: boolean; post?: WpPost; error?: string }> => {
  try {
    await ensureAuthenticatedSession();

    // 1. Fetch from deleted_articles
    const { data: recoveryRow, error: fetchErr } = await ((supabase as any)
      .from('deleted_articles') as any)
      .select('*')
      .eq('id', recoveryId)
      .single();

    if (fetchErr || !recoveryRow) {
      return { success: false, error: 'Deleted article recovery record not found.' };
    }

    const rawPayload = recoveryRow.article_payload;
    const restorePayload = {
      ...rawPayload,
      id: rawPayload.id || recoveryRow.original_article_id || undefined,
      status: rawPayload.status || 'draft',
      updated_at: new Date().toISOString(),
    };

    // 2. Upsert back into articles
    const { data: restoredArticle, error: insertErr } = await (supabase
      .from('articles') as any)
      .upsert(restorePayload)
      .select('*')
      .single();

    if (insertErr || !restoredArticle) {
      return { success: false, error: 'Failed to restore article: ' + (insertErr?.message || 'Database insert error') };
    }

    // 3. Remove from deleted_articles
    await ((supabase as any).from('deleted_articles') as any).delete().eq('id', recoveryId);

    const post = mapDbToWpPost(restoredArticle);
    return { success: true, post };
  } catch (err: any) {
    console.error('Error restoring article:', err);
    return { success: false, error: err?.message || 'Restore failed.' };
  }
};

export const permanentDeleteArticle = async (
  recoveryId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await ensureAuthenticatedSession();
    const { error } = await ((supabase as any)
      .from('deleted_articles') as any)
      .delete()
      .eq('id', recoveryId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Permanent deletion failed.' };
  }
};

// Backward compatibility alias
export const deleteArticle = deleteArticleWithRecovery;
