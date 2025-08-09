import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { usePostVotes } from "@/hooks/usePostVotes";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  postId: string;
  votes: number;
  className?: string;
}

export const VoteButtons = ({ postId, votes, className }: VoteButtonsProps) => {
  const { userVote, loading, vote } = usePostVotes(postId);

  const handleLike = () => vote(1);
  const handleDislike = () => vote(-1);

  return (
    <div className={cn("flex flex-col items-center space-y-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={loading}
        className={cn(
          "h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700",
          userVote?.vote_type === 1 && "bg-green-100 text-green-700"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      
      <span className={cn(
        "text-sm font-medium",
        votes > 0 && "text-green-600",
        votes < 0 && "text-red-600",
        votes === 0 && "text-muted-foreground"
      )}>
        {votes}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDislike}
        disabled={loading}
        className={cn(
          "h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700",
          userVote?.vote_type === -1 && "bg-red-100 text-red-700"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};