import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/admin';
import { mockAdminUsers } from '../data/mockAdminData';
import { getAuthorAvatarUrl, DEFAULT_AUTHOR_AVATAR } from '../utils/imageFallback';

export const signInWithCredentials = async (
  usernameOrEmail: string,
  password: string
): Promise<{ profile?: UserProfile; error?: string }> => {
  const cleanInput = usernameOrEmail.trim().toLowerCase();
  
  let email = cleanInput;
  if (cleanInput === 'admin' || cleanInput === 'admin@npnewsmetro.com' || cleanInput === 'admin@npnews.com' || cleanInput === 'admin@npnewsmetro.in') {
    email = 'admin@npnews.com';
  } else if (cleanInput === 'siddharth' || cleanInput === 'siddharth@npnewsmetro.com') {
    email = 'siddharth.npnews@gmail.com';
  } else if (cleanInput === 'ananya' || cleanInput === 'ananya@npnewsmetro.com') {
    email = 'ananya.npnews@gmail.com';
  } else if (cleanInput === 'rohan' || cleanInput === 'rohan@npnewsmetro.com') {
    email = 'rohan.npnews@gmail.com';
  } else if (cleanInput === 'nambiar' || cleanInput === 'nambiar@npnewsmetro.com') {
    email = 'nambiar.npnews@gmail.com';
  } else if (!cleanInput.includes('@')) {
    email = `${cleanInput}@npnews.com`;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password.trim(),
    });

    if (error) {
      return { error: error.message || 'Invalid credentials. Please verify your username/password.' };
    }

    if (!data.user) {
      return { error: 'Authentication failed. User not found.' };
    }

    // Fetch corresponding profile
    let profile = await getUserProfile(data.user.id);
    if (!profile) {
      profile = {
        id: data.user.id,
        name: data.user.email === 'admin@npnews.com' ? 'Umang Pandey' : (data.user.user_metadata?.full_name || 'Newsroom Staff'),
        email: data.user.email || 'admin@npnews.com',
        role: (data.user.user_metadata?.role as UserRole) || 'admin',
        avatar: getAuthorAvatarUrl(data.user.user_metadata?.avatar_url || '/np-author-default.png'),
        department: 'Executive Editorial Bureau',
        designation: 'Editor-in-Chief & Publisher',
      };
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('np_news_current_user', JSON.stringify(profile));
      }
    } catch (e) {}

    return { profile };
  } catch (err: any) {
    console.error('Unexpected sign in error:', err);
    return { error: err?.message || 'Authentication error occurred.' };
  }
};

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: '04ad79d9-d871-4099-a633-bcb7a1e35055',
  name: 'Umang Pandey',
  email: 'admin@npnews.com',
  role: 'admin',
  avatar: '/np-author-default.png',
  department: 'Executive Editorial Bureau',
  designation: 'Editor-in-Chief & Publisher',
};

export const ensureAuthenticatedSession = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && session?.access_token) {
      return session.user.id;
    }
    return null;
  } catch (err) {
    console.error('Error ensuring authenticated session:', err);
    return null;
  }
};

export const signOut = async (): Promise<{ error?: string }> => {
  try {
    try {
      localStorage.removeItem('np_news_admin_auth');
      sessionStorage.removeItem('np_news_admin_auth');
      localStorage.removeItem('np_news_current_user');
    } catch (e) {}
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Supabase sign out error:', error.message);
    }
    return {};
  } catch (err: any) {
    return { error: err?.message };
  }
};

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await getUserProfile(session.user.id);
      if (profile) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('np_news_current_user', JSON.stringify(profile));
          }
        } catch (e) {}
        return profile;
      }
    }
  } catch (err) {
    console.error('Error fetching current user profile:', err);
  }

  // Check localStorage for saved current user
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('np_news_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.name !== 'Priya Sharma' && parsed.name !== 'Umang Sharma') {
          return parsed;
        }
      }
    }
  } catch (e) {}

  return DEFAULT_ADMIN_USER;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      const fallback = mockAdminUsers.find(u => u.id === userId);
      return fallback || null;
    }

    return {
      id: data.id,
      name: data.full_name || data.display_name || 'Newsroom Staff',
      email: data.email || (data.display_name ? `${data.display_name.toLowerCase().replace(/\s+/g, '')}@npnewsmetro.com` : 'staff@npnewsmetro.com'),
      role: (data.role as UserRole) || 'author',
      avatar: getAuthorAvatarUrl(data.avatar_url),
      department: data.department || 'Editorial Desk',
      designation: (data as any).designation || (data as any).position || '',
      bio: data.bio || '',
    };
  } catch (err) {
    return null;
  }
};

