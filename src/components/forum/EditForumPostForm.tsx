import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, Image as ImageIcon, Video, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/types/post";

interface EditForumPostFormProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUpdate: (postId: string, data: any) => Promise<boolean>;
}

interface PostFormData {
  title: string;
  content: string;
  category: string;
}

export const EditForumPostForm = ({ post, isOpen, onClose, onSuccess, onUpdate }: EditForumPostFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(post.image_urls || []);
  const [video, setVideo] = useState<string>(post.video_urls?.[0] || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PostFormData>({
    defaultValues: {
      title: post.title,
      content: post.content,
      category: post.category
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).slice(0, 6 - images.length).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target?.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setVideo(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo("");
  };

  const onSubmit = async (data: PostFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar logueado para editar un post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onUpdate(post.id, {
        title: data.title,
        content: data.content,
        category: data.category,
        image_urls: images,
        video_urls: video ? [video] : []
      });

      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el post. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Editar Post</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select onValueChange={(value) => setValue("category", value)} defaultValue={post.category}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Técnica">Técnica</SelectItem>
                <SelectItem value="Compra venta">Compra venta</SelectItem>
                <SelectItem value="Carreras pasadas">Carreras pasadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              {...register("title", { required: "El título es obligatorio" })}
              placeholder="Escribe el título de tu post..."
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              {...register("content", { required: "El contenido es obligatorio" })}
              placeholder="Escribe el contenido de tu post..."
              rows={8}
              className={errors.content ? "border-destructive" : ""}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Multimedia */}
          <div className="space-y-4">
            <Label>Multimedia (Opcional)</Label>
            
            {/* Imágenes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm">Imágenes (máximo 6)</span>
              </div>
              
              {images.length < 6 && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <label htmlFor="image-upload-edit" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Haz clic para subir imágenes ({images.length}/6)
                    </p>
                  </label>
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span className="text-sm">Video (máximo 1)</span>
              </div>
              
              {!video && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload-edit"
                  />
                  <label htmlFor="video-upload-edit" className="cursor-pointer">
                    <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Haz clic para subir un video
                    </p>
                  </label>
                </div>
              )}

              {video && (
                <div className="relative">
                  <video
                    src={video}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    onClick={removeVideo}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};