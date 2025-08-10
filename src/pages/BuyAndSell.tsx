import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { HeroCarousel } from "@/components/layout/HeroCarousel";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateListingForm } from "@/components/buyandsell/CreateListingForm";
import { ListingGrid } from "@/components/buyandsell/ListingGrid";
import { ListingFilters } from "@/components/buyandsell/ListingFilters";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { Seo } from "@/components/seo/Seo";

export const BuyAndSell = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [comunaFilter, setComunaFilter] = useState<string>("all");
  const { user } = useAuth();
  const { posts, loading, refetch, deletePost, updatePost } = usePosts();

  // Filter posts for "Compra venta" category
  const buyAndSellPosts = posts.filter(post => post.category === "Compra venta");

  // Apply filters and search
  const filteredPosts = buyAndSellPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || 
                       post.title.toLowerCase().includes(typeFilter.toLowerCase());
    
    const matchesComuna = comunaFilter === "all" ||
                         post.content.toLowerCase().includes(comunaFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesComuna;
  });

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Compra y Venta - Chileneros"
        description="Publica y encuentra equipamiento para carreras."
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Header />
      <HeroCarousel />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Compra y Venta</h1>
                <p className="text-muted-foreground mt-2">
                  Publica tus avisos clasificados y encuentra lo que buscas
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear Aviso
              </Button>
            </div>

            {showCreateForm && (
              <CreateListingForm 
                onClose={() => setShowCreateForm(false)}
                onSuccess={handleCreateSuccess}
              />
            )}

            {!showCreateForm && (
              <>
                {/* Search and Filters */}
                <div className="space-y-4 mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar avisos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <ListingFilters
                    typeFilter={typeFilter}
                    comunaFilter={comunaFilter}
                    onTypeChange={setTypeFilter}
                    onComunaChange={setComunaFilter}
                  />
                </div>

                {/* Listings Grid */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Cargando avisos...</p>
                  </div>
                ) : filteredPosts.length > 0 ? (
                  <ListingGrid 
                    posts={filteredPosts} 
                    onDelete={deletePost}
                    onUpdate={updatePost}
                  />
                ) : buyAndSellPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Plus className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        No hay avisos publicados
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Sé el primero en publicar un aviso clasificado
                      </p>
                      <Button 
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Crear Primer Aviso
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No se encontraron avisos que coincidan con tu búsqueda.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};