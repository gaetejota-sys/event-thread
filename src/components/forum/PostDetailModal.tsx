import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Clock, User, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { CommentCard } from "./CommentCard";
import { CommentForm } from "./CommentForm";
import { PollCard } from "./PollCard";
import { useComments } from "@/hooks/useComments";
import { usePolls } from "@/hooks/usePolls";
import { Post } from "@/types/post";

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
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
    case 'próximas carreras':
      return 'bg-gradient-button text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const PostDetailModal = ({ post, isOpen, onClose }: PostDetailModalProps) => {
  if (!post) return null;

  const { comments, loading, createComment } = useComments(post.id);
  const { polls, loading: pollsLoading, createPoll, vote, addOption } = usePolls(post.id);
  const createdDate = new Date(post.created_at);
  const authorName = post.profiles?.display_name || "Usuario";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalles del post</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Post Header */}
          <div className="bg-forum-post border border-border rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center space-y-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-forum-hover">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{post.votes}</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-forum-hover">
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    <span className="font-medium text-primary">{authorName}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    hace {formatDistanceToNow(createdDate, { locale: es })}
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-foreground">
                  {post.title}
                </h1>
                
                <div className="text-foreground whitespace-pre-wrap">
                  {post.content}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {comments.length} comentarios
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comentarios</h3>
            
            {/* Comment Form */}
            <CommentForm 
              onSubmit={createComment} 
              onCreatePoll={createPoll}
              loading={loading} 
            />
            
            {/* Polls Section */}
            {polls.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-semibold">Encuestas</h4>
                {polls.map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    onVote={vote}
                    onAddOption={addOption}
                  />
                ))}
              </div>
            )}

            {/* Comments List */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando comentarios...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Sé el primero en comentar este post
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};