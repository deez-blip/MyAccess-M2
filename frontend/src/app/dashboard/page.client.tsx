"use client"

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, List, Map as MapIcon, RefreshCw } from 'lucide-react';
import {
  Center,
  CenterFilterFacets,
  DashboardDataSource,
  DashboardDigitalAccess,
  DashboardLocationKind,
  FilterFacetOption,
  HandicapType,
  User,
} from '@/types';
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

const DASHBOARD_CACHE_NAMESPACE = 'myaccess.dashboard.centers.';
const DASHBOARD_CACHE_BASE_KEY = `${DASHBOARD_CACHE_NAMESPACE}v4`;
const DEFAULT_DATA_SOURCE: DashboardDataSource = 'all';
const DEFAULT_DIGITAL_ACCESS: DashboardDigitalAccess = 'all';
const DEFAULT_LOCATION_KIND: DashboardLocationKind = 'all';
const DEFAULT_PROFESSION = 'all';
const HANDICAP_MIN_SCORE = 2.5;
const INITIAL_RESULTS_LIMIT = 200;
const BACKGROUND_RESULTS_LIMIT = 300;
const MAP_MARKER_LIMIT = 200;
const LOW_RESULT_THRESHOLD = 20;
const SEARCH_MAX_RESULTS = 1000;
const BACKGROUND_PREFETCH_DELAY_MS = 600;

interface DashboardRequestParams {
  search: string;
  dataSource: DashboardDataSource;
  digitalAccess: DashboardDigitalAccess;
  locationKind: DashboardLocationKind;
  profession: string;
  handicapTypes: HandicapType[];
  handicapMinScore?: number;
}

const FALLBACK_DATA_SOURCE_OPTIONS: FilterFacetOption<DashboardDataSource>[] = [
  { value: 'all', count: 0 },
  { value: 'practitioners', count: 0 },
  { value: 'establishments', count: 0 },
  { value: 'mixed', count: 0 },
];

const FALLBACK_DIGITAL_ACCESS_OPTIONS: FilterFacetOption<DashboardDigitalAccess>[] = [
  { value: 'all', count: 0 },
  { value: 'online_booking', count: 0 },
  { value: 'website', count: 0 },
  { value: 'doctolib', count: 0 },
];

const FALLBACK_LOCATION_KIND_OPTIONS: FilterFacetOption<DashboardLocationKind>[] = [
  { value: 'all', count: 0 },
  { value: 'individual_or_small_practice', count: 0 },
  { value: 'probable_group_practice', count: 0 },
  { value: 'probable_specialist_group', count: 0 },
  { value: 'probable_health_center_or_shared_site', count: 0 },
];

const FALLBACK_PROFESSION_OPTIONS: FilterFacetOption<string>[] = [
  { value: 'all', count: 0 },
  { value: 'Laboratoire d\'analyse médicale', count: 0 },
  { value: 'Hôpital', count: 0 },
  { value: 'Médecin généraliste', count: 0 },
  { value: 'Infirmier', count: 0 },
  { value: 'Centre médical', count: 0 },
];

function parseUserHandicaps(user: User | null): HandicapType[] {
  const allowedHandicapTypes = new Set<HandicapType>([
    'sensoriel',
    'moteur',
    'mental',
    'psychique',
    'cognitif',
  ]);

  return (
    user?.handicapType
      ?.split(/[;,]/)
      .map((item) => item.trim() as HandicapType)
      .filter((item) => allowedHandicapTypes.has(item)) || []
  );
}

function normalizeSearchQuery(query: string) {
  return query.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr-FR');
}

function buildRequestParams({
  searchQuery,
  dataSource,
  digitalAccess,
  locationKind,
  profession,
  selectedHandicaps,
}: {
  searchQuery: string;
  dataSource: DashboardDataSource;
  digitalAccess: DashboardDigitalAccess;
  locationKind: DashboardLocationKind;
  profession: string;
  selectedHandicaps: HandicapType[];
}): DashboardRequestParams {
  const search = normalizeSearchQuery(searchQuery);
  return {
    search,
    dataSource,
    digitalAccess,
    locationKind,
    profession,
    handicapTypes: [...selectedHandicaps].sort(),
    handicapMinScore: selectedHandicaps.length > 0 ? HANDICAP_MIN_SCORE : undefined,
  };
}

function buildCacheKey(params: DashboardRequestParams) {
  const cacheParams = new URLSearchParams();
  cacheParams.set('search', params.search || 'initial');
  cacheParams.set('dataSource', params.dataSource);
  cacheParams.set('digitalAccess', params.digitalAccess);
  cacheParams.set('locationKind', params.locationKind);
  cacheParams.set('profession', params.profession);
  cacheParams.set('handicapTypes', params.handicapTypes.join(','));
  if (params.handicapMinScore !== undefined) {
    cacheParams.set('handicapMinScore', params.handicapMinScore.toString());
  }
  return `${DASHBOARD_CACHE_BASE_KEY}:${cacheParams.toString()}`;
}

function readCachedCenters(cacheKey: string): Center[] | null {
  if (typeof window === 'undefined') return null;

  const rawValue = window.sessionStorage.getItem(cacheKey);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as { data?: Center[] };
    return Array.isArray(parsed.data) ? parsed.data : null;
  } catch {
    window.sessionStorage.removeItem(cacheKey);
    return null;
  }
}

function clearDashboardCache(exceptKey?: string) {
  if (typeof window === 'undefined') return;

  try {
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith(DASHBOARD_CACHE_NAMESPACE) && key !== exceptKey) {
        window.sessionStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('Impossible de nettoyer le cache dashboard:', error);
  }
}

function isStorageQuotaError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014)
  );
}

function writeCachedCenters(cacheKey: string, data: Center[]) {
  if (typeof window === 'undefined') return;

  const cachePayload = JSON.stringify({
    cachedAt: new Date().toISOString(),
    data,
  });

  try {
    window.sessionStorage.setItem(cacheKey, cachePayload);
  } catch (error) {
    if (!isStorageQuotaError(error)) {
      console.warn('Impossible de sauvegarder le cache dashboard:', error);
      return;
    }

    clearDashboardCache(cacheKey);

    try {
      window.sessionStorage.setItem(cacheKey, cachePayload);
    } catch (retryError) {
      console.warn('Cache dashboard ignoré faute de place:', retryError);
    }
  }
}

function centerPassesClientFilters({
  center,
  minScore,
  dataSource,
  digitalAccess,
  locationKind,
  profession,
  selectedHandicaps,
}: {
  center: Center;
  minScore: number;
  dataSource: DashboardDataSource;
  digitalAccess: DashboardDigitalAccess;
  locationKind: DashboardLocationKind;
  profession: string;
  selectedHandicaps: HandicapType[];
}) {
  if (center.globalScore < minScore) return false;

  if (dataSource === 'practitioners' && !center.services.includes('Source Santé.fr')) {
    return false;
  }

  if (dataSource === 'establishments' && !center.services.includes('Source AccessLibre')) {
    return false;
  }

  if (
    dataSource === 'mixed' &&
    (!center.services.includes('Source Santé.fr') || !center.services.includes('Source AccessLibre'))
  ) {
    return false;
  }

  if (digitalAccess === 'online_booking' && !center.digitalAccess?.hasOnlineBooking) {
    return false;
  }

  if (digitalAccess === 'website' && !center.digitalAccess?.hasWebsite) {
    return false;
  }

  if (digitalAccess === 'doctolib' && !center.digitalAccess?.hasDoctolib) {
    return false;
  }

  if (locationKind !== 'all' && center.locationKind !== locationKind) {
    return false;
  }

  if (
    profession !== 'all' &&
    !center.professions?.some((centerProfession) => centerProfession.label === profession)
  ) {
    return false;
  }

  if (selectedHandicaps.length > 0) {
    return selectedHandicaps.every((handicap) => {
      return (center.accessibilityHandicapScores?.[handicap] || 0) >= HANDICAP_MIN_SCORE;
    });
  }

  return true;
}

function mergeCenters(existingCenters: Center[], incomingCenters: Center[]) {
  const centersById = new Map<string, Center>();

  for (const center of existingCenters) {
    centersById.set(center.id, center);
  }

  for (const center of incomingCenters) {
    centersById.set(center.id, center);
  }

  return [...centersById.values()];
}

function sortCentersForMap(centers: Center[]) {
  return [...centers].sort((a, b) => {
    const scoreDelta = b.globalScore - a.globalScore;
    if (scoreDelta !== 0) return scoreDelta;

    const digitalDelta =
      (b.digitalAccess?.hasWebsite ? 1 : 0) +
      (b.digitalAccess?.hasOnlineBooking ? 1 : 0) -
      ((a.digitalAccess?.hasWebsite ? 1 : 0) + (a.digitalAccess?.hasOnlineBooking ? 1 : 0));
    if (digitalDelta !== 0) return digitalDelta;

    const professionDelta = (b.professions?.[0]?.count || 0) - (a.professions?.[0]?.count || 0);
    if (professionDelta !== 0) return professionDelta;

    return a.name.localeCompare(b.name);
  });
}

