import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PostCard } from "@/components/forum/PostCard";
import { RaceCard } from "@/components/forum/RaceCard";
import { CreateRaceModal } from "@/components/forum/CreateRaceModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { useRaces } from "@/hooks/useRaces";
import { usePosts } from "@/hooks/usePosts";
import { CreateRaceData } from "@/types/race";

const mockPosts = [
  {
    id: "1",
    title: "¿Cuál es vuestra rutina de entrenamiento favorita?",
    content: "Estoy buscando nuevas ideas para variar mi entrenamiento semanal. ¿Qué rutinas funcionan mejor para vosotros? Me interesa especialmente combinar trabajo de resistencia con fuerza.",
    author: "RunnerPro",
    category: "Entrenamiento",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    votes: 0,
    comments: 0
  },
  {
    id: "2",
    title: "Reseña: Zapatillas Nike Air Zoom Pegasus 40",
    content: "Después de 500km con estas zapatillas, aquí está mi reseña completa. Excelente amortiguación, durabilidad sorprendente y muy cómodas para entrenamientos largos.",
    author: "MaratonMania",
    category: "Equipamiento",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    votes: 0,
    comments: 0
  }
];

export const Forum = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateRaceModalOpen, setIsCreateRaceModalOpen] = useState(false);
  const [posts] = useState(mockPosts);
  const { posts: dbPosts, loading: postsLoading, createRacePost } = usePosts();
  const { races, loading: racesLoading, createRace } = useRaces(createRacePost);

  const handleCreateRace = async (raceData: CreateRaceData) => {
    const success = await createRace(raceData);
    if (success) {
      setIsCreateRaceModalOpen(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDbPosts = dbPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRaces = races.filter(race =>
    race.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loading = racesLoading || postsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl space-y-6">
            {/* Navigation */}
            <div className="flex items-center space-x-4 bg-forum-sidebar border border-border rounded-lg p-4">
              <Button variant="ghost" size="sm" className="bg-forum-hover">
                Foro
              </Button>
              <Button variant="ghost" size="sm">
                Calendario
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                onClick={() => setIsCreateRaceModalOpen(true)}
                className="bg-gradient-button"
              >
                Anunciar Carrera
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Calendario
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Cargando...</p>
                </div>
              )}
              
              {/* Database Posts (including race posts) */}
              {filteredDbPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  author="Usuario"
                  category={post.category}
                  created_at={post.created_at}
                  votes={post.votes}
                  comments_count={post.comments_count}
                  onViewComments={() => console.log(`Ver comentarios de ${post.id}`)}
                />
              ))}

              {/* Legacy Mock Posts */}
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  author={post.author}
                  category={post.category}
                  created_at={post.createdAt}
                  votes={post.votes}
                  comments_count={post.comments}
                  onViewComments={() => console.log(`Ver comentarios de ${post.id}`)}
                />
              ))}
              
              {!loading && filteredPosts.length === 0 && filteredRaces.length === 0 && filteredDbPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron resultados</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <CreateRaceModal
        isOpen={isCreateRaceModalOpen}
        onClose={() => setIsCreateRaceModalOpen(false)}
        onSubmit={handleCreateRace}
      />
    </div>
  );
};