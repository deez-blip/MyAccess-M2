import { FormEvent, useMemo, useState } from 'react';
import {
  CheckCircle2,
  MessageSquareText,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  AccessibilityCriterion,
  Center,
  HandicapType,
  ReviewAccessibilityItem,
  Review,
  User,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { centersApi } from '@/lib/api';
import { cn } from '@/components/ui/utils';

interface RatingFormProps {
  center: Center;
  user: User;
  token: string;
  review?: Review | null;
  onSubmit: () => void;
  onCancel: () => void;
}

interface CustomAccessibilityItem {
  id: string;
  label: string;
  handicapTypes: HandicapType[];
  comment: string;
}

const handicapTypes: { value: HandicapType; label: string }[] = [
  { value: 'moteur', label: 'Moteur' },
  { value: 'sensoriel', label: 'Sensoriel' },
  { value: 'mental', label: 'Mental' },
  { value: 'psychique', label: 'Psychique' },
  { value: 'cognitif', label: 'Cognitif' },
];

const allowedHandicapTypes = new Set<HandicapType>(
  handicapTypes.map((type) => type.value)
);

const handicapLabels = new Map<HandicapType, string>(
  handicapTypes.map((type) => [type.value, type.label])
);

function getUserHandicapTypes(user: User): HandicapType[] {
  return Array.from(
    new Set(
      (user.handicapType || '')
        .split(/[;,]/)
        .map((value) => value.trim())
        .filter((value): value is HandicapType =>
          allowedHandicapTypes.has(value as HandicapType)
        )
    )
  );
}

function buildReviewItem(
  criterion: AccessibilityCriterion,
  status: ReviewAccessibilityItem['status']
): ReviewAccessibilityItem {
  return {
    criterionKey: criterion.key,
    label: criterion.label,
    status,
    handicapTypes: criterion.handicapTypes,
  };
}

function customItemFromReviewItem(
  item: ReviewAccessibilityItem,
  index: number
): CustomAccessibilityItem {
  return {
    id: `${item.criterionKey}-${index}`,
    label: item.label,
    handicapTypes: item.handicapTypes,
    comment: item.comment || '',
  };
}

function CriterionBadges({ handicapTypes }: { handicapTypes: HandicapType[] }) {
  if (!handicapTypes.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {handicapTypes.map((type) => (
        <Badge key={type} variant="outline" className="bg-background text-[11px]">
          {handicapLabels.get(type) || type}
        </Badge>
      ))}
    </div>
  );
}

function CriterionToggleCard({
  criterion,
  checked,
  onToggle,
  mode,
}: {
  criterion: AccessibilityCriterion;
  checked: boolean;
  onToggle: () => void;
  mode: 'reportAbsent' | 'reportPresent';
}) {
  const isCorrection = mode === 'reportAbsent';
  const Icon = checked ? (isCorrection ? XCircle : CheckCircle2) : CheckCircle2;
  const statusText = checked
    ? isCorrection
      ? 'À corriger : absent'
      : 'Ajouté comme présent'
    : isCorrection
      ? 'Confirmé présent'
      : 'Non observé';

  return (
    <label
      className={cn(
        'flex min-h-[104px] cursor-pointer items-start gap-3 rounded-md border bg-background p-3 text-sm transition-colors',
        checked && isCorrection && 'border-amber-300 bg-amber-50',
        checked && !isCorrection && 'border-emerald-300 bg-emerald-50'
      )}
    >
      <Checkbox
        className="mt-0.5"
        checked={checked}
        onCheckedChange={onToggle}
        aria-label={statusText}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start gap-2">
          <Icon
            className={cn(
              'mt-0.5 h-4 w-4 shrink-0',
              checked && isCorrection && 'text-amber-700',
              checked && !isCorrection && 'text-emerald-700',
              !checked && 'text-muted-foreground'
            )}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <span className="block font-medium leading-snug">{criterion.label}</span>
            <span className="text-xs text-muted-foreground">{statusText}</span>
          </div>
        </div>
        <CriterionBadges handicapTypes={criterion.handicapTypes} />
      </div>
    </label>
  );
}

export function RatingForm({ center, user, token, review, onSubmit, onCancel }: RatingFormProps) {
  const criteria = center.accessibilityCriteria || [];
  const presentCriteria = criteria.filter((criterion) => criterion.present);
  const absentCriteria = criteria.filter((criterion) => !criterion.present);
  const defaultCustomHandicaps = useMemo(() => getUserHandicapTypes(user), [user]);
  const reviewItems = review?.accessibilityItems || [];

  const [comment, setComment] = useState(review?.comment || '');
  const [reportedAbsentKeys, setReportedAbsentKeys] = useState<string[]>(
    reviewItems
      .filter((item) => item.status === 'reported_absent')
      .map((item) => item.criterionKey)
  );
  const [reportedPresentKeys, setReportedPresentKeys] = useState<string[]>(
    reviewItems
      .filter((item) => item.status === 'reported_present')
      .map((item) => item.criterionKey)
  );
  const [customItems, setCustomItems] = useState<CustomAccessibilityItem[]>(
    reviewItems
      .filter((item) => item.status === 'custom_present')
      .map(customItemFromReviewItem)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleKey = (
    key: string,
    selectedKeys: string[],
    setSelectedKeys: (keys: string[]) => void
  ) => {
    setSelectedKeys(
      selectedKeys.includes(key)
        ? selectedKeys.filter((selectedKey) => selectedKey !== key)
        : [...selectedKeys, key]
    );
  };

  const addCustomItem = () => {
    setCustomItems([
      ...customItems,
      {
        id: `${Date.now()}-${customItems.length}`,
        label: '',
        handicapTypes: defaultCustomHandicaps,
        comment: '',
      },
    ]);
  };

  const updateCustomItem = (
    id: string,
    updates: Partial<CustomAccessibilityItem>
  ) => {
    setCustomItems(
      customItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removeCustomItem = (id: string) => {
    setCustomItems(customItems.filter((item) => item.id !== id));
  };

  const toggleCustomHandicap = (item: CustomAccessibilityItem, type: HandicapType) => {
    updateCustomItem(item.id, {
      handicapTypes: item.handicapTypes.includes(type)
        ? item.handicapTypes.filter((handicapType) => handicapType !== type)
        : [...item.handicapTypes, type],
    });
  };

  const buildCriteriaPayload = () => {
    const confirmedOrCorrectedItems = presentCriteria.map((criterion) =>
      buildReviewItem(
        criterion,
        reportedAbsentKeys.includes(criterion.key)
          ? 'reported_absent'
          : 'confirmed_present'
      )
    );
    const reportedPresentItems = absentCriteria
      .filter((criterion) => reportedPresentKeys.includes(criterion.key))
      .map((criterion) => buildReviewItem(criterion, 'reported_present'));

    return [...confirmedOrCorrectedItems, ...reportedPresentItems];
  };

  const buildCustomPayload = () =>
    customItems
      .map((item) => ({
        label: item.label.trim(),
        handicapTypes: item.handicapTypes,
        comment: item.comment.trim() || undefined,
      }))
      .filter((item) => item.label);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setError('Ajoutez un commentaire avant de publier votre avis.');
      return;
    }

    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    const customPayload = buildCustomPayload();
    const hasInvalidCustomItem = customPayload.some(
      (item) => item.handicapTypes.length === 0
    );

    if (hasInvalidCustomItem) {
      setError('Chaque aide ajoutée doit cibler au moins un handicap.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        comment: trimmedComment,
        criteria: buildCriteriaPayload(),
        customItems: customPayload,
      };

      if (review) {
        await centersApi.updateReview(center.id, review.id, payload, token);
      } else {
        await centersApi.addReview(center.id, payload, token);
      }

      onSubmit();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de publier l'avis"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/20 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {review ? 'Modifier mon avis' : 'Ajouter un avis'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Votre retour met à jour les informations d&apos;accessibilité du lieu.
          </p>
        </div>
        <Badge variant="outline" className="bg-background">
          {center.name}
        </Badge>
      </div>

      {error && (
        <div
          className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <section className="space-y-3 rounded-md border-2 border-primary/20 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <Label htmlFor="comment" className="flex items-center gap-2 text-base font-semibold">
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            Commentaire
          </Label>
          <p className="text-sm text-muted-foreground">
            Décrivez rapidement ce que vous avez constaté sur place.
          </p>
        </div>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ex. accueil clair, entrée accessible, signalétique difficile à lire..."
          rows={4}
          required
          className="min-h-[140px] border-2 border-primary/25 bg-white text-base shadow-inner focus-visible:border-primary focus-visible:ring-primary/20"
        />
      </section>

      {presentCriteria.length > 0 && (
        <section className="space-y-3 rounded-md border bg-background/60 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-medium">Corriger les éléments annoncés</h3>
              <p className="text-sm text-muted-foreground">
                Sélectionnez uniquement les aides annoncées que vous n&apos;avez pas retrouvées.
              </p>
            </div>
            <Badge variant="outline">{presentCriteria.length}</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {presentCriteria.map((criterion) => (
              <CriterionToggleCard
                key={criterion.key}
                criterion={criterion}
                checked={reportedAbsentKeys.includes(criterion.key)}
                mode="reportAbsent"
                onToggle={() =>
                  toggleKey(
                    criterion.key,
                    reportedAbsentKeys,
                    setReportedAbsentKeys
                  )
                }
              />
            ))}
          </div>
        </section>
      )}

      {absentCriteria.length > 0 && (
        <section className="space-y-3 rounded-md border bg-background/60 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-medium">Compléter les aides présentes</h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez les critères standards présents sur place mais absents de la fiche.
              </p>
            </div>
            <Badge variant="outline">{absentCriteria.length}</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {absentCriteria.map((criterion) => (
              <CriterionToggleCard
                key={criterion.key}
                criterion={criterion}
                checked={reportedPresentKeys.includes(criterion.key)}
                mode="reportPresent"
                onToggle={() =>
                  toggleKey(
                    criterion.key,
                    reportedPresentKeys,
                    setReportedPresentKeys
                  )
                }
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3 rounded-md border bg-background/60 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-medium">Ajouter une aide spécifique</h3>
            <p className="text-sm text-muted-foreground">
              Pour les éléments utiles qui ne sont pas dans les critères standards.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addCustomItem}>
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        {customItems.length > 0 ? (
          <div className="space-y-3">
            {customItems.map((item, index) => (
              <div key={item.id} className="space-y-4 rounded-md border bg-background p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor={`custom-item-${item.id}`} className="text-sm font-medium">
                      Aide #{index + 1}
                    </Label>
                    <Input
                      id={`custom-item-${item.id}`}
                      value={item.label}
                      onChange={(e) =>
                        updateCustomItem(item.id, { label: e.target.value })
                      }
                      placeholder="Ex. boucle magnétique, salle calme, rampe mobile"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer cette aide"
                    onClick={() => removeCustomItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Handicap concerné</p>
                  <div className="flex flex-wrap gap-2">
                    {handicapTypes.map((type) => {
                      const checked = item.handicapTypes.includes(type.value);

                      return (
                        <label
                          key={type.value}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors',
                            checked && 'border-primary bg-primary/5 text-primary'
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleCustomHandicap(item, type.value)}
                          />
                          {type.label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`custom-comment-${item.id}`} className="text-sm font-medium">
                    Précision optionnelle
                  </Label>
                  <Textarea
                    id={`custom-comment-${item.id}`}
                    value={item.comment}
                    onChange={(e) =>
                      updateCustomItem(item.id, { comment: e.target.value })
                    }
                    placeholder="Ex. disponible à l'accueil sur demande"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed bg-background p-4 text-sm text-muted-foreground">
            Aucune aide spécifique ajoutée.
          </div>
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? review
              ? 'Modification...'
              : 'Publication...'
            : review
              ? "Modifier mon avis"
              : 'Publier mon avis'}
        </Button>
      </div>
    </form>
  );
}
