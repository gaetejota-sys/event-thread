import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Menu, User, Calendar, Plus, ShoppingCart, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onAnunciarCarrera?: () => void;
  onVerCalendario?: () => void;
}

export const Header = ({ onAnunciarCarrera, onVerCalendario }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    <header className="h-16 bg-gradient-header shadow-lg relative overflow-hidden">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-foreground">CHILENERUS</h1>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
            onClick={() => navigate('/buy-and-sell')}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Compra y Venta
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
            onClick={onAnunciarCarrera}
          >
            <Plus className="h-4 w-4 mr-2" />
            Anunciar Carrera
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
            onClick={() => onVerCalendario ? onVerCalendario() : navigate('/calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver Calendario
          </Button>
        </div>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30">
                <User className="h-4 w-4 mr-2" />
                {user.user_metadata?.display_name || user.email?.split('@')[0]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
            className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
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