import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Send } from "lucide-react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  loading?: boolean;
}

export const CommentForm = ({ onSubmit, loading }: CommentFormProps) => {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    setSubmitting(true);
    const success = await onSubmit(content);
    if (success) {
      setContent("");
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <div className="bg-muted rounded-lg p-4 text-center">
        <p className="text-muted-foreground">
          Debes iniciar sesión para escribir un comentario
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Escribe tu comentario..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] resize-none"
        disabled={submitting}
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!content.trim() || submitting}
          className="bg-gradient-button"
        >
          <Send className="h-4 w-4 mr-2" />
          {submitting ? "Publicando..." : "Publicar comentario"}
        </Button>
      </div>
    </form>
  );
};