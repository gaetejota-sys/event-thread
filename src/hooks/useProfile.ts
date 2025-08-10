import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone?: string | null;
  contact_email?: string | null;
  comuna?: string | null;
  role_owner?: boolean | null;
  role_corral?: boolean | null;
  role_aficionado?: boolean | null;
  role_jinete?: boolean | null;
  role_preparador?: boolean | null;
  primary_role?: 'propietario' | 'corral' | 'aficionado' | 'jinete' | 'preparador' | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Intento con columnas extendidas
      const extendedColumns = 'id, display_name, bio, avatar_url, phone, contact_email, comuna, role_owner, role_corral, role_aficionado, role_jinete, role_preparador, primary_role';
      let { data, error } = await supabase
        .from('profiles')
        .select(extendedColumns)
        .eq('id', user.id)
        .single();

      if (error) {
        // Si la tabla no tiene columnas extendidas en esta instancia, hacemos fallback
        if ((error as any).code === '42703') {
          const baseColumns = 'id, display_name, bio, avatar_url';
          const { data: baseData, error: baseErr } = await supabase
            .from('profiles')
            .select(baseColumns)
            .eq('id', user.id)
            .single();
          if (baseErr) throw baseErr;
          setProfile(baseData as UserProfile);
          return;
        }
        throw error;
      }
      setProfile(data as UserProfile);
    } catch (err) {
      console.error('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false };
    try {
      setSaving(true);
      const extendedColumns = 'id, display_name, bio, avatar_url, phone, contact_email, comuna, role_owner, role_corral, role_aficionado, role_jinete, role_preparador, primary_role';
      let { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select(extendedColumns)
        .single();

      if (error) {
        if ((error as any).code === '42703') {
          // Intentar solo con campos base para instancias sin columnas extendidas
          const baseOnly = {
            display_name: updates.display_name,
            bio: updates.bio,
            avatar_url: updates.avatar_url,
            updated_at: new Date().toISOString(),
          } as any;
          const { data: baseData, error: baseErr } = await supabase
            .from('profiles')
            .update(baseOnly)
            .eq('id', user.id)
            .select('id, display_name, bio, avatar_url')
            .single();
          if (baseErr) throw baseErr;
          setProfile(baseData as UserProfile);
          return { success: true };
        }
        throw error;
      }
      setProfile(data as UserProfile);
      return { success: true };
    } catch (err) {
      console.error('Error updating profile', err);
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { success: false, url: null as string | null };
    try {
      const ext = file.name.split('.')?.pop();
      const key = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabaseClient.storage.from('avatars').upload(key, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabaseClient.storage.from('avatars').getPublicUrl(key);
      return { success: true, url: publicUrl };
    } catch (err) {
      console.error('Error uploading avatar', err);
      return { success: false, url: null };
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { profile, loading, saving, fetchProfile, updateProfile, uploadAvatar };
};


