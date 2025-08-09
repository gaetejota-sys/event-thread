import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, User } from "lucide-react";
import { Comment } from "@/types/post";

interface CommentCardProps {
  comment: Comment;
}

export const CommentCard = ({ comment }: CommentCardProps) => {
  const createdDate = new Date(comment.created_at);
  const authorName = "Usuario";

  return (
    <div className="bg-forum-post border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <User className="h-3 w-3" />
        <span className="font-medium text-primary">{authorName}</span>
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          hace {formatDistanceToNow(createdDate, { locale: es })}
        </div>
      </div>
      
      <div className="text-sm text-foreground whitespace-pre-wrap">
        {comment.content}
      </div>

      {/* Image attachments */}
      {comment.image_urls && comment.image_urls.length > 0 && (
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
      {comment.video_urls && comment.video_urls.length > 0 && (
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