import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface PublicProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  comuna: string | null;
  phone: string | null;
  contact_email: string | null;
  role_owner: boolean | null;
  role_corral: boolean | null;
  role_aficionado: boolean | null;
  role_jinete: boolean | null;
  role_preparador: boolean | null;
  primary_role: string | null;
}

export const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, bio, avatar_url, comuna, phone, contact_email, role_owner, role_corral, role_aficionado, role_jinete, role_preparador, primary_role')
        .eq('id', id)
        .single();
      setProfile(data as PublicProfile);
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  const roleLabels = [
    profile?.role_owner ? 'Propietario' : null,
    profile?.role_corral ? 'Corral' : null,
    profile?.role_aficionado ? 'Aficionado' : null,
    profile?.role_jinete ? 'Jinete' : null,
    profile?.role_preparador ? 'Preparador' : null,
  ].filter(Boolean) as string[];

  const canMessage = !!user && user.id !== id;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6 max-w-3xl">
        {loading ? (
          <div className="text-muted-foreground">Cargando perfil...</div>
        ) : !profile ? (
          <div className="text-muted-foreground">Perfil no encontrado.</div>
        ) : (
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name || 'Usuario'} />
                ) : (
                  <AvatarFallback>{(profile.display_name || 'U').substring(0,2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile.display_name || 'Usuario'}</h1>
                <div className="text-sm text-muted-foreground">
                  {profile.primary_role ? `Rol: ${profile.primary_role}` : (roleLabels.length ? `Roles: ${roleLabels.join(', ')}` : null)}
                </div>
                {profile.comuna && (
                  <div className="text-sm text-muted-foreground">Comuna: {profile.comuna}</div>
                )}
              </div>
              {canMessage && (
                <Button onClick={() => navigate(`/messages?to=${profile.id}`)} className="bg-gradient-button">
                  Enviar mensaje
                </Button>
              )}
            </div>

            {profile.bio && (
              <div>
                <h2 className="text-sm font-medium mb-1">Bio</h2>
                <p className="text-sm text-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {profile.phone && (
                <div>
                  <div className="text-muted-foreground">Teléfono</div>
                  <div>{profile.phone}</div>
                </div>
              )}
              {profile.contact_email && (
                <div>
                  <div className="text-muted-foreground">Correo</div>
                  <div>{profile.contact_email}</div>
                </div>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default UserProfilePage;


