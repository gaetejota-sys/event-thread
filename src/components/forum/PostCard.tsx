import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  createdAt: Date;
  votes: number;
  comments: number;
  onViewComments?: () => void;
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'entrenamiento':
      return 'bg-category-training text-white';
    case 'equipamiento':
      return 'bg-category-equipment text-white';
    case 'general':
      return 'bg-category-general text-white';
    case 'técnica':
      return 'bg-category-technical text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const PostCard = ({
  title,
  content,
  author,
  category,
  createdAt,
  votes,
  comments,
  onViewComments
}: PostCardProps) => {
  return (
    <div className="bg-forum-post border border-border rounded-lg p-4 shadow-card hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex flex-col items-center space-y-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-forum-hover">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{votes}</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-forum-hover">
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs ${getCategoryColor(category)}`}>
              {category}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              hace {formatDistanceToNow(createdAt, { locale: es })}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-3">
            {content}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              por <span className="font-medium text-primary">{author}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-forum-hover"
              onClick={onViewComments}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Ver comentarios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};