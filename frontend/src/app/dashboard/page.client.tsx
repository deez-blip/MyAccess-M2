"use client"

import { useEffect, useMemo, useState } from 'react';
import { Search, List, Map } from 'lucide-react';
import { Center, User } from '@/types';
import { centersApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterPanel } from './_components/FilterPanel';
import { CenterCard } from './_components/CenterCard';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';

const MapView = dynamic(() => import('./_components/MapView').then((mod) => mod.MapView), { 
  ssr: false,
});

interface DashboardProps {
  user: User | null;
  onNavigate: (page: string, centerId?: string) => void;
}

export default function DashboardClient({ user, onNavigate }: DashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter(); // Remplacement de window.location par le routeur Next.js
  
  const [searchQuery, setSearchQuery] = useState( searchParams.get("q") ?? '');
  const [selectedHandicaps, setSelectedHandicaps] = useState<string[]>(
    user?.handicapType?.split(/[;,]/).filter(Boolean) || []
  );
  const [minScore, setMinScore] = useState(0);
  const [centerType, setCenterType] = useState<'all' | 'vaccination' | 'depistage' | 'both'>('all');
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCenters = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await centersApi.list({ limit: 100 });
        if (isMounted) {
          setCenters(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les centres"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCenters();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCenters = useMemo(() => {
    return centers.filter(center => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !center.name.toLowerCase().includes(query) &&
          !center.city.toLowerCase().includes(query) &&
          !center.address.toLowerCase().includes(query) &&
          !center.postalCode.includes(query)
        ) {
          return false;
        }
      }

      if (center.globalScore < minScore) {
        return false;
      }

      if (centerType !== 'all') {
        if (centerType === 'both' && center.type !== 'both') {
          return false;
        } else if (centerType === 'vaccination' && center.type !== 'vaccination' && center.type !== 'both') {
          return false;
        } else if (centerType === 'depistage' && center.type !== 'depistage' && center.type !== 'both') {
          return false;
        }
      }

      return true;
    });
  }, [centers, searchQuery, minScore, centerType]);

  const handleViewDetails = (center: Center) => {
    // Navigation fluide respectueuse des lecteurs d'écran et du focus
    router.push(`/center/${center.id}`);
  };

  return (
    // Transformation en <main> pour les repères de navigation (Landmarks)
    <main id="main-content" className="min-h-screen bg-muted/30">
      <h1 className="sr-only">Recherche et liste des centres de santé</h1>
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-3 max-w-3xl">
            <div className="flex-1 relative border rounded">
              {/* Ajout d'un label explicite pour le champ de recherche */}
              <label htmlFor="search-input" className="sr-only">
                Rechercher par ville, code postal, nom du centre
              </label>
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="search-input"
                type="search"
                placeholder="Rechercher par ville, code postal, nom du centre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1" aria-label="Filtres de recherche">
            <FilterPanel
              selectedHandicaps={selectedHandicaps}
              onHandicapChange={setSelectedHandicaps}
              minScore={minScore}
              onMinScoreChange={setMinScore}
              centerType={centerType}
              onCenterTypeChange={setCenterType}
            />
          </aside>

          {/* Main Content */}
          <section className="lg:col-span-3" aria-label="Résultats de recherche">
            <div className="mb-4 flex items-center justify-between">
              {/* aria-live permet d'annoncer les changements de résultats vocalement */}
              <p className="text-muted-foreground" aria-live="polite" aria-atomic="true">
                {filteredCenters.length} centre{filteredCenters.length > 1 ? 's' : ''} trouvé{filteredCenters.length > 1 ? 's' : ''}
              </p>

              <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                <TabsList aria-label="Modes d'affichage des résultats">
                  <TabsTrigger value="map" className="gap-2" aria-label="Afficher la carte des centres">
                    <Map aria-hidden="true" className="h-4 w-4" />
                    Carte
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2" aria-label="Afficher la liste des centres">
                    <List aria-hidden="true" className="h-4 w-4" />
                    Liste
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {isLoading ? (
              // Rôle status pour les chargements
              <div className="text-center py-12" role="status" aria-live="polite">
                <p className="text-muted-foreground">Chargement des centres...</p>
                <span className="sr-only">Veuillez patienter</span>
              </div>
            ) : error ? (
              // Rôle alert pour les erreurs afin d'interrompre l'utilisateur
              <div className="text-center py-12" role="alert" aria-live="assertive">
                <p className="text-destructive">{error}</p>
                <Button
                  variant="link"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Réessayer
                </Button>
              </div>
            ) : viewMode === 'map' ? (
              <div className="h-[600px]">
                <MapView
                  centers={filteredCenters}
                  selectedCenter={selectedCenter}
                  onSelectCenter={handleViewDetails}
                />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredCenters.length > 0 ? (
                  filteredCenters.map(center => (
                    <CenterCard
                      key={center.id}
                      center={center}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12" role="status" aria-live="polite">
                    <p className="text-muted-foreground">
                      Aucun centre ne correspond à vos critères de recherche.
                    </p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setSearchQuery('');
                        setMinScore(0);
                        setCenterType('all');
                        setSelectedHandicaps([]);
                      }}
                      className="mt-2"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
