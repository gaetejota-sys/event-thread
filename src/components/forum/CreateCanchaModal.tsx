import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMUNAS_CHILE } from "@/data/comunas-chile";
import { CreateCanchaData } from "@/hooks/useCanchas";

interface CreateCanchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (canchaData: CreateCanchaData) => Promise<boolean>;
}

export const CreateCanchaModal = ({ isOpen, onClose, onSubmit }: CreateCanchaModalProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    comuna: "",
    descripcion: "",
    latitud: "",
    longitud: "",
    tipo_superficie: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.latitud || !formData.longitud) {
      alert("Latitud y longitud son obligatorias");
      return;
    }

    const success = await onSubmit({
      nombre: formData.nombre,
      comuna: formData.comuna,
      descripcion: formData.descripcion || undefined,
      latitud: parseFloat(formData.latitud),
      longitud: parseFloat(formData.longitud),
      tipo_superficie: formData.tipo_superficie || undefined
    });

    if (success) {
      setFormData({
        nombre: "",
        comuna: "",
        descripcion: "",
        latitud: "",
        longitud: "",
        tipo_superficie: ""
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dar de Alta Nueva Cancha</DialogTitle>
          <DialogDescription>
            Completa la información de la nueva cancha deportiva
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Cancha</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Cancha Municipal Norte"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitud">Latitud</Label>
              <Input
                id="latitud"
                type="number"
                step="any"
                value={formData.latitud}
                onChange={(e) => setFormData(prev => ({ ...prev, latitud: e.target.value }))}
                placeholder="-33.4372"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud</Label>
              <Input
                id="longitud"
                type="number"
                step="any"
                value={formData.longitud}
                onChange={(e) => setFormData(prev => ({ ...prev, longitud: e.target.value }))}
                placeholder="-70.6506"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_superficie">Tipo de Superficie</Label>
            <Select value={formData.tipo_superficie} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_superficie: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de superficie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pasto Natural">Pasto Natural</SelectItem>
                <SelectItem value="Pasto Sintético">Pasto Sintético</SelectItem>
                <SelectItem value="Tierra">Tierra</SelectItem>
                <SelectItem value="Asfalto">Asfalto</SelectItem>
                <SelectItem value="Cemento">Cemento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe las características de la cancha..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-button">
              Crear Cancha
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};