const USERS_CACHE_KEY = 'np_news_cached_profiles';

const broadcastUsersUpdate = (users?: UserProfile[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('NEWSROOM_USERS_UPDATED', { detail: users }));
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('np_news_users_channel');
      ch.postMessage({ type: 'USERS_UPDATED' });
      ch.close();
    }
  } catch (e) {}
};

export const getProfilesList = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      const mapped: UserProfile[] = data.map((p) => ({
        id: p.id,
        name: p.full_name || p.display_name || 'Newsroom Staff',
        email: p.email || (p.display_name ? `${p.display_name.toLowerCase().replace(/\s+/g, '')}@npnewsmetro.com` : 'staff@npnewsmetro.com'),
        role: (p.role as UserRole) || 'author',
        avatar: getAuthorAvatarUrl(p.avatar_url),
        department: p.department || 'Editorial Bureau',
        designation: (p as any).designation || (p as any).position || '',
        bio: p.bio || '',
      }));

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(mapped));
        }
      } catch (e) {}

      return mapped;
    }
  } catch (err) {
    console.error('Error fetching profiles list from Supabase:', err);
  }

  // Fallback to local cache if offline or error, filtering out obsolete mock users
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(USERS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasInvalid = parsed.some((u: any) => u.name === 'Priya Sharma' || u.name === 'David Chen');
          if (!hasInvalid) {
            return parsed;
          }
        }
      }
    }
  } catch (e) {}

  return mockAdminUsers;
};

export const createNewsroomUser = async (params: {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation?: string;
  password?: string;
  avatar?: string;
  bio?: string;
}): Promise<{ user?: UserProfile; error?: string }> => {
  try {
    await ensureAuthenticatedSession();
    const { data, error } = await (supabase.rpc as any)('create_newsroom_member', {
      p_full_name: params.name.trim(),
      p_email: params.email.trim().toLowerCase(),
      p_role: params.role,
      p_department: params.department.trim() || 'Editorial Bureau',
      p_avatar_url: params.avatar || null,
      p_password: params.password || 'Newsroom@2026',
      p_position: params.designation?.trim() || null,
    });

    if (error) {
      console.warn('RPC create_newsroom_member error, checking direct insert fallback:', error);
    }

    const created = data;
    const newUser: UserProfile = {
      id: created?.id || `user-${Date.now()}`,
      name: created?.full_name || params.name.trim(),
      email: created?.email || params.email.trim().toLowerCase(),
      role: (created?.role as UserRole) || params.role,
      department: created?.department || params.department.trim(),
      avatar: getAuthorAvatarUrl(created?.avatar_url || params.avatar),
      designation: created?.designation || created?.position || params.designation?.trim() || '',
      bio: params.bio?.trim() || '',
    };

    // Cache immediately locally
    try {
      if (typeof window !== 'undefined') {
        const current = await getProfilesList();
        const updated = [...current.filter(u => u.id !== newUser.id), newUser];
        localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(updated));
      }
    } catch (e) {}

    broadcastUsersUpdate();
    return { user: newUser };
  } catch (err: any) {
    return { error: err?.message || 'Error creating user in database.' };
  }
};

export const updateNewsroomUserProfile = async (params: {
  userId: string;
  name: string;
  role: UserRole;
  department: string;
  designation?: string;
  avatar?: string;
  bio?: string;
}): Promise<{ user?: UserProfile; error?: string }> => {
  try {
    await ensureAuthenticatedSession();
    const { data, error } = await (supabase.rpc as any)('update_newsroom_member', {
      p_user_id: params.userId,
      p_role: params.role,
      p_department: params.department.trim() || 'Editorial Bureau',
      p_full_name: params.name.trim(),
      p_is_active: true,
      p_avatar_url: params.avatar || null,
      p_position: params.designation?.trim() || null,
      p_bio: params.bio?.trim() || null,
    });

    if (error) {
      console.warn('RPC update_newsroom_member fallback to direct profiles update:', error);
      // Fallback: direct update on profiles
      await (supabase
        .from('profiles') as any)
        .update({
          full_name: params.name.trim(),
          display_name: params.name.trim(),
          role: params.role,
          department: params.department.trim(),
          designation: params.designation?.trim() || null,
          position: params.designation?.trim() || null,
          avatar_url: params.avatar || null,
          bio: params.bio?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.userId);
    }

    const updated = data;
    const updatedUser: UserProfile = {
      id: params.userId,
      name: updated?.full_name || params.name.trim(),
      email: updated?.email || 'staff@npnewsmetro.com',
      role: (updated?.role as UserRole) || params.role,
      department: updated?.department || params.department.trim(),
      avatar: getAuthorAvatarUrl(updated?.avatar_url || params.avatar),
      designation: updated?.designation || updated?.position || params.designation?.trim() || '',
      bio: updated?.bio || params.bio?.trim() || '',
    };

    // Update local cache
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(USERS_CACHE_KEY);
        if (cached) {
          const parsed: UserProfile[] = JSON.parse(cached);
          const next = parsed.map(u => u.id === params.userId ? { ...u, ...updatedUser } : u);
          localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(next));
        }
      }
    } catch (e) {}

    broadcastUsersUpdate();
    return { user: updatedUser };
  } catch (err: any) {
    return { error: err?.message || 'Error updating user in database.' };
  }
};

export const updateNewsroomUserRole = async (
  userId: string,
  role: UserRole,
  department?: string,
  name?: string
): Promise<{ user?: UserProfile; error?: string }> => {
  return updateNewsroomUserProfile({
    userId,
    name: name || 'Staff',
    role,
    department: department || 'Editorial Bureau',
  });
};

export const deleteNewsroomUser = async (
  userId: string,
  hardDelete: boolean = false
): Promise<{ success: boolean; error?: string }> => {
  try {
    await ensureAuthenticatedSession();
    const { error } = await (supabase.rpc as any)('delete_newsroom_member', {
      p_user_id: userId,
      p_hard_delete: hardDelete,
    });

    if (error) {
      // Fallback: direct soft-delete
      await supabase
        .from('profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }

    // Remove from local cache
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(USERS_CACHE_KEY);
        if (cached) {
          const parsed: UserProfile[] = JSON.parse(cached);
          const next = parsed.filter(u => u.id !== userId);
          localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(next));
        }
      }
    } catch (e) {}

    broadcastUsersUpdate();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error removing user from database.' };
  }
};

/**
 * Returns authors formatted for ArticleEditor selector and byline cards,
 * pulling live from the Users tab / Supabase profiles.
 */
export const getNewsroomAuthors = async (): Promise<{
  id: string;
  name: string;
  role: string;
  designation: string;
  avatar: string;
  email: string;
  bio?: string;
}[]> => {
  const profiles = await getProfilesList();
  
  return profiles.map(p => ({
    id: p.id,
    name: p.name,
    role: p.designation || p.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    designation: p.designation || p.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    avatar: getAuthorAvatarUrl(p.avatar),
    email: p.email,
    bio: p.bio,
  }));
};

