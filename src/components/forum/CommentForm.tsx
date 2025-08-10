import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Image, Video, BarChart3, X } from "lucide-react";
import { CreatePollForm } from "./CreatePollForm";
import { CreatePollData } from "@/types/poll";

interface CommentFormProps {
  onSubmit: (content: string, imageFiles?: File[], videoFiles?: File[]) => Promise<boolean>;
  onCreatePoll: (pollData: CreatePollData) => Promise<boolean>;
  loading?: boolean;
}

export const CommentForm = ({ onSubmit, onCreatePoll, loading }: CommentFormProps) => {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && imageFiles.length === 0 && videoFiles.length === 0) return;

    setSubmitting(true);
    const success = await onSubmit(content, imageFiles, videoFiles);
    if (success) {
      setContent("");
      setImageFiles([]);
      setVideoFiles([]);
    }
    setSubmitting(false);
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

  if (!user) {
    return (
      <div className="bg-muted rounded-lg p-4 text-center">
        <p className="text-muted-foreground">
          Debes iniciar sesión para escribir un comentario o crear encuestas
        </p>
      </div>
    );
  }

  if (showPollForm) {
    return (
      <CreatePollForm
        onSubmit={onCreatePoll}
        onCancel={() => setShowPollForm(false)}
      />
    );
  }

  return (
    <div className="space-y-3">
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

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Escribe tu comentario..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
          disabled={submitting}
        />
        
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
          
          <Button 
            type="submit" 
            disabled={(!content.trim() && imageFiles.length === 0 && videoFiles.length === 0) || submitting}
            className="bg-gradient-button"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Publicando..." : "Publicar"}
          </Button>
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
  );
};