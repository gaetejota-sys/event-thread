import { Post } from "@/types/post";
import { ListingCard } from "./ListingCard";

interface ListingGridProps {
  posts: Post[];
  onDelete?: (postId: string) => Promise<boolean>;
  onUpdate?: (postId: string, data: any) => Promise<boolean>;
}

export const ListingGrid = ({ posts, onDelete, onUpdate }: ListingGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <ListingCard 
          key={post.id} 
          post={post} 
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};