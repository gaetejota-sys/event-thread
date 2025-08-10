import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getCategoryStyles } from "@/lib/categoryColors";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare, Send, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VoteButtons } from "./VoteButtons";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { CommentCard } from "./CommentCard";
import { CommentForm } from "./CommentForm";
import { PollCard } from "./PollCard";
import { ShareButtons } from "./ShareButtons";
import { useComments } from "@/hooks/useComments";
import { usePolls } from "@/hooks/usePolls";
import { Post } from "@/types/post";
import { formatPricesInText } from "@/lib/utils";

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

  const { comments, loading, createComment, deleteComment, updateComment } = useComments(post.id);
  const { polls, loading: pollsLoading, createPoll, vote, addOption } = usePolls(post.id);
  const createdDate = new Date(post.created_at);
  const authorName = post.profiles?.display_name || "Usuario";
  const avatarUrl = post.profiles?.avatar_url || undefined;
  const { user } = useAuth();
  const canMessage = !!user && user.id !== post.user_id;
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const images = (post.image_urls || []).filter((u) => typeof u === 'string' && u.trim().length > 0);
  const hasImages = images.length > 0;
  const openViewerAt = (idx: number) => { setViewerIndex(idx); setViewerOpen(true); };
  const nextImage = () => setViewerIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setViewerIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-xl">
        <DialogHeader className="pb-2 border-b border-border">
          <DialogTitle className="text-xl font-semibold truncate">{post.title}</DialogTitle>
          <DialogDescription className="sr-only">Detalle del post del foro</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 px-1 md:px-2">
          {/* Post Header */}
          <div className="relative bg-forum-post border border-border rounded-lg p-6 transition-all hover:shadow-lg animate-fade-in-up">
            <span className={`absolute left-0 top-0 h-full w-1 ${getCategoryStyles(post.category).dot} rounded-l-lg`} />
            <div className="flex items-start space-x-4">
              <VoteButtons postId={post.id} votes={post.votes} className="flex flex-col items-center space-y-2" />
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge className={`text-xs ${getCategoryStyles(post.category).badge}`}>
                    {post.category}
                  </Badge>
                  <Link to={`/u/${post.user_id}`} className="flex items-center text-sm text-muted-foreground space-x-2 hover:underline">
                    <Avatar className="h-8 w-8">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={authorName} />
                      ) : (
                        <AvatarFallback>
                          {authorName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium text-primary">{authorName}</span>
                  </Link>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    hace {formatDistanceToNow(createdDate, { locale: es })}
                  </div>
                  {canMessage && (
                    <Link to={`/messages?to=${post.user_id}`}>
                      <Button variant="outline" size="sm" className="h-7 ml-1">
                        <Send className="h-3 w-3 mr-1" />
                        Mensaje
                      </Button>
                    </Link>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold text-foreground">
                  {post.title}
                </h1>
                
                <div className="text-foreground whitespace-pre-wrap">
                  {formatPricesInText(post.content)}
                </div>

                <div className="pt-2">
                  <ShareButtons title={post.title} url={window.location.href} />
                </div>
                
                {/* Multimedia Content */}
                {hasImages && (
                  <div className="space-y-2">
                    <h4 className="text-md font-semibold">Imágenes</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {images.map((url, index) => (
                        <button
                          key={index}
                          className="relative w-40 h-40 md:w-44 md:h-44 bg-black rounded-md border border-border overflow-hidden"
                          onClick={() => openViewerAt(index)}
                          title="Ampliar imagen"
                        >
                          <img
                            src={url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-contain hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {post.video_urls && post.video_urls.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-md font-semibold">Videos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {post.video_urls.map((url, index) => (
                        <div key={index} className="relative w-32 h-32 md:w-36 md:h-36 bg-black rounded-md border border-border overflow-hidden">
                          <video
                            src={url}
                            className="w-full h-full object-contain"
                            controls
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
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
                  <CommentCard 
                    key={comment.id} 
                    comment={comment}
                    onDelete={deleteComment}
                    onUpdate={updateComment}
                  />
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
        {hasImages && (
          <Dialog open={viewerOpen} onOpenChange={setViewerOpen} modal={false}>
            <DialogContent aria-describedby={undefined} className="max-w-3xl w-[92vw] h-[70vh] p-0 border-0 bg-black/90 rounded-xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Visor de imagen</DialogTitle>
              </DialogHeader>
              <div className="relative w-full h-full flex items-center justify-center">
                <button
                  className="absolute top-3 right-3 text-white/80 hover:text-white"
                  onClick={() => setViewerOpen(false)}
                  aria-label="Cerrar"
                >
                  <X className="h-6 w-6" />
                </button>
                {images.length > 1 && (
                  <button
                    className="absolute left-3 text-white/80 hover:text-white"
                    onClick={prevImage}
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                )}
                <img src={images[viewerIndex]} alt={`Imagen ${viewerIndex + 1}`} className="max-w-full max-h-full object-contain" />
                {images.length > 1 && (
                  <button
                    className="absolute right-3 text-white/80 hover:text-white"
                    onClick={nextImage}
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};