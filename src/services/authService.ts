import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/admin';
import { mockAdminUsers } from '../data/mockAdminData';

export const signInWithCredentials = async (
  usernameOrEmail: string,
  password: string
): Promise<{ profile?: UserProfile; error?: string }> => {
  const cleanInput = usernameOrEmail.trim().toLowerCase();
  const email = cleanInput.includes('@') ? cleanInput : `${cleanInput}@npnewsmetro.in`;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password.trim(),
    });

    if (error) {
      // If error, return clean message
      return { error: error.message || 'Invalid credentials. Please verify your username/password.' };
    }

    if (!data.user) {
      return { error: 'Authentication failed. User not found.' };
    }

    // Fetch corresponding profile
    const profile = await getUserProfile(data.user.id);
    return { profile: profile || undefined };
  } catch (err: any) {
    console.error('Unexpected sign in error:', err);
    return { error: err?.message || 'Authentication error occurred.' };
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
      email: `${data.display_name?.toLowerCase() || 'staff'}@npnewsmetro.in`,
      role: (data.role as UserRole) || 'author',
      avatar: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
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
      email: `${p.display_name?.toLowerCase().replace(/\s+/g, '') || 'staff'}@npnewsmetro.in`,
      role: (p.role as UserRole) || 'author',
      avatar: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      department: p.department || 'Editorial Bureau',
    }));
  } catch (err) {
    console.error('Error fetching profiles list:', err);
    return mockAdminUsers;
  }
};
