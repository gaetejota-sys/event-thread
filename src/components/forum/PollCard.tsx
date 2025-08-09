import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, BarChart3, Users } from "lucide-react";
import { Poll } from "@/types/poll";
import { useAuth } from "@/contexts/AuthContext";

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => Promise<boolean>;
  onAddOption: (pollId: string, optionText: string) => Promise<boolean>;
}

export const PollCard = ({ poll, onVote, onAddOption }: PollCardProps) => {
  const [newOption, setNewOption] = useState("");
  const [showAddOption, setShowAddOption] = useState(false);
  const [voting, setVoting] = useState(false);
  const { user } = useAuth();

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes_count, 0);

  const handleVote = async (optionId: string) => {
    setVoting(true);
    await onVote(poll.id, optionId);
    setVoting(false);
  };

  const handleAddOption = async () => {
    if (!newOption.trim()) return;
    
    const success = await onAddOption(poll.id, newOption.trim());
    if (success) {
      setNewOption("");
      setShowAddOption(false);
    }
  };

  return (
    <Card className="bg-forum-post border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{poll.question}</CardTitle>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-3 w-3 mr-1" />
          {totalVotes} votos
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes_count / totalVotes) * 100 : 0;
          
          return (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start text-left h-auto p-3 hover:bg-forum-hover"
                  onClick={() => handleVote(option.id)}
                  disabled={voting || !user}
                >
                  <div className="flex-1">
                    <div className="font-medium">{option.option_text}</div>
                    <div className="flex items-center justify-between mt-1">
                      <Progress value={percentage} className="flex-1 mr-2" />
                      <Badge variant="secondary" className="text-xs">
                        {option.votes_count} ({percentage.toFixed(1)}%)
                      </Badge>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          );
        })}

        {/* Add Option Section */}
        <div className="pt-2 border-t border-border">
          {!showAddOption ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddOption(true)}
              className="text-primary hover:bg-forum-hover"
              disabled={!user}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar opción
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Input
                placeholder="Nueva opción..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
              />
              <Button
                size="sm"
                onClick={handleAddOption}
                disabled={!newOption.trim()}
              >
                Agregar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddOption(false);
                  setNewOption("");
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};