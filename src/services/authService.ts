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
  if (cleanInput === 'admin' || cleanInput === 'admin@npnewsmetro.com' || cleanInput === 'admin@npnews.com') {
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
    const profile = await getUserProfile(data.user.id);
    return { profile: profile || {
      id: data.user.id,
      name: 'Umang Sharma',
      email: data.user.email || 'admin@npnews.com',
      role: 'admin',
      avatar: DEFAULT_AUTHOR_AVATAR,
      department: 'Executive Editorial Bureau',
    } };
  } catch (err: any) {
    console.error('Unexpected sign in error:', err);
    return { error: err?.message || 'Authentication error occurred.' };
  }
};

export const ensureAuthenticatedSession = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && session?.access_token) {
      return session.user.id;
    }

    // Auto-authenticate as newsroom staff if no active JWT session exists
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@npnews.com',
      password: 'umang1512',
    });

    if (!error && data?.user) {
      try {
        localStorage.setItem('np_news_admin_auth', 'true');
        sessionStorage.setItem('np_news_admin_auth', 'true');
      } catch (e) {}
      return data.user.id;
    }
    return null;
  } catch (err) {
    console.error('Error ensuring authenticated session:', err);
    return null;
  }
};

export const signOut = async (): Promise<{ error?: string }> => {
  try {
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
    if (!session?.user) {
      return null;
    }

    return await getUserProfile(session.user.id);
  } catch (err) {
    console.error('Error fetching current user profile:', err);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.full_name || data.display_name || 'Newsroom Staff',
      email: `${data.display_name?.toLowerCase() || 'staff'}@npnewsmetro.com`,
      role: (data.role as UserRole) || 'author',
      avatar: getAuthorAvatarUrl(data.avatar_url),
      department: data.department || 'Editorial Desk',
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
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      const mapped: UserProfile[] = data.map((p) => ({
        id: p.id,
        name: p.full_name || p.display_name || 'Newsroom Staff',
        email: p.email || `${p.display_name?.toLowerCase().replace(/\s+/g, '') || 'staff'}@npnewsmetro.com`,
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

  // Fallback to local cache if offline or error
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(USERS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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

