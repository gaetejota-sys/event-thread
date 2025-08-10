import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, User, Edit, Trash2, Check, X, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Comment } from "@/types/post";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface CommentCardProps {
  comment: Comment;
  onDelete?: (commentId: string) => Promise<boolean>;
  onUpdate?: (commentId: string, content: string) => Promise<boolean>;
}

export const CommentCard = ({ comment, onDelete, onUpdate }: CommentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  
  const createdDate = new Date(comment.created_at);
  const updatedDate = new Date(comment.updated_at);
  const authorName = comment.profiles?.display_name || "Usuario";
  const isOwner = user?.id === comment.user_id;
  const isEdited = comment.created_at !== comment.updated_at;
  const canMessage = !!user && user.id !== comment.user_id;

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    await onDelete(comment.id);
    setIsDeleting(false);
  };

  const handleUpdate = async () => {
    if (!onUpdate || !editContent.trim()) return;
    setIsUpdating(true);
    const success = await onUpdate(comment.id, editContent.trim());
    if (success) {
      setIsEditing(false);
    }
    setIsUpdating(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="bg-forum-post border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <User className="h-3 w-3" />
          <Link to={`/u/${comment.user_id}`} className="font-medium text-primary hover:underline">{authorName}</Link>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            hace {formatDistanceToNow(createdDate, { locale: es })}
            {isEdited && (
              <span className="ml-2 text-xs text-muted-foreground">(editado)</span>
            )}
          </div>
          {canMessage && (
            <Link to={`/messages?to=${comment.user_id}`} className="ml-2">
              <Button variant="outline" size="sm" className="h-6 px-2">
                <Send className="h-3 w-3 mr-1" />
                Mensaje
              </Button>
            </Link>
          )}
        </div>
        
        {isOwner && (
          <div className="flex items-center space-x-1">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isUpdating}
          />
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={!editContent.trim() || isUpdating}
              className="bg-gradient-button"
            >
              <Check className="h-3 w-3 mr-1" />
              {isUpdating ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              <X className="h-3 w-3 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-foreground whitespace-pre-wrap">
          {comment.content}
        </div>
      )}

      {/* Image attachments */}
      {comment.image_urls && comment.image_urls.length > 0 && !isEditing && (
        <div className="grid grid-cols-2 gap-2">
          {comment.image_urls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Imagen ${index + 1}`}
              className="rounded-lg max-h-64 object-cover w-full"
            />
          ))}
        </div>
      )}

      {/* Video attachments */}
      {comment.video_urls && comment.video_urls.length > 0 && !isEditing && (
        <div className="space-y-2">
          {comment.video_urls.map((url, index) => (
            <video
              key={index}
              src={url}
              controls
              className="rounded-lg max-h-64 w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};