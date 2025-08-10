import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Menu, Calendar, Plus, ShoppingCart, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

interface HeaderProps {
  onAnunciarCarrera?: () => void;
  onVerCalendario?: () => void;
}

export const Header = ({ onAnunciarCarrera, onVerCalendario }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const [logoError, setLogoError] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión. Intenta de nuevo.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 shadow-lg relative overflow-hidden">
      {/* Decorative subtle overlays */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-300 blur-3xl" />
      </div>
      <div className="container mx-auto max-w-screen-2xl px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-primary-foreground/90 hover:bg-white/15 md:hidden rounded-full">
            <Menu className="h-5 w-5" />
          </Button>
          <button className="flex items-center" onClick={() => navigate('/')} title="Inicio">
            {logoError ? (
              <span className="text-white font-semibold text-lg tracking-wide">Chileneros</span>
            ) : (
              <picture>
                <source srcSet="/logo-chileneros.svg" type="image/svg+xml" />
                <img
                  src="/logo-chileneros.png"
                  alt="Chileneros"
                  className="h-9 md:h-11 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              </picture>
            )}
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary"
            size="sm"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm shadow-sm hover:shadow animate-fade-in-up"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm shadow-sm hover:shadow animate-fade-in-up"
            onClick={() => navigate('/buy-and-sell')}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Compra y Venta
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm shadow-sm hover:shadow animate-fade-in-up"
            onClick={onAnunciarCarrera}
          >
            <Plus className="h-4 w-4 mr-2" />
            Anunciar Carrera
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm shadow-sm hover:shadow animate-fade-in-up"
            onClick={() => onVerCalendario ? onVerCalendario() : navigate('/calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver Calendario
          </Button>
        </div>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm shadow-sm hover:shadow pr-3 animate-fade-in-up">
                <Avatar className="h-6 w-6 mr-2">
                  {/* Preferimos profiles.avatar_url si existe; fallback a metadatos */}
                  {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                    <AvatarImage src={(profile?.avatar_url || user.user_metadata?.avatar_url) as string} alt={(profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0]) as string} />
                  ) : (
                    <AvatarFallback>
                      {(profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'U').substring(0,2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/messages')}>
                Mensajes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm shadow-sm hover:shadow animate-fade-in-up"
            onClick={() => navigate("/auth")}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Iniciar Sesión
          </Button>
        )}
      </div>
    </header>
  );
};