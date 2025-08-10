export type CategoryStyle = {
  badge: string; // classes para badge (bg/text)
  dot: string;   // clases para puntito indicador (bg)
  count: string; // clases para badge de conteo
};

const DEFAULT: CategoryStyle = {
  badge: "bg-muted text-muted-foreground",
  dot: "bg-muted-foreground/50",
  count: "bg-muted/60 text-foreground/70",
};

// Normaliza y asigna estilos vibrantes a categorías de foro
export function getCategoryStyles(rawCategory: string | undefined | null): CategoryStyle {
  const c = (rawCategory || "").toLowerCase();
  switch (c) {
    case "próximas carreras":
    case "proximas carreras":
      return {
        badge: "bg-sky-600 text-white",
        dot: "bg-sky-500",
        count: "bg-sky-500/30 text-sky-100",
      };
    case "carreras pasadas":
      return {
        badge: "bg-indigo-600 text-white",
        dot: "bg-indigo-500",
        count: "bg-indigo-500/30 text-indigo-100",
      };
    case "temas generales":
    case "general":
      return {
        badge: "bg-emerald-600 text-white",
        dot: "bg-emerald-500",
        count: "bg-emerald-500/30 text-emerald-100",
      };
    case "desafíos":
    case "desafios":
      return {
        badge: "bg-amber-600 text-white",
        dot: "bg-amber-500",
        count: "bg-amber-500/30 text-amber-100",
      };
    case "compra venta":
      return {
        badge: "bg-rose-600 text-white",
        dot: "bg-rose-500",
        count: "bg-rose-500/30 text-rose-100",
      };
    case "entrenamiento":
      return {
        badge: "bg-teal-600 text-white",
        dot: "bg-teal-500",
        count: "bg-teal-500/30 text-teal-100",
      };
    case "equipamiento":
      return {
        badge: "bg-fuchsia-600 text-white",
        dot: "bg-fuchsia-500",
        count: "bg-fuchsia-500/30 text-fuchsia-100",
      };
    case "técnica":
    case "tecnica":
      return {
        badge: "bg-cyan-700 text-white",
        dot: "bg-cyan-500",
        count: "bg-cyan-500/30 text-cyan-100",
      };
    default:
      return DEFAULT;
  }
}


