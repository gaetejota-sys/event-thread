import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Upload, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { COMUNAS_CHILE } from "@/data/comunas-chile";
import { useCanchas } from "@/hooks/useCanchas";
import { CreateCanchaModal } from "./CreateCanchaModal";

interface CreateRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (raceData: any) => void;
}

export const CreateRaceModal = ({ isOpen, onClose, onSubmit }: CreateRaceModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    comuna: "",
    cancha_id: "",
    date: null as Date | null,
    images: [] as File[]
  });
  
  const [isCreateCanchaModalOpen, setIsCreateCanchaModalOpen] = useState(false);
  const { canchas, loading: canchasLoading, createCancha } = useCanchas();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCreateCancha = async (canchaData: any) => {
    const success = await createCancha(canchaData);
    if (success) {
      setIsCreateCanchaModalOpen(false);
    }
    return success;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: "",
      description: "",
      comuna: "",
      cancha_id: "",
      date: null,
      images: []
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anunciar Nueva Carrera</DialogTitle>
          <DialogDescription>
            Completa los detalles de tu carrera para compartirla con la comunidad
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la Carrera</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Maratón de Santiago 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe los detalles de la carrera..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comuna">Comuna</Label>
            <Select value={formData.comuna} onValueChange={(value) => setFormData(prev => ({ ...prev, comuna: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una comuna" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COMUNAS_CHILE.map((comuna) => (
                  <SelectItem key={comuna} value={comuna}>
                    {comuna}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancha">Cancha</Label>
            <div className="flex gap-2">
              <Select 
                value={formData.cancha_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cancha_id: value }))}
                disabled={canchasLoading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={canchasLoading ? "Cargando canchas..." : "Selecciona una cancha"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {canchas
                    .filter(cancha => !formData.comuna || cancha.comuna === formData.comuna)
                    .map((cancha) => (
                    <SelectItem key={cancha.id} value={cancha.id}>
                      {cancha.nombre} - {cancha.comuna}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsCreateCanchaModalOpen(true)}
                title="Dar de alta nueva cancha"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Si tu cancha no aparece, dale de alta usando el botón +
            </p>
          </div>

          <div className="space-y-2">
            <Label>Fecha del Evento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date || undefined}
                  onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Fotografías</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-sm text-muted-foreground">
                  Haz clic para subir imágenes o arrastra aquí
                </span>
              </Label>
            </div>
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-button">
              Publicar Carrera
            </Button>
          </div>
        </form>
      </DialogContent>

      <CreateCanchaModal
        isOpen={isCreateCanchaModalOpen}
        onClose={() => setIsCreateCanchaModalOpen(false)}
        onSubmit={handleCreateCancha}
      />
    </Dialog>
  );
};