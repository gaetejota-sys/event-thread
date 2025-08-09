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
    </div>
  );
};