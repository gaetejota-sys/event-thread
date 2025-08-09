import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, BarChart3 } from "lucide-react";
import { CreatePollData } from "@/types/poll";

interface CreatePollFormProps {
  onSubmit: (pollData: CreatePollData) => Promise<boolean>;
  onCancel: () => void;
}

export const CreatePollForm = ({ onSubmit, onCancel }: CreatePollFormProps) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) return;

    setSubmitting(true);
    const success = await onSubmit({
      question: question.trim(),
      options: validOptions.map(opt => opt.trim()),
    });

    if (success) {
      setQuestion("");
      setOptions(["", ""]);
      onCancel();
    }
    setSubmitting(false);
  };

  const isValid = question.trim().length > 0 && options.filter(opt => opt.trim().length > 0).length >= 2;

  return (
    <Card className="bg-forum-post border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Crear Encuesta</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="¿Cuál es tu pregunta? Ej: ¿Quién ganará la carrera?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Opciones:</div>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder={`Opción ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
              />
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {options.length < 6 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={addOption}
              className="text-primary hover:bg-forum-hover"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar opción
            </Button>
          )}
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="bg-gradient-button"
          >
            {submitting ? "Creando..." : "Crear Encuesta"}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};