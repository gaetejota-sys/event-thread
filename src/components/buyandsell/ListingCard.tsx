import { Post } from "@/types/post";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, MapPin, Clock, Eye, Heart, Edit2, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { PostDetailModal } from "@/components/forum/PostDetailModal";
import { EditListingForm } from "./EditListingForm";
import { useAuth } from "@/contexts/AuthContext";
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

interface ListingCardProps {
  post: Post;
  onDelete?: (postId: string) => Promise<boolean>;
  onUpdate?: (postId: string, data: any) => Promise<boolean>;
}

export const ListingCard = ({ post, onDelete, onUpdate }: ListingCardProps) => {
  const { user } = useAuth();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Extract listing type from title
  const getListingType = (title: string) => {
    const type = title.split(':')[0]?.toLowerCase();
    switch (type) {
      case 'compro': return { label: 'Compro', variant: 'secondary' as const };
      case 'vendo': return { label: 'Vendo', variant: 'default' as const };
      case 'permuto': return { label: 'Permuto', variant: 'outline' as const };
      case 'regalo': return { label: 'Regalo', variant: 'destructive' as const };
      default: return { label: 'Aviso', variant: 'secondary' as const };
    }
  };

  // Extract price from content
  const getPrice = (content: string) => {
    const priceMatch = content.match(/\*\*Precio:\*\*\s*\$?([0-9.,]+)/);
    return priceMatch ? `$${priceMatch[1]}` : null;
  };

  // Extract comuna from content
  const getComuna = (content: string) => {
    const comunaMatch = content.match(/\*\*Comuna:\*\*\s*([^\n]+)/);
    return comunaMatch ? comunaMatch[1].trim() : "";
  };

  // Extract description from content
  const getDescription = (content: string) => {
    const descMatch = content.match(/\*\*Descripción:\*\*\s*([^\n]+)/);
    return descMatch ? descMatch[1].trim() : "";
  };

  // Check if phone is shown
  const hasPhoneContact = (content: string) => {
    return content.includes('📞 Teléfono:');
  };

  const type = getListingType(post.title);
  const price = getPrice(post.content);
  const comuna = getComuna(post.content);
  const description = getDescription(post.content);
  const showPhone = hasPhoneContact(post.content);
  const cleanTitle = post.title.split(':').slice(1).join(':').trim();

  // Extract first image if available
  const firstImage = post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null;

  // Check if current user is the owner
  const isOwner = user && user.id === post.user_id;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on action buttons
    if ((e.target as HTMLElement).closest('.dropdown-trigger')) {
      return;
    }
    setShowDetailModal(true);
  };

  const handleDelete = async () => {
    if (onDelete) {
      const success = await onDelete(post.id);
      if (success) {
        setShowDeleteDialog(false);
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
  };

  if (showEditForm) {
    return (
      <EditListingForm
        post={post}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleEditSuccess}
        onUpdate={onUpdate!}
      />
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
        <CardHeader className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Badge variant={type.variant} className="mb-2">
                {type.label}
              </Badge>
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {cleanTitle}
              </h3>
              {price && (
                <p className="text-lg font-bold text-primary">{price}</p>
              )}
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="dropdown-trigger">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setShowEditForm(true);
                  }}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          {firstImage && (
            <div className="mb-3">
              <img
                src={firstImage}
                alt={cleanTitle}
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>

          <div className="space-y-2">
            {comuna && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{comuna}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(post.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Ver más</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.comments_count || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {showPhone ? (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Phone className="w-3 h-3" />
                  <span>Tel.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <MessageCircle className="w-3 h-3" />
                  <span>Msg</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showDetailModal && (
        <PostDetailModal
          post={post}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar aviso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El aviso será eliminado permanentemente.
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
    </>
  );
};