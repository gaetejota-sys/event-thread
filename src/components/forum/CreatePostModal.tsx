import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreatePostData } from "@/types/post";
import { X } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: CreatePostData) => Promise<boolean>;
  defaultCategory?: string;
}

const categories = [
  "Temas generales",
  "Carreras pasadas", 
  "Desafíos",
  "Compra venta"
];

export const CreatePostModal = ({ isOpen, onClose, onSubmit, defaultCategory }: CreatePostModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(defaultCategory || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !category) return;

    setSubmitting(true);
    const success = await onSubmit({
      title: title.trim(),
      content: content.trim(),
      category: category,
    });

    if (success) {
      setTitle("");
      setContent("");
      setCategory(defaultCategory || "");
      onClose();
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle("");
      setContent("");
      setCategory(defaultCategory || "");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Crear nuevo tema</DialogTitle>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Categoría</label>
            <Select value={category} onValueChange={setCategory} disabled={submitting}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="flex justify-end space-x-2 pt-4">
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
              disabled={!title.trim() || !content.trim() || !category || submitting}
              className="bg-gradient-button"
            >
              {submitting ? "Publicando..." : "Publicar tema"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};