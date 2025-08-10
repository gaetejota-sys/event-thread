import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { COMUNAS_CHILE } from '@/data/comunas-chile';
import { useToast } from '@/hooks/use-toast';
import { Seo } from '@/components/seo/Seo';
import { Trash2 } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const { profile, loading, saving, updateProfile, uploadAvatar, fetchProfile } = useProfile();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState<string>(profile?.display_name || '');
  const [bio, setBio] = useState<string>(profile?.bio || '');
  const [localAvatar, setLocalAvatar] = useState<string | null>(profile?.avatar_url || null);
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [contactEmail, setContactEmail] = useState<string>(profile?.contact_email || (user?.email ?? ''));
  const [comuna, setComuna] = useState<string>(profile?.comuna || '');
  const [roleOwner, setRoleOwner] = useState<boolean>(!!profile?.role_owner);
  const [roleCorral, setRoleCorral] = useState<boolean>(!!profile?.role_corral);
  const [roleAficionado, setRoleAficionado] = useState<boolean>(!!profile?.role_aficionado);
  const [roleJinete, setRoleJinete] = useState<boolean>(!!profile?.role_jinete);
  const [rolePreparador, setRolePreparador] = useState<boolean>(!!profile?.role_preparador);
  const [primaryRole, setPrimaryRole] = useState<'propietario' | 'corral' | 'aficionado' | 'jinete' | 'preparador' | ''>(profile?.primary_role || '');

  // Sincroniza estado local cuando llega el perfil
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setLocalAvatar(profile.avatar_url || null);
      setPhone(profile.phone || '');
      setContactEmail(profile.contact_email || (user?.email ?? ''));
      setComuna(profile.comuna || '');
      setRoleOwner(!!profile.role_owner);
      setRoleCorral(!!profile.role_corral);
      setRoleAficionado(!!profile.role_aficionado);
      setRoleJinete(!!profile.role_jinete);
      setRolePreparador(!!profile.role_preparador);
      setPrimaryRole((profile.primary_role as any) || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, user?.email]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validación básica: tipo y tamaño (<= 3MB)
    const isImage = file.type.startsWith('image/');
    const maxSize = 3 * 1024 * 1024;
    if (!isImage || file.size > maxSize) {
      alert('Sube una imagen válida de hasta 3MB.');
      return;
    }

    // Recorte a cuadrado con canvas (center crop)
    const squareBlob = await cropImageToSquare(file, 512);
    const squareFile = new File([squareBlob], file.name, { type: squareBlob.type });
    const { success, url } = await uploadAvatar(squareFile);
    if (success && url) {
      setLocalAvatar(url);
      await updateProfile({ avatar_url: url });
    }
  };

  const cropImageToSquare = (file: File, outputSize: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return reject('No data');
        img.src = reader.result;
      };
      reader.onerror = reject;
      img.onload = () => {
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No ctx');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, outputSize, outputSize);
        canvas.toBlob((blob) => {
          if (!blob) return reject('No blob');
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    try {
      const result = await updateProfile({ 
        display_name: displayName.trim(), 
        bio: bio.trim(),
        phone: phone.trim(),
        contact_email: contactEmail.trim(),
        comuna,
        role_owner: roleOwner,
        role_corral: roleCorral,
        role_aficionado: roleAficionado,
        role_jinete: roleJinete,
        role_preparador: rolePreparador,
        primary_role: (primaryRole || null) as any,
      });
      if (result.success) {
        await fetchProfile();
        toast({ title: 'Perfil actualizado', description: 'Tus cambios se han guardado correctamente.' });
      } else {
        toast({ title: 'No se pudo guardar', description: 'Inténtalo nuevamente.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error al guardar', description: 'Revisa tu conexión e inténtalo otra vez.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Mi Perfil - Chileneros"
        description="Gestiona tu perfil, avatar y preferencias."
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        noindex
      />
      <Header />
      <main className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

        {loading ? (
          <div className="text-muted-foreground">Cargando perfil...</div>
        ) : !user ? (
          <div className="text-muted-foreground">Debes iniciar sesión para ver tu perfil.</div>
        ) : (
          <div className="space-y-6 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                {localAvatar ? (
                  <AvatarImage src={localAvatar} alt={displayName || user.email || 'Usuario'} />
                ) : (
                  <AvatarFallback>
                    {(displayName || user.email || 'U').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <label className="block text-sm font-medium mb-2">Cambiar avatar</label>
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*" onChange={handleAvatarChange} />
                  {localAvatar && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        // Quitar avatar del perfil (no borra archivo físico para evitar 404 en caché)
                        const res = await updateProfile({ avatar_url: null });
                        if (res.success) {
                          setLocalAvatar(null);
                          toast({ title: 'Avatar quitado' });
                        } else {
                          toast({ title: 'No se pudo quitar', variant: 'destructive' });
                        }
                      }}
                      title="Quitar avatar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre a mostrar</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 XXXX XXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Correo de contacto</label>
                <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comuna</label>
              <Select value={comuna} onValueChange={setComuna}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu comuna" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {COMUNAS_CHILE.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Roles</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={roleOwner} onCheckedChange={(v) => setRoleOwner(Boolean(v))} />
                  <span>Propietario de caballos</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={roleCorral} onCheckedChange={(v) => setRoleCorral(Boolean(v))} />
                  <span>Participa en un corral</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={roleAficionado} onCheckedChange={(v) => setRoleAficionado(Boolean(v))} />
                  <span>Aficionado</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={roleJinete} onCheckedChange={(v) => setRoleJinete(Boolean(v))} />
                  <span>Jinete</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={rolePreparador} onCheckedChange={(v) => setRolePreparador(Boolean(v))} />
                  <span>Preparador</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rol destacado en el perfil</label>
              <Select value={primaryRole} onValueChange={(v) => setPrimaryRole(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona rol principal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="propietario">Propietario</SelectItem>
                  <SelectItem value="corral">Corral</SelectItem>
                  <SelectItem value="aficionado">Aficionado</SelectItem>
                  <SelectItem value="jinete">Jinete</SelectItem>
                  <SelectItem value="preparador">Preparador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-button">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;


