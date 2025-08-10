import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Target, ShoppingCart } from "lucide-react";
import { getCategoryStyles } from "@/lib/categoryColors";

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
    <div className="w-64 bg-forum-sidebar border-r border-border p-4 space-y-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold mb-4">Categorías</h2>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const styles = getCategoryStyles(category.id);
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group relative w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-forum-hover text-primary shadow-sm'
                    : 'hover:bg-forum-hover text-muted-foreground hover:text-foreground'
                } hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
              >
                <span className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-primary opacity-0 group-hover:opacity-100 rounded-r transition-opacity" />
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.description}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className={`text-xs group-hover:scale-105 transition-transform ${styles.count}`}>
                  {category.count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloque informativo eliminado según solicitud */}
    </div>
  );
};