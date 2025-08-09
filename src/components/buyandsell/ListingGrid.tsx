import { Post } from "@/types/post";
import { ListingCard } from "./ListingCard";

interface ListingGridProps {
  posts: Post[];
}

export const ListingGrid = ({ posts }: ListingGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <ListingCard key={post.id} post={post} />
      ))}
    </div>
  );
};