import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Upload, Image as ImageIcon, Video, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { COMUNAS_CHILE } from "@/data/comunas-chile";
import { Post } from "@/types/post";

interface EditListingFormProps {
  post: Post;
  onClose: () => void;
  onSuccess: () => void;
  onUpdate: (postId: string, data: any) => Promise<boolean>;
}

interface ListingFormData {
  type: "compro" | "vendo" | "permuto" | "regalo";
  title: string;
  description: string;
  comuna: string;
  price: string;
  contactPhone: string;
  showPhone: boolean;
}

export const EditListingForm = ({ post, onClose, onSuccess, onUpdate }: EditListingFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(post.image_urls || []);
  const [video, setVideo] = useState<string>(post.video_urls?.[0] || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse existing post data
  const parsePostData = (post: Post) => {
    const typeMatch = post.title.match(/^(COMPRO|VENDO|PERMUTO|REGALO):/);
    const type = typeMatch ? typeMatch[1].toLowerCase() as "compro" | "vendo" | "permuto" | "regalo" : "vendo";
    const title = post.title.replace(/^(COMPRO|VENDO|PERMUTO|REGALO):\s*/, "");
    
    const descMatch = post.content.match(/\*\*Descripción:\*\*\s*([^\n]+)/);
    const description = descMatch ? descMatch[1].trim() : "";
    
    const comunaMatch = post.content.match(/\*\*Comuna:\*\*\s*([^\n]+)/);
    const comuna = comunaMatch ? comunaMatch[1].trim() : "";
    
    const priceMatch = post.content.match(/\*\*Precio:\*\*\s*\$?([0-9.,]+)/);
    const price = priceMatch ? priceMatch[1] : "";
    
    const phoneMatch = post.content.match(/📞 Teléfono:\s*([^\n]+)/);
    const contactPhone = phoneMatch ? phoneMatch[1].trim() : "";
    const showPhone = !!phoneMatch;
    
    return { type, title, description, comuna, price, contactPhone, showPhone };
  };

  const initialData = parsePostData(post);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ListingFormData>({
    defaultValues: initialData
  });

  const selectedType = watch("type");
  const showPhone = watch("showPhone");

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

  const onSubmit = async (data: ListingFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar logueado para editar un aviso",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const title = `${data.type.toUpperCase()}: ${data.title}`;
      
      let content = `**Tipo:** ${data.type}\n`;
      content += `**Descripción:** ${data.description}\n`;
      content += `**Comuna:** ${data.comuna}\n`;
      
      if (data.type !== "regalo") {
        content += `**Precio:** $${data.price}\n`;
      }
      
      content += `\n**Contacto:**\n`;
      if (data.showPhone && data.contactPhone) {
        content += `📞 Teléfono: ${data.contactPhone}\n`;
      } else {
        content += `📧 Contacto por mensaje privado en el sitio\n`;
      }

      const success = await onUpdate(post.id, {
        title,
        content,
        category: "Compra venta",
        image_urls: images,
        video_urls: video ? [video] : []
      });

      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el aviso. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Editar Aviso</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de aviso */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de aviso *</Label>
            <Select onValueChange={(value) => setValue("type", value as any)} defaultValue={initialData.type}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de aviso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compro">Compro</SelectItem>
                <SelectItem value="vendo">Vendo</SelectItem>
                <SelectItem value="permuto">Permuto</SelectItem>
                <SelectItem value="regalo">Regalo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del aviso *</Label>
            <Input
              {...register("title", { required: "El título es obligatorio" })}
              placeholder="Ej: Bicicleta de montaña"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              {...register("description", { required: "La descripción es obligatoria" })}
              placeholder="Describe detalladamente lo que ofreces..."
              rows={4}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Comuna */}
          <div className="space-y-2">
            <Label htmlFor="comuna">Comuna *</Label>
            <Select onValueChange={(value) => setValue("comuna", value)} defaultValue={initialData.comuna}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu comuna" />
              </SelectTrigger>
              <SelectContent>
                {COMUNAS_CHILE.map((comuna) => (
                  <SelectItem key={comuna} value={comuna}>
                    {comuna}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Precio (no mostrar para regalo) */}
          {selectedType && selectedType !== "regalo" && (
            <div className="space-y-2">
              <Label htmlFor="price">Precio (CLP) *</Label>
              <Input
                {...register("price", { 
                  required: "El precio es obligatorio"
                })}
                type="number"
                placeholder="Ej: 150000"
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
          )}

          {/* Multimedia */}
          <div className="space-y-4">
            <Label>Multimedia</Label>
            
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
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
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
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
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

          {/* Contacto */}
          <div className="space-y-4">
            <Label>Información de Contacto</Label>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Número de teléfono</Label>
              <Input
                {...register("contactPhone")}
                type="tel"
                placeholder="Ej: +56912345678"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showPhone"
                checked={showPhone}
                onCheckedChange={(checked) => setValue("showPhone", checked)}
              />
              <Label htmlFor="showPhone">
                Mostrar teléfono a usuarios registrados
              </Label>
            </div>

            {!showPhone && (
              <p className="text-sm text-muted-foreground">
                Los interesados podrán contactarte por mensaje privado en el sitio
              </p>
            )}
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
      </CardContent>
    </Card>
  );
};