import { FormEvent, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import { centersApi } from '@/lib/api';

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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/30 p-4">
      {error && (
        <div
          className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="comment">Commentaire</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Décrivez ce que vous avez constaté sur place."
          rows={4}
          required
        />
      </div>

      {presentCriteria.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-medium">Éléments indiqués présents</h3>
            <p className="text-sm text-muted-foreground">
              Cochez ceux qui étaient absents lors de votre visite.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {presentCriteria.map((criterion) => (
              <label
                key={criterion.key}
                className="flex items-start gap-3 rounded-md border bg-background p-3 text-sm"
              >
                <Checkbox
                  checked={reportedAbsentKeys.includes(criterion.key)}
                  onCheckedChange={() =>
                    toggleKey(
                      criterion.key,
                      reportedAbsentKeys,
                      setReportedAbsentKeys
                    )
                  }
                />
                <span>
                  <span className="block font-medium">{criterion.label}</span>
                  <span className="text-xs text-muted-foreground">
                    Absent finalement
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {absentCriteria.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-medium">Critères non signalés</h3>
            <p className="text-sm text-muted-foreground">
              Cochez ceux qui étaient pourtant présents.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {absentCriteria.map((criterion) => (
              <label
                key={criterion.key}
                className="flex items-start gap-3 rounded-md border bg-background p-3 text-sm"
              >
                <Checkbox
                  checked={reportedPresentKeys.includes(criterion.key)}
                  onCheckedChange={() =>
                    toggleKey(
                      criterion.key,
                      reportedPresentKeys,
                      setReportedPresentKeys
                    )
                  }
                />
                <span>
                  <span className="block font-medium">{criterion.label}</span>
                  <span className="text-xs text-muted-foreground">
                    Présent sur place
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-medium">Aide ajoutée</h3>
            <p className="text-sm text-muted-foreground">
              Ajoutez un élément utile qui n&apos;est pas dans les critères.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addCustomItem}>
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        {customItems.length > 0 && (
          <div className="space-y-3">
            {customItems.map((item) => (
              <div key={item.id} className="space-y-3 rounded-md border bg-background p-3">
                <div className="flex gap-2">
                  <Input
                    value={item.label}
                    onChange={(e) =>
                      updateCustomItem(item.id, { label: e.target.value })
                    }
                    placeholder="Ex. boucle magnétique, salle calme, rampe mobile"
                  />
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

                <div className="flex flex-wrap gap-3">
                  {handicapTypes.map((type) => (
                    <label key={type.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={item.handicapTypes.includes(type.value)}
                        onCheckedChange={() => toggleCustomHandicap(item, type.value)}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>

                <Textarea
                  value={item.comment}
                  onChange={(e) =>
                    updateCustomItem(item.id, { comment: e.target.value })
                  }
                  placeholder="Précision optionnelle"
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
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
