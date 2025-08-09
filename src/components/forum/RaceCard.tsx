import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User } from "lucide-react";
import { Race } from "@/types/race";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RaceCardProps extends Race {}

export const RaceCard = ({ 
  title, 
  description, 
  location, 
  event_date, 
  image_urls, 
  created_at,
  profiles 
}: RaceCardProps) => {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-gradient-button text-white">
            Carrera
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-1" />
            Usuario
          </div>
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {image_urls && image_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {image_urls.slice(0, 4).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Imagen ${index + 1} de ${title}`}
                className="w-full h-32 object-cover rounded-md"
              />
            ))}
          </div>
        )}
        
        <p className="text-muted-foreground">{description}</p>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(event_date), "PPP", { locale: es })}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {location}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Publicado {format(new Date(created_at), "PPP", { locale: es })}
        </div>
      </CardContent>
    </Card>
  );
};