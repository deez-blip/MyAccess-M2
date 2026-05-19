import {
  DashboardDataSource,
  DashboardDigitalAccess,
  DashboardLocationKind,
  FilterFacetOption,
  HandicapType,
} from '@/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';

interface FilterPanelProps {
  selectedHandicaps: HandicapType[];
  onHandicapChange: (handicaps: HandicapType[]) => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  dataSource: DashboardDataSource;
  onDataSourceChange: (source: DashboardDataSource) => void;
  digitalAccess: DashboardDigitalAccess;
  onDigitalAccessChange: (digitalAccess: DashboardDigitalAccess) => void;
  locationKind: DashboardLocationKind;
  onLocationKindChange: (kind: DashboardLocationKind) => void;
  profession: string;
  onProfessionChange: (profession: string) => void;
  dataSourceOptions: FilterFacetOption<DashboardDataSource>[];
  digitalAccessOptions: FilterFacetOption<DashboardDigitalAccess>[];
  locationKindOptions: FilterFacetOption<DashboardLocationKind>[];
  professionOptions: FilterFacetOption<string>[];
}

const handicapTypes: { value: HandicapType; label: string; icon: string }[] = [
  { value: 'moteur', label: 'Handicaps moteurs', icon: '🦽' },
  { value: 'sensoriel', label: 'Handicaps sensoriels', icon: '👁️' },
  { value: 'mental', label: 'Handicaps mentaux', icon: '🧠' },
  { value: 'psychique', label: 'Handicaps psychiques', icon: '💭' },
  { value: 'cognitif', label: 'Handicaps cognitifs', icon: '🎯' },
];

const dataSourceLabels: Record<DashboardDataSource, string> = {
  all: 'Tous lieux',
  practitioners: 'Praticiens Santé.fr',
  establishments: 'AccessLibre',
  mixed: 'Lieux mixtes',
};

const digitalAccessLabels: Record<DashboardDigitalAccess, string> = {
  all: 'Tous',
  online_booking: 'RDV en ligne',
  website: 'Site web renseigné',
  doctolib: 'Doctolib',
};

const locationKindLabels: Record<DashboardLocationKind, string> = {
  all: 'Tous types',
  individual_or_small_practice: 'Cabinet individuel / petit',
  probable_group_practice: 'Cabinet de groupe',
  probable_specialist_group: 'Groupe spécialiste',
  probable_health_center_or_shared_site: 'Centre / lieu partagé',
};

function formatCount(count: number) {
  return new Intl.NumberFormat('fr-FR').format(count);
}

function optionLabel(label: string, count?: number) {
  return count !== undefined ? `${label} (${formatCount(count)})` : label;
}

export function FilterPanel({
  selectedHandicaps,
  onHandicapChange,
  minScore,
  onMinScoreChange,
  dataSource,
  onDataSourceChange,
  digitalAccess,
  onDigitalAccessChange,
  locationKind,
  onLocationKindChange,
  profession,
  onProfessionChange,
  dataSourceOptions,
  digitalAccessOptions,
  locationKindOptions,
  professionOptions,
}: FilterPanelProps) {
  const toggleHandicap = (handicap: HandicapType) => {
    if (selectedHandicaps.includes(handicap)) {
      onHandicapChange(selectedHandicaps.filter(h => h !== handicap));
    } else {
      onHandicapChange([...selectedHandicaps, handicap]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres de recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block">Source</Label>
          <Select
            value={dataSource}
            onValueChange={(value: DashboardDataSource) => onDataSourceChange(value)}
            aria-label="Sélectionner la source des lieux"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dataSourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {optionLabel(dataSourceLabels[option.value], option.count)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-3 block">Type de lieu</Label>
          <Select
            value={locationKind}
            onValueChange={(value: DashboardLocationKind) => onLocationKindChange(value)}
            aria-label="Sélectionner le type de lieu"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locationKindOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {optionLabel(locationKindLabels[option.value], option.count)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-3 block">Profession ou activité</Label>
          <Select
            value={profession}
            onValueChange={(value: string) => onProfessionChange(value)}
            aria-label="Sélectionner une profession ou une activité"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {professionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value === 'all'
                    ? optionLabel('Toutes activités', option.count)
                    : optionLabel(option.value, option.count)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-3 block">Accès numérique</Label>
          <Select
            value={digitalAccess}
            onValueChange={(value: DashboardDigitalAccess) => onDigitalAccessChange(value)}
            aria-label="Sélectionner un accès numérique"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {digitalAccessOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {optionLabel(digitalAccessLabels[option.value], option.count)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <Label>Score d&apos;accessibilité minimum</Label>
            <span className="text-sm text-muted-foreground">{minScore}/5</span>
          </div>
          <Slider
            value={[minScore]}
            onValueChange={(values: number[]) => onMinScoreChange(values[0])}
            min={0}
            max={5}
            step={0.5}
            className="mb-2"
            aria-label="Score d'accessibilité minimum"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>5</span>
          </div>
        </div>

        {/* Types de handicap */}
        <div>
          <Label className="mb-3 block">Filtrer par type de handicap</Label>
          <div className="space-y-3">
            {handicapTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`filter-${type.value}`}
                  checked={selectedHandicaps.includes(type.value)}
                  onCheckedChange={() => toggleHandicap(type.value)}
                />
                <label
                  htmlFor={`filter-${type.value}`}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Reset filters */}
        <button
          onClick={() => {
            onHandicapChange([]);
            onMinScoreChange(0);
            onDataSourceChange('all');
            onDigitalAccessChange('all');
            onLocationKindChange('all');
            onProfessionChange('all');
          }}
          className="w-full text-sm text-primary hover:underline"
        >
          Réinitialiser les filtres
        </button>
      </CardContent>
    </Card>
  );
}
