import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateListingForm } from "@/components/buyandsell/CreateListingForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const BuyAndSell = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
                onSuccess={() => setShowCreateForm(false)}
              />
            )}

            {!showCreateForm && (
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
};