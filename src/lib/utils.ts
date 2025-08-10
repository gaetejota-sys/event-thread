import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea número a CLP con punto como separador de miles (sin decimales)
export function formatCLP(value: number | string): string {
  const num = typeof value === 'string' ? Number(value.toString().replace(/[^0-9.-]/g, '')) : value;
  if (!isFinite(num as number)) return '$0';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num as number);
}

// Reemplaza patrones de precio en un texto por su versión formateada CLP
// Busca expresiones como "**Precio:** $120000" o "$120000" y aplica separador de miles
export function formatPricesInText(text: string): string {
  if (!text) return text;
  return text.replace(/(\$\s?)([0-9]{1,3}(?:[0-9]{3})*|[0-9]+(?:[.,][0-9]{3})+)/g, (_match, sign, amount) => {
    const numeric = Number(String(amount).replace(/\./g, '').replace(/,/g, '.'));
    return formatCLP(numeric);
  });
}

// Formato compacto para contadores grandes (ej: 1.2k, 3.4M)
export function formatCompactNumber(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
}