function mergeFacetOptions<T extends string>(
  fallbackOptions: FilterFacetOption<T>[],
  remoteOptions?: FilterFacetOption<T>[]
) {
  const optionsByValue = new Map<T, FilterFacetOption<T>>();

  for (const option of fallbackOptions) {
    optionsByValue.set(option.value, option);
  }

  for (const option of remoteOptions || []) {
    optionsByValue.set(option.value, option);
  }

  return [...optionsByValue.values()].filter((option) => option.value === 'all' || option.count > 0);
}

interface DashboardProps {
  user: User | null;
  onNavigate: (page: string, centerId?: string) => void;
}

export default function DashboardClient({ user }: DashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearchQuery = searchParams.get("q") ?? '';
  const initialHandicaps = parseUserHandicaps(user);

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedHandicaps, setSelectedHandicaps] = useState<HandicapType[]>(initialHandicaps);
  const [minScore, setMinScore] = useState(0);
  const [dataSource, setDataSource] = useState<DashboardDataSource>(DEFAULT_DATA_SOURCE);
  const [digitalAccess, setDigitalAccess] = useState<DashboardDigitalAccess>(DEFAULT_DIGITAL_ACCESS);
  const [locationKind, setLocationKind] = useState<DashboardLocationKind>(
    DEFAULT_LOCATION_KIND
  );
  const [profession, setProfession] = useState(DEFAULT_PROFESSION);
  const [selectedCenter] = useState<Center | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filterFacets, setFilterFacets] = useState<CenterFilterFacets | null>(null);
  const hasLoadedCentersRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    centersApi
      .facets()
      .then((facets) => {
        if (isMounted) setFilterFacets(facets);
      })
      .catch((err) => {
        console.warn('Impossible de charger les filtres:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const requestParams = useMemo(
    () =>
      buildRequestParams({
        searchQuery,
        dataSource,
        digitalAccess,
        locationKind,
        profession,
        selectedHandicaps,
      }),
    [searchQuery, dataSource, digitalAccess, locationKind, profession, selectedHandicaps]
  );
  const cacheKey = useMemo(() => buildCacheKey(requestParams), [requestParams]);
  const dataSourceOptions = useMemo(
    () => mergeFacetOptions(FALLBACK_DATA_SOURCE_OPTIONS, filterFacets?.dataSources),
    [filterFacets]
  );
  const digitalAccessOptions = useMemo(
    () => mergeFacetOptions(FALLBACK_DIGITAL_ACCESS_OPTIONS, filterFacets?.digitalAccess),
    [filterFacets]
  );
  const locationKindOptions = useMemo(
    () => mergeFacetOptions(FALLBACK_LOCATION_KIND_OPTIONS, filterFacets?.locationKinds),
    [filterFacets]
  );
  const professionOptions = useMemo(
    () => mergeFacetOptions(FALLBACK_PROFESSION_OPTIONS, filterFacets?.professions),
    [filterFacets]
  );

  useEffect(() => {
    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      const loadCenters = async () => {
        const cachedCenters = readCachedCenters(cacheKey);
        if (cachedCenters) {
          setCenters(cachedCenters);
          setIsLoading(false);
          setIsRefreshing(false);
          setError(null);
          hasLoadedCentersRef.current = true;
        } else if (hasLoadedCentersRef.current) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        try {
          const baseRequest = {
            search: requestParams.search || undefined,
            dataSource: requestParams.dataSource,
            digitalAccess: requestParams.digitalAccess,
            locationKind: requestParams.locationKind,
            profession: requestParams.profession,
            handicapTypes: requestParams.handicapTypes,
            handicapMinScore: requestParams.handicapMinScore,
          };
          const shouldProgressivelyExpandSearch = requestParams.search.length >= 3;
          let mergedCenters = cachedCenters || [];
          let offset = cachedCenters?.length || 0;

          if (!cachedCenters) {
            mergedCenters = await centersApi.list({
              ...baseRequest,
              limit: INITIAL_RESULTS_LIMIT,
              offset: 0,
            });
            offset = INITIAL_RESULTS_LIMIT;
          }

          if (isMounted) {
            setCenters(mergedCenters);
            writeCachedCenters(cacheKey, mergedCenters);
            hasLoadedCentersRef.current = true;
            setIsLoading(false);
          }

          const shouldFetchMore = () => {
            if (!requestParams.search) return mergedCenters.length < INITIAL_RESULTS_LIMIT + BACKGROUND_RESULTS_LIMIT;
            if (!shouldProgressivelyExpandSearch) return false;

            const filteredCount = mergedCenters.filter((center) =>
              centerPassesClientFilters({
                center,
                minScore,
                dataSource,
                digitalAccess,
                locationKind,
                profession,
                selectedHandicaps,
              })
            ).length;

            return filteredCount < LOW_RESULT_THRESHOLD && mergedCenters.length < SEARCH_MAX_RESULTS;
          };

          if (shouldFetchMore()) {
            await new Promise((resolve) => window.setTimeout(resolve, BACKGROUND_PREFETCH_DELAY_MS));
          }

          while (isMounted && shouldFetchMore()) {
            const maxResults = requestParams.search ? SEARCH_MAX_RESULTS : INITIAL_RESULTS_LIMIT + BACKGROUND_RESULTS_LIMIT;
            const pageLimit = Math.min(BACKGROUND_RESULTS_LIMIT, maxResults - mergedCenters.length);
            if (pageLimit <= 0) break;

            setIsRefreshing(true);
            const page = await centersApi.list({
              ...baseRequest,
              limit: pageLimit,
              offset,
            });

            if (page.length === 0) break;

            mergedCenters = mergeCenters(mergedCenters, page);
            offset += page.length;

            if (isMounted) {
              setCenters(mergedCenters);
              writeCachedCenters(cacheKey, mergedCenters);
            }

            if (page.length < pageLimit) break;
          }
        } catch (err) {
          if (isMounted) {
            setIsLoading(false);
            setError(
              err instanceof Error
                ? err.message
                : "Impossible de charger les centres"
            );
          }
        } finally {
          if (isMounted) {
            setIsRefreshing(false);
          }
        }
      };

      loadCenters();
    }, 300);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [
    cacheKey,
    refreshNonce,
    requestParams,
    minScore,
    dataSource,
    digitalAccess,
    locationKind,
    profession,
    selectedHandicaps,
  ]);

  const filteredCenters = useMemo(() => {
    return centers.filter((center) =>
      centerPassesClientFilters({
        center,
        minScore,
        dataSource,
        digitalAccess,
        locationKind,
        profession,
        selectedHandicaps,
      })
    );
  }, [centers, minScore, dataSource, digitalAccess, locationKind, profession, selectedHandicaps]);

  const mapCenters = useMemo(
    () => sortCentersForMap(filteredCenters).slice(0, MAP_MARKER_LIMIT),
    [filteredCenters]
  );

  const refreshCurrentSearch = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(cacheKey);
    }
    setRefreshNonce((value) => value + 1);
  };

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
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={refreshCurrentSearch}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
            {/*<Button variant="outline" className="gap-2">
              <Map className="h-4 w-4" />
              Itinéraire
            </Button>*/}
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
              dataSource={dataSource}
              onDataSourceChange={setDataSource}
              digitalAccess={digitalAccess}
              onDigitalAccessChange={setDigitalAccess}
              locationKind={locationKind}
              onLocationKindChange={setLocationKind}
              profession={profession}
              onProfessionChange={setProfession}
              dataSourceOptions={dataSourceOptions}
              digitalAccessOptions={digitalAccessOptions}
              locationKindOptions={locationKindOptions}
              professionOptions={professionOptions}
            />
          </aside>

          {/* Main Content */}
          <section className="lg:col-span-3" aria-label="Résultats de recherche">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground" aria-live="polite" aria-atomic="true">
                  {filteredCenters.length} centre{filteredCenters.length > 1 ? 's' : ''} trouvé{filteredCenters.length > 1 ? 's' : ''}
                </p>
                {viewMode === 'map' && filteredCenters.length > mapCenters.length && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {mapCenters.length} meilleurs résultats affichés sur la carte
                  </p>
                )}
                {isRefreshing && (
                  <p className="text-xs text-muted-foreground mt-1">Mise à jour des résultats...</p>
                )}
              </div>

              <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as 'map' | 'list')}>
                <TabsList aria-label="Modes d'affichage des résultats">
                  <TabsTrigger value="map" className="gap-2" aria-label='Afficher la carte des centres'>
                    <MapIcon aria-hidden="true" className="h-4 w-4" />
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
                  centers={mapCenters}
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
                        setDataSource('all');
                        setDigitalAccess('all');
                        setLocationKind('all');
                        setProfession('all');
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
