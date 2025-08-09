import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Calendar, Plus, Clock, Archive, Users, Wrench, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryProps {
  title: string;
  icon: React.ReactNode;
  count?: number;
  description?: string;
  onCreatePost?: () => void;
}

const Category = ({ title, icon, count = 0, description, onCreatePost }: CategoryProps) => (
  <div className="bg-forum-sidebar border border-border rounded-lg p-4 hover:bg-forum-hover transition-colors cursor-pointer">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium text-sm">{title}</span>
      </div>
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </div>
    {description && (
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
    )}
    <Button
      variant="outline"
      size="sm"
      className="w-full text-xs"
      onClick={onCreatePost}
    >
      <Plus className="h-3 w-3 mr-1" />
      Crear Post
    </Button>
  </div>
);

export const Sidebar = () => {
  return (
    <aside className="w-72 p-4 space-y-4 bg-forum-sidebar/50">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground mb-4">Categorías</h2>
        
        <Category
          title="Próximas Carreras"
          icon={<Clock className="h-4 w-4 text-category-training" />}
          count={0}
          description="Carreras que están por venir"
        />
        
        <Category
          title="Carreras Pasadas"
          icon={<Archive className="h-4 w-4 text-category-equipment" />}
          count={0}
          description="Archivos de carreras que ya ocurrieron"
        />
        
        <Category
          title="General"
          icon={<Users className="h-4 w-4 text-category-general" />}
          count={0}
          description="Discusiones generales sobre carreras"
        />
        
        <Category
          title="Técnica"
          icon={<Wrench className="h-4 w-4 text-category-technical" />}
          count={0}
          description="Discusiones técnicas sobre carreras"
        />
        
        <div className="pt-4 border-t border-border">
          <Link to="/buy-and-sell">
            <div className="bg-forum-sidebar border border-border rounded-lg p-4 hover:bg-forum-hover transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Compra y Venta</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Publica tus avisos clasificados
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Crear Aviso
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
};