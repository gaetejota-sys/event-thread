import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Target, ShoppingCart, Plus } from "lucide-react";

interface ForumSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  postsCount: {
    proximasCarreras: number;
    carrerasPasadas: number;
    temasGenerales: number;
    desafios: number;
    compraVenta: number;
  };
}

export const ForumSidebar = ({ selectedCategory, onCategoryChange, postsCount }: ForumSidebarProps) => {
  const categories = [
    {
      id: "all",
      name: "Todos los posts",
      icon: Users,
      count: Object.values(postsCount).reduce((a, b) => a + b, 0),
      description: "Todos los temas del foro"
    },
    {
      id: "Temas generales",
      name: "Temas generales",
      icon: Users,
      count: postsCount.temasGenerales,
      description: "Discusiones generales sobre running"
    },
    {
      id: "Próximas carreras",
      name: "Próximas carreras",
      icon: CalendarDays,
      count: postsCount.proximasCarreras,
      description: "Carreras que están por venir"
    },
    {
      id: "Carreras pasadas",
      name: "Carreras pasadas",
      icon: CalendarDays,
      count: postsCount.carrerasPasadas,
      description: "Archivos de carreras ya ocurridas"
    },
    {
      id: "Desafíos",
      name: "Desafíos",
      icon: Target,
      count: postsCount.desafios,
      description: "Retos y desafíos para corredores"
    },
    {
      id: "Compra venta",
      name: "Compra venta",
      icon: ShoppingCart,
      count: postsCount.compraVenta,
      description: "Compra y venta de equipamiento"
    }
  ];

  return (
    <div className="w-64 bg-forum-sidebar border-r border-border p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Categorías</h2>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-forum-hover text-primary'
                    : 'hover:bg-forum-hover text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.description}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCategory === "Próximas carreras" && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Próximas Carreras</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Aquí se muestran todas las carreras anunciadas. Los usuarios pueden comentar pero no crear nuevos temas.
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Solo se crean al anunciar carreras
          </Button>
        </div>
      )}
    </div>
  );
};