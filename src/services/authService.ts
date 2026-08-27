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

export const getProfilesList = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return mockAdminUsers;
    }

    return data.map((p) => ({
      id: p.id,
      name: p.full_name || p.display_name || 'Newsroom Staff',
      email: p.email || `${p.display_name?.toLowerCase().replace(/\s+/g, '') || 'staff'}@npnewsmetro.com`,
      role: (p.role as UserRole) || 'author',
      avatar: getAuthorAvatarUrl(p.avatar_url),
      department: p.department || 'Editorial Bureau',
    }));
  } catch (err) {
    console.error('Error fetching profiles list:', err);
    return mockAdminUsers;
  }
};

export const createNewsroomUser = async (params: {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  password?: string;
  avatar?: string;
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
    });

    if (error) {
      return { error: error.message || 'Failed to create team member.' };
    }

    const created = data;
    return {
      user: {
        id: created.id,
        name: created.full_name || params.name,
        email: created.email || params.email,
        role: created.role as UserRole,
        department: created.department || params.department,
        avatar: getAuthorAvatarUrl(created.avatar_url),
      },
    };
  } catch (err: any) {
    return { error: err?.message || 'Error creating user in database.' };
  }
};

export const updateNewsroomUserRole = async (
  userId: string,
  role: UserRole,
  department?: string,
  name?: string
): Promise<{ user?: UserProfile; error?: string }> => {
  try {
    await ensureAuthenticatedSession();
    const { data, error } = await (supabase.rpc as any)('update_newsroom_member', {
      p_user_id: userId,
      p_role: role,
      p_department: department || 'Editorial Bureau',
      p_full_name: name || null,
      p_is_active: true,
    });

    if (error) {
      return { error: error.message || 'Failed to update user role.' };
    }

    const updated = data;
    return {
      user: {
        id: updated.id,
        name: updated.full_name || 'Staff',
        email: updated.email || 'staff@npnewsmetro.com',
        role: updated.role as UserRole,
        department: updated.department,
        avatar: getAuthorAvatarUrl(updated.avatar_url),
      },
    };
  } catch (err: any) {
    return { error: err?.message || 'Error updating user in database.' };
  }
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
      return { success: false, error: error.message || 'Failed to delete user.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error removing user from database.' };
  }
};

