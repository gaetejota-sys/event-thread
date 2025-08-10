import { Badge } from "@/components/ui/badge";
import { getCategoryStyles } from "@/lib/categoryColors";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Edit2, Trash2, MoreVertical, Share2, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu as ShareMenu,
  DropdownMenuTrigger as ShareMenuTrigger,
  DropdownMenuContent as ShareMenuContent,
  DropdownMenuItem as ShareMenuItem,
} from "@/components/ui/dropdown-menu";
import { VoteButtons } from "./VoteButtons";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPricesInText, formatCompactNumber } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { EditForumPostForm } from "./EditForumPostForm";
import { supabase } from "@/integrations/supabase/client";
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
  author_avatar_url?: string;
  category: string;
  created_at: string | Date;
  votes: number;
  comments_count: number;
  image_urls?: string[];
  video_urls?: string[];
  user_id?: string;
  race_id?: string;
  onViewComments?: () => void;
  onTitleClick?: () => void;
  onDelete?: (postId: string) => Promise<boolean>;
  onUpdate?: (postId: string, data: any) => Promise<boolean>;
  onDeleteRace?: (raceId: string) => Promise<boolean>;
  showCategory?: boolean;
  animationDelayMs?: number;
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
  author_avatar_url,
  category, 
  created_at, 
  votes, 
  comments_count, 
  image_urls,
  video_urls,
  user_id,
  race_id,
  onViewComments,
  onTitleClick,
  onDelete,
  onUpdate,
  onDeleteRace,
  showCategory = true,
  animationDelayMs = 0
}: PostCardProps) => {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const createdDate = typeof created_at === 'string' ? new Date(created_at) : created_at;
  const { toast } = useToast();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewer, setViewer] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [attendeesCount, setAttendeesCount] = useState<number | null>(null);
  const [going, setGoing] = useState<boolean>(false);
  const [attendLoading, setAttendLoading] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(comments_count || 0);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { count } = await supabase
        .from('post_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id);
      if (isMounted) setAttendeesCount(count ?? 0);
      if (user) {
        const { data } = await supabase
          .from('post_attendees')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (isMounted) setGoing(!!data);
      }
    })();
    const channel = supabase
      .channel(`post_attendees_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_attendees', filter: `post_id=eq.${id}` }, async () => {
        const { count } = await supabase
          .from('post_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', id);
        setAttendeesCount(count ?? 0);
      })
      .subscribe();
    // Realtime de comentarios para mostrar conteo actualizado
    const commentsChannel = supabase
      .channel(`comments_count_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${id}` }, async (payload) => {
        setCommentCount((c) => {
          if (payload.eventType === 'INSERT') return c + 1;
          if (payload.eventType === 'DELETE') return Math.max(0, c - 1);
          return c;
        });
      })
      .subscribe();
    return () => { isMounted = false; supabase.removeChannel(channel); supabase.removeChannel(commentsChannel); };
  }, [id]);

  const toggleAttend = async () => {
    if (!user) {
      toast({ title: 'Inicia sesión', description: 'Debes iniciar sesión para confirmar asistencia.' });
      return;
    }
    try {
      setAttendLoading(true);
      if (!going) {
        const { error } = await supabase
          .from('post_attendees')
          .insert({ post_id: id, user_id: user.id });
        if (error) throw error;
        setGoing(true);
        setAttendeesCount((c) => (c ?? 0) + 1);
        toast({ title: 'Confirmado', description: 'Marcaste que asistes a este evento.' });
      } else {
        const { error } = await supabase
          .from('post_attendees')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        setGoing(false);
        setAttendeesCount((c) => Math.max(0, (c ?? 0) - 1));
        toast({ title: 'Asistencia cancelada' });
      }
    } catch (e) {
      console.error('Attend toggle error', e);
      toast({ title: 'No se pudo actualizar asistencia', variant: 'destructive' });
    } finally {
      setAttendLoading(false);
    }
  };
  
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

  const categoryStyles = getCategoryStyles(category);
  const safeImageUrls = (image_urls || []).filter(
    (u) => typeof u === "string" && u.trim().length > 0
  );

  return (
    <div
      className="relative bg-forum-post border border-border rounded-lg p-4 shadow-card hover:shadow-xl transition-all hover:-translate-y-[1px] animate-fade-in-up"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${categoryStyles.dot} rounded-l-lg`} />
      <div className="flex items-start space-x-3">
        <VoteButtons postId={id} votes={votes} className="flex flex-col items-center space-y-1" />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {showCategory && (
                <Badge className={`text-xs ${getCategoryStyles(category).badge}`}>
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
            {formatPricesInText(content)}
          </p>
          
          {/* Multimedia Content */}
          {(safeImageUrls.length > 0 || (video_urls && video_urls.length > 0)) && (
            <div className="mt-2">
              {(() => {
                const media: { type: 'image' | 'video'; url: string }[] = [];
                safeImageUrls.forEach(u => media.push({ type: 'image', url: u }));
                (video_urls || []).forEach(u => media.push({ type: 'video', url: u }));
                const visible = media.slice(0, 4);
                const more = media.length - visible.length;
                return (
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {visible.map((m, index) => (
                      <button
                        key={index}
                        className="relative flex-none w-36 h-36 sm:w-40 sm:h-40 bg-black rounded-md border border-border overflow-hidden"
                        onClick={(e) => { e.stopPropagation(); setViewer(m); setViewerOpen(true); }}
                        title="Ver medios"
                      >
                        {m.type === 'image' ? (
                          <img
                            src={m.url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <video
                            src={m.url}
                            className="w-full h-full object-contain pointer-events-none"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        )}
                      </button>
                    ))}
                    {more > 0 && (
                      <Button
                        variant="outline"
                        className="flex-none w-36 h-36 sm:w-40 sm:h-40 text-xs"
                        onClick={(e) => { e.stopPropagation(); setViewer({ type: media[4]?.type || 'image', url: media[4]?.url || '' }); setViewerOpen(true); }}
                        title="Ver más"
                      >
                        Ver más (+{more})
                      </Button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
      {/* Media viewer modal */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-3xl w-[92vw] p-0 bg-black/90 border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Visor</DialogTitle>
          </DialogHeader>
          {viewer && viewer.type === 'image' ? (
            <img src={viewer.url} alt="Imagen" className="max-h-[80vh] w-full object-contain" />
          ) : viewer ? (
            <video src={viewer.url} className="max-h-[80vh] w-full" controls autoPlay />
          ) : null}
        </DialogContent>
      </Dialog>
          {/* El video ya se muestra en el carrusel superior si existe */}
          
          <div className="flex items-center justify-between pt-2">
            <Link to={user_id ? `/u/${user_id}` : '#'} className="text-xs text-muted-foreground flex items-center space-x-2 hover:underline">
              <Avatar className="h-8 w-8">
                {author_avatar_url ? (
                  <AvatarImage src={author_avatar_url} alt={author} />
                ) : (
                  <AvatarFallback>{author.substring(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <span>
                por <span className="font-medium text-primary">{author}</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-1">
              {category.toLowerCase() === 'próximas carreras' && (
                <div className="flex items-center gap-2 mr-2">
                  <Button
                    variant={going ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={toggleAttend}
                    disabled={attendLoading}
                    title={going ? 'Estás asistiendo' : 'Confirmar asistencia'}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {going ? 'Asisto' : 'Asistir'}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {formatCompactNumber(attendeesCount ?? 0)} asistentes
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs hover:bg-forum-hover"
                onClick={onViewComments}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                {commentCount} comentarios
              </Button>
              <ShareMenu>
                <ShareMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs hover:bg-forum-hover" aria-label="Compartir">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </ShareMenuTrigger>
                <ShareMenuContent align="end">
                  <ShareMenuItem asChild>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${title} - ${window.location.origin}/forum`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </ShareMenuItem>
                  <ShareMenuItem asChild>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/forum`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Facebook
                    </a>
                  </ShareMenuItem>
                  <ShareMenuItem
                    onClick={async () => {
                      try {
                        if (navigator.share) {
                          await navigator.share({ title, url: `${window.location.origin}/forum` });
                          return;
                        }
                        await navigator.clipboard.writeText(`${window.location.origin}/forum`);
                        toast({ title: "Enlace copiado", description: "Pega el enlace en Instagram para compartir" });
                      } catch {
                        toast({ title: "Enlace", description: `${window.location.origin}/forum` });
                      }
                    }}
                  >
                    Instagram
                  </ShareMenuItem>
                </ShareMenuContent>
              </ShareMenu>
            </div>
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
            <AlertDialogTitle>¿Eliminar post{category.toLowerCase() === 'próximas carreras' && race_id ? ' o carrera' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              {category.toLowerCase() === 'próximas carreras' && race_id
                ? 'Este post está asociado a una carrera del calendario. Puedes eliminar solo el post o eliminar la carrera (lo que también eliminará el post asociado).'
                : 'Esta acción no se puede deshacer. El post será eliminado permanentemente.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-end gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {category.toLowerCase() === 'próximas carreras' && race_id && onDeleteRace ? (
              <>
                <Button variant="outline" onClick={handleDelete}>Eliminar solo post</Button>
                <Button
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={async () => {
                    const ok = await onDeleteRace(race_id);
                    if (ok) {
                      setShowDeleteDialog(false);
                    }
                  }}
                >
                  Eliminar carrera y post
                </Button>
              </>
            ) : (
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};