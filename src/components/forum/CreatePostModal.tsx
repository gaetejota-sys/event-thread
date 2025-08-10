import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreatePostData } from "@/types/post";
import { X, Image, Video, BarChart3 } from "lucide-react";
import { CreatePollForm } from "./CreatePollForm";
import { CreatePollData } from "@/types/poll";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: CreatePostData & { image_urls?: string[], video_urls?: string[] }) => Promise<boolean>;
  onCreatePoll: (pollData: CreatePollData) => Promise<boolean>;
  defaultCategory?: string;
}

export const CreatePostModal = ({ isOpen, onClose, onSubmit, onCreatePoll, defaultCategory }: CreatePostModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (!user) return [];

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('comment-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('comment-attachments')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    
    try {
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      // Upload files if provided
      if (imageFiles.length > 0) {
        imageUrls = await uploadFiles(imageFiles);
      }
      if (videoFiles.length > 0) {
        videoUrls = await uploadFiles(videoFiles);
      }

      const success = await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category: defaultCategory || "",
        image_urls: imageUrls,
        video_urls: videoUrls,
      });

      if (success) {
        setTitle("");
        setContent("");
        setImageFiles([]);
        setVideoFiles([]);
        onClose();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el tema",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVideoFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle("");
      setContent("");
      setImageFiles([]);
      setVideoFiles([]);
      setShowPollForm(false);
      onClose();
    }
  };

  if (showPollForm) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <CreatePollForm
            onSubmit={onCreatePoll}
            onCancel={() => setShowPollForm(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Crear nuevo tema en {defaultCategory}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* File previews */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {videoFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {videoFiles.map((file, index) => (
                <div key={index} className="relative">
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => removeVideo(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Escribe el título de tu tema..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Contenido</label>
              <Textarea
                placeholder="Describe tu tema, pregunta o comentario..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={submitting}
                className="min-h-[120px] resize-none"
                maxLength={2000}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={submitting}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Imagen
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={submitting}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPollForm(true)}
                  disabled={submitting}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Encuesta
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || !content.trim() || submitting}
                  className="bg-gradient-button"
                >
                  {submitting ? "Publicando..." : "Publicar tema"}
                </Button>
              </div>
            </div>
          </form>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleVideoUpload}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};