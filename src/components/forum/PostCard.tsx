import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowUp, ArrowDown, Clock, Edit2, Trash2, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EditForumPostForm } from "./EditForumPostForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  created_at: string | Date;
  votes: number;
  comments_count: number;
  image_urls?: string[];
  video_urls?: string[];
  user_id?: string;
  onViewComments?: () => void;
  onTitleClick?: () => void;
  onDelete?: (postId: string) => Promise<boolean>;
  onUpdate?: (postId: string, data: any) => Promise<boolean>;
  showCategory?: boolean;
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'temas generales':
      return 'bg-category-general text-white';
    case 'próximas carreras':
      return 'bg-gradient-button text-white';
    case 'carreras pasadas':
      return 'bg-category-training text-white';
    case 'desafíos':
      return 'bg-category-technical text-white';
    case 'compra venta':
      return 'bg-category-equipment text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const PostCard = ({ 
  id,
  title, 
  content, 
  author, 
  category, 
  created_at, 
  votes, 
  comments_count, 
  image_urls,
  video_urls,
  user_id,
  onViewComments,
  onTitleClick,
  onDelete,
  onUpdate,
  showCategory = true
}: PostCardProps) => {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const createdDate = typeof created_at === 'string' ? new Date(created_at) : created_at;
  
  // Check if current user is the owner
  const isOwner = user && user_id && user.id === user_id;

  const handleDelete = async () => {
    if (onDelete) {
      const success = await onDelete(id);
      if (success) {
        setShowDeleteDialog(false);
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {showCategory && (
                <Badge className={`text-xs ${getCategoryColor(category)}`}>
                  {category}
                </Badge>
              )}
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                hace {formatDistanceToNow(createdDate, { locale: es })}
              </div>
            </div>
            
            {/* Actions menu for owner */}
            {isOwner && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onUpdate && (
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <h3 
            className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer"
            onClick={onTitleClick}
          >
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-3">
            {content}
          </p>
          
          {/* Multimedia Content */}
          {image_urls && image_urls.length > 0 && (
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-2">
                {image_urls.slice(0, 4).map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border"
                    />
                    {index === 3 && image_urls.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          +{image_urls.length - 3} más
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {video_urls && video_urls.length > 0 && (
            <div className="mt-3">
              <video
                src={video_urls[0]}
                className="w-full h-32 object-cover rounded-lg border border-border"
                controls={false}
                muted
              />
            </div>
          )}
          
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
              {comments_count} comentarios
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && onUpdate && (
        <EditForumPostForm
          post={{ 
            id, 
            title, 
            content, 
            category, 
            image_urls, 
            video_urls,
            user_id: user_id || '',
            created_at: typeof created_at === 'string' ? created_at : created_at.toISOString(),
            updated_at: typeof created_at === 'string' ? created_at : created_at.toISOString(),
            votes,
            comments_count,
            race_id: undefined,
            profiles: null
          }}
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleEditSuccess}
          onUpdate={onUpdate}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar post?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El post será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};