import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ForumSidebar } from "@/components/forum/ForumSidebar";
import { PostCard } from "@/components/forum/PostCard";
import { RaceCard } from "@/components/forum/RaceCard";
import { CreateRaceModal } from "@/components/forum/CreateRaceModal";
import { PostDetailModal } from "@/components/forum/PostDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CalendarDays } from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateRaceModalOpen, setIsCreateRaceModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
  const [posts] = useState(mockPosts);
  const { posts: dbPosts, loading: postsLoading, createRacePost } = usePosts();
  const { races, loading: racesLoading, createRace } = useRaces(createRacePost);

  // Debug logging
  console.log('Forum Debug:', {
    dbPostsCount: dbPosts.length,
    racesCount: races.length,
    postsLoading,
    racesLoading,
    dbPosts: dbPosts.slice(0, 2) // Show first 2 posts for debugging
  });

  const handleCreateRace = async (raceData: CreateRaceData) => {
    const success = await createRace(raceData);
    if (success) {
      setIsCreateRaceModalOpen(false);
    }
  };

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setIsPostDetailModalOpen(true);
  };

  const handleViewComments = (post: any) => {
    setSelectedPost(post);
    setIsPostDetailModalOpen(true);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredDbPosts = dbPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Debug filtered results
  console.log('Filtered results:', {
    searchQuery,
    selectedCategory,
    filteredDbPosts: filteredDbPosts.length,
    filteredPosts: filteredPosts.length,
    allDbPosts: dbPosts.map(p => ({ id: p.id, title: p.title, category: p.category })),
    proximasCarrerasCount: dbPosts.filter(p => p.category === "Próximas Carreras").length
  });

  const filteredRaces = races.filter(race =>
    race.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loading = racesLoading || postsLoading;

  // Calculate post counts for sidebar
  const postsCount = {
    proximasCarreras: dbPosts.filter(p => p.category === "Próximas Carreras").length,
    carrerasPasadas: dbPosts.filter(p => p.category === "Carreras Pasadas").length,
    general: dbPosts.filter(p => p.category === "General").length,
    tecnica: dbPosts.filter(p => p.category === "Técnica").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAnunciarCarrera={() => setIsCreateRaceModalOpen(true)}
        onVerCalendario={() => console.log("Ver Calendario")}
      />
      
      <div className="flex">
        <ForumSidebar 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          postsCount={postsCount}
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl space-y-6">
            {/* Category Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                {selectedCategory === "all" ? "Todos los posts" : selectedCategory}
              </h1>
              <p className="text-muted-foreground">
                {selectedCategory === "Próximas Carreras" 
                  ? "Carreras anunciadas por la comunidad. Los usuarios pueden comentar en estos temas."
                  : selectedCategory === "all" 
                  ? "Todos los temas del foro"
                  : `Discusiones sobre ${selectedCategory.toLowerCase()}`
                }
              </p>
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


            {/* Content */}
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Cargando...</p>
                </div>
              )}
              
              {/* Database Posts (including race posts) - THESE SHOULD SHOW FIRST */}
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
                  onViewComments={() => handleViewComments(post)}
                  onTitleClick={() => handlePostClick(post)}
                  showCategory={selectedCategory === "all"}
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
                  onViewComments={() => handleViewComments(post)}
                  onTitleClick={() => handlePostClick(post)}
                  showCategory={selectedCategory === "all"}
                />
              ))}
              
              {/* Show message if no results for current category */}
              {!loading && selectedCategory === "Próximas Carreras" && filteredDbPosts.length === 0 && (
                <div className="text-center py-12">
                  <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay carreras anunciadas</h3>
                  <p className="text-muted-foreground mb-4">
                    Cuando alguien anuncie una carrera, aparecerá aquí para que puedas comentar y participar en la conversación.
                  </p>
                </div>
              )}
              
              {!loading && selectedCategory !== "Próximas Carreras" && filteredPosts.length === 0 && filteredRaces.length === 0 && filteredDbPosts.length === 0 && (
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

      <PostDetailModal
        post={selectedPost}
        isOpen={isPostDetailModalOpen}
        onClose={() => setIsPostDetailModalOpen(false)}
      />
    </div>
  );
};