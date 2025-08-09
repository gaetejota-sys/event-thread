import { Button } from "@/components/ui/button";
import { LogIn, Menu } from "lucide-react";

export const Header = () => {
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
        
        <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30">
          <LogIn className="h-4 w-4 mr-2" />
          Iniciar Sesión
        </Button>
      </div>
    </header>
  );
};