import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { COMUNAS_CHILE } from "@/data/comunas-chile";

interface ListingFiltersProps {
  typeFilter: string;
  comunaFilter: string;
  onTypeChange: (value: string) => void;
  onComunaChange: (value: string) => void;
}

export const ListingFilters = ({
  typeFilter,
  comunaFilter,
  onTypeChange,
  onComunaChange,
}: ListingFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="space-y-2">
        <Label>Tipo de aviso</Label>
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="compro">Compro</SelectItem>
            <SelectItem value="vendo">Vendo</SelectItem>
            <SelectItem value="permuto">Permuto</SelectItem>
            <SelectItem value="regalo">Regalo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Comuna</Label>
        <Select value={comunaFilter} onValueChange={onComunaChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Todas las comunas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las comunas</SelectItem>
            {COMUNAS_CHILE.map((comuna) => (
              <SelectItem key={comuna} value={comuna.toLowerCase()}>
                {comuna}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};