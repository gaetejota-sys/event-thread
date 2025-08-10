import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const { toast } = useToast();
  const shareUrl = url || `${window.location.origin}/forum`;
  const text = `${title} - ${shareUrl}`;

  const open = (u: string) => window.open(u, "_blank", "noopener,noreferrer");

  const shareWhatsApp = () => {
    const u = `https://wa.me/?text=${encodeURIComponent(text)}`;
    open(u);
  };

  const shareFacebook = () => {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    open(u);
  };

  const shareInstagram = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url: shareUrl });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Enlace copiado", description: "Pega el enlace en Instagram para compartir" });
    } catch {
      toast({ title: "Enlace", description: shareUrl });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={shareWhatsApp}>WhatsApp</Button>
      <Button variant="outline" size="sm" onClick={shareFacebook}>Facebook</Button>
      <Button variant="outline" size="sm" onClick={shareInstagram}>Instagram</Button>
      <Button variant="ghost" size="sm" onClick={() => (navigator.share ? navigator.share({ title, url: shareUrl }) : shareInstagram())}>
        <Share2 className="h-4 w-4 mr-1" /> Compartir
      </Button>
    </div>
  );
};


