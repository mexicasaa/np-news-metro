// Fallback editorial SVG placeholder when external CDN is offline or blocked
export const DEFAULT_FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22500%22%20viewBox%3D%220%200%20800%20500%22%3E%3Crect%20fill%3D%22%23162839%22%20width%3D%22800%22%20height%3D%22500%22%20viewBox%3D%220%200%20800%20500%22%3E%3Crect%20fill%3D%22%232C3E50%22%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22760%22%20height%3D%22460%22%20rx%3D%224%22%2F%3E%3Cpath%20d%3D%22M400%20180%20L420%20240%20L380%20240%20Z%22%20fill%3D%22%23C5A059%22%2F%3E%3Ctext%20fill%3D%22%23FFFFFF%22%20font-family%3D%22serif%22%20font-size%3D%2224%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%22290%22%20text-anchor%3D%22middle%22%3ENP%20NEWS%20METRO%3C%2Ftext%3E%3Ctext%20fill%3D%22%23C5A059%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20letter-spacing%3D%223%22%20x%3D%2250%25%22%20y%3D%22320%22%20text-anchor%3D%22middle%22%3EREAL%20NEWS.%20REAL%20IMPACT.%3C%2Ftext%3E%3C%2Fsvg%3E';

// Official Permanent NP News Metro Author Profile Avatar
export const DEFAULT_AUTHOR_AVATAR = '/np-author-default.png';

/**
 * Returns the author's custom avatar if provided, otherwise falls back
 * permanently to the official NP News Metro logo avatar.
 */
export const getAuthorAvatarUrl = (avatarUrl?: string | null): string => {
  if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.trim()) {
    return DEFAULT_AUTHOR_AVATAR;
  }
  const trimmed = avatarUrl.trim();
  // Filter out legacy unsplash placeholder face
  if (trimmed.includes('photo-1534528741775-53994a69daeb')) {
    return DEFAULT_AUTHOR_AVATAR;
  }
  return trimmed;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== DEFAULT_FALLBACK_IMAGE) {
    target.src = DEFAULT_FALLBACK_IMAGE;
  }
};

export const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== DEFAULT_AUTHOR_AVATAR && !target.src.endsWith(DEFAULT_AUTHOR_AVATAR)) {
    target.src = DEFAULT_AUTHOR_AVATAR;
  }
};

/**
 * Transforms raw Supabase Storage or external image URLs to use
 * Vercel Edge-cached, compressed, and resized CDN delivery, eliminating
 * direct Supabase Storage bandwidth egress for public readers.
 */
export const getOptimizedImageUrl = (
  src?: string | null,
  width: number = 800,
  quality: number = 75
): string => {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return DEFAULT_FALLBACK_IMAGE;
  }
  const trimmed = src.trim();

  // Local static or data URLs
  if (trimmed.startsWith('data:') || trimmed.startsWith('/uploads/') || trimmed.startsWith('/assets/')) {
    return trimmed;
  }

  // Supabase storage object URL -> route through /api/image/...
  if (trimmed.includes('/storage/v1/object/public/')) {
    const pathAfter = trimmed.split('/storage/v1/object/public/')[1];
    if (pathAfter) {
      return `/api/image/${pathAfter.replace(/^\/+/, '')}?w=${width}&q=${quality}`;
    }
  }

  // Supabase render URL -> normalize to /api/image/...
  if (trimmed.includes('/storage/v1/render/image/public/')) {
    const pathAfter = trimmed.split('/storage/v1/render/image/public/')[1]?.split('?')[0];
    if (pathAfter) {
      return `/api/image/${pathAfter.replace(/^\/+/, '')}?w=${width}&q=${quality}`;
    }
  }

  // Unsplash CDN parameters
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const u = new URL(trimmed);
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', String(quality));
      u.searchParams.set('auto', 'format');
      return u.toString();
    } catch (e) {
      return trimmed;
    }
  }

  return trimmed;
};

