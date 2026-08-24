import { supabase } from '../lib/supabase';
import { WpPost, GutenbergBlock, EditorialCategorySlug } from '../types/wordpress';
import { EditorialStatus } from '../types/admin';
import { mockPosts as defaultMockPosts } from '../data/mockWpData';

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
  const authorAvatar = row.custom_author?.avatar || row.author_avatar || row.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
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
    featuredImage: row.featured_image_url || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
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
  };
};

export const generateUniqueSlug = async (
  title: string,
  currentArticleId?: string
): Promise<string> => {
  let baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  if (!baseSlug) baseSlug = `story-${Date.now().toString(36)}`;

  try {
    let candidate = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique && counter <= 20) {
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

export const getPublishedArticles = async (): Promise<WpPost[]> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories (id, name, slug),
        article_tags (
          tags (id, name, slug)
        )
      `)
      .eq('status', 'published')
      .order('is_lead', { ascending: false })
      .order('published_at', { ascending: false });

    if (error) {
      console.warn('Error fetching published articles from Supabase:', error.message);
      return defaultMockPosts;
    }

    if (!data || data.length === 0) {
      return defaultMockPosts;
    }

    const livePosts = data.map(row => mapDbToWpPost(row));
    
    // Merge live posts with missing mock posts only to preserve category sample breadth if few articles exist
    const liveSlugs = new Set(livePosts.map(p => p.slug));
    const supplementalMock = defaultMockPosts.filter(m => !liveSlugs.has(m.slug));
    
    return [...livePosts, ...supplementalMock];
  } catch (err) {
    console.error('Unexpected error fetching published articles:', err);
    return defaultMockPosts;
  }
};

export const getArticleBySlug = async (slug: string): Promise<WpPost | null> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories (id, name, slug),
        article_tags (
          tags (id, name, slug)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const mock = defaultMockPosts.find(p => p.slug === slug);
      return mock || null;
    }

    return mapDbToWpPost(data);
  } catch (err) {
    const mock = defaultMockPosts.find(p => p.slug === slug);
    return mock || null;
  }
};

export const getEditorialArticles = async (
  statusFilter?: string
): Promise<(WpPost & { editorialStatus: EditorialStatus; rawId: string })[]> => {
  try {
    let query = supabase
      .from('articles')
      .select(`
        *,
        categories (id, name, slug),
        article_tags (
          tags (id, name, slug)
        )
      `)
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
      return defaultMockPosts.map((p, idx) => ({
        ...p,
        rawId: p.id,
        editorialStatus: (idx === 0 ? 'published' : idx === 1 ? 'review' : idx === 2 ? 'scheduled' : 'draft') as EditorialStatus,
      }));
    }

    return data.map(row => ({
      ...mapDbToWpPost(row),
      rawId: row.id,
      editorialStatus: (row.status || 'draft') as EditorialStatus,
    }));
  } catch (err) {
    console.error('Error fetching editorial articles:', err);
    return defaultMockPosts.map(p => ({ ...p, rawId: p.id, editorialStatus: 'published' as EditorialStatus }));
  }
};

export const saveArticle = async (
  postData: Partial<WpPost>,
  targetStatus: EditorialStatus = 'draft'
): Promise<{ post?: WpPost; error?: string }> => {
  try {
    const title = postData.title?.trim() || 'Untitled News Story';
    const categoryId = CATEGORY_SLUG_TO_ID[postData.category || 'india'] || '11111111-1111-1111-1111-111111110001';
    
    // Determine active author session
    const { data: { session } } = await supabase.auth.getSession();
    const activeUserId = session?.user?.id || '04ad79d9-d871-4099-a633-bcb7a1e35055';

    // Determine author information (writer name and position in organization)
    const authorName = postData.customAuthor?.name || 'Umang Sharma';
    const authorRole = postData.customAuthor?.role || 'Editor-in-Chief';
    const authorAvatar = postData.customAuthor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
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

    // Check if updating existing record by UUID or by slug
    let existingId: string | null = null;
    if (postData.id && isValidUUID(postData.id)) {
      existingId = postData.id;
    } else if (postData.slug) {
      const { data: existingRow } = await supabase
        .from('articles')
        .select('id, slug')
        .eq('slug', postData.slug)
        .maybeSingle();

      if (existingRow?.id) {
        existingId = existingRow.id;
      }
    }

    const slug = postData.slug?.trim() || (await generateUniqueSlug(title, existingId || undefined));

    const dbPayload: any = {
      title,
      title_hi: postData.titleHi || null,
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
      is_lead: !!postData.isLead,
      is_featured: !!postData.isFeatured,
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

    const finalPost = mapDbToWpPost(resultArticle, postData.tags);
    return { post: finalPost };
  } catch (err: any) {
    console.error('Unexpected error in saveArticle:', err);
    return { error: err?.message || 'Failed to save article in database.' };
  }
};

export const deleteArticle = async (idOrSlug: string): Promise<{ success: boolean; error?: string }> => {
  try {
    let query = supabase.from('articles').delete();

    if (isValidUUID(idOrSlug)) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.select('id');

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Article delete failed: Record not found or permission denied.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete operation failed.' };
  }
};
