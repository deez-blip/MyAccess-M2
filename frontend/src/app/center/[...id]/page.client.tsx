"use client"

import { useCallback, useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Globe, ArrowLeft, Calendar, Star, ThumbsUp, Navigation, Pencil, Trash2 } from 'lucide-react';
import { Center, LocationKind, ReviewAccessibilityItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingForm } from './_components/RatingForm';
import { useAuth } from '@/contexts/AuthContext';
import { centersApi } from '@/lib/api';

interface CenterDetailsClientProps {
  idCenter : string;

}

const locationKindLabels: Record<LocationKind, string> = {
  individual_or_small_practice: 'Cabinet individuel / petit',
  probable_group_practice: 'Cabinet de groupe',
  probable_specialist_group: 'Groupe spécialiste',
  probable_health_center_or_shared_site: 'Centre / lieu partagé',
};

function getOfferLabel(center: Center) {
  if (center.offerTypes?.includes('healthcare') || center.source === 'healthcare') {
    return 'Lieu de soins';
  }
  return 'Lieu de soins';
}

function getDigitalAccessBadges(center: Center) {
  const digitalAccess = center.digitalAccess;
  if (!digitalAccess) return [];

  return [
    digitalAccess.hasDoctolib ? 'Doctolib' : null,
    digitalAccess.hasOnlineBooking ? 'RDV en ligne' : null,
    digitalAccess.hasTeleconsultation ? 'Télémédecine' : null,
    digitalAccess.bookingMethods.some((method) => method === 'mail' || method === 'sms')
      ? 'Mail/SMS'
      : null,
    digitalAccess.hasWebsite ? 'Site web' : null,
  ].filter(Boolean) as string[];
}

function normalizeExternalUrl(url?: string | null) {
  if (!url) return null;
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;
  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
}

function getReviewItemStatusLabel(status: ReviewAccessibilityItem['status']) {
  if (status === 'reported_absent') return 'Absent';
  if (status === 'reported_present') return 'Présent';
  if (status === 'custom_present') return 'Ajouté';
  return 'Confirmé';
}

function getReviewItemBadgeVariant(
  status: ReviewAccessibilityItem['status']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'reported_absent') return 'destructive';
  if (status === 'confirmed_present') return 'secondary';
  if (status === 'custom_present') return 'default';
  return 'outline';
}

export default function CenterDetailsClient({ idCenter }: CenterDetailsClientProps) {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [reviewActionError, setReviewActionError] = useState<string | null>(null);

  const { user, session } = useAuth()
  
  const [center, setCenter] = useState(undefined as Center | undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCenter = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await centersApi.get(idCenter);
      setCenter(data);
    } catch (err) {
      setCenter(undefined);
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le centre"
      );
    } finally {
      setIsLoading(false);
    }
  }, [idCenter]);

  useEffect(() => {
    loadCenter();
  }, [loadCenter]);

  if (isLoading) {
    return(
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement du centre...</p>
      </div>
    )
  }

  if (!center) {
    return(
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className={error ? "text-destructive" : "text-muted-foreground"}>
            {error || "Centre non trouvé."}
          </p>
          <Button
            variant="link"
            onClick={() => window.location.href = '/dashboard'}
            className="mt-2"
          >
            Retour à la recherche
          </Button>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-500';
    if (score >= 2.5) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const handleGetDirections = () => {
    const address = encodeURIComponent(`${center.address}, ${center.postalCode} ${center.city}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=transit`, '_blank');
  };

  const isHealthcareLocation = center.id.startsWith('healthcare:');
  const mainProfession = center.professions?.[0]?.label;
  const locationKindLabel = center.locationKind ? locationKindLabels[center.locationKind] : null;
  const digitalAccessBadges = getDigitalAccessBadges(center);
  const phone = center.phone?.trim();
  const email = center.email?.trim();
  const websiteUrl = normalizeExternalUrl(center.website || center.digitalAccess?.websiteUrl);
  const appointmentUrl = normalizeExternalUrl(center.digitalAccess?.doctolibUrl || center.digitalAccess?.websiteUrl || center.website);
  const loginRedirectUrl = `/login?redirect=${encodeURIComponent(`/center/${center.id}`)}`;
  const canOpenRatingForm = Boolean(user && session?.accessToken);
  const userReviewCount = user
    ? center.reviews.filter((review) => review.userId === user.id).length
    : 0;

  const handleDeleteReview = async (reviewId: string) => {
    if (!session?.accessToken) {
      setReviewActionError('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    if (!window.confirm('Supprimer cet avis ? Cette action est définitive.')) {
      return;
    }

    try {
      setReviewActionError(null);
      setDeletingReviewId(reviewId);
      await centersApi.deleteReview(center.id, reviewId, session.accessToken);
      if (editingReviewId === reviewId) setEditingReviewId(null);
      await loadCenter();
    } catch (err) {
      setReviewActionError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer l'avis"
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la recherche
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h1 className="mb-2">{center.name}</h1>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`flex items-center gap-1 ${getScoreColor(center.globalScore)}`}
                      >
                        <Star className="h-6 w-6" fill="currentColor" />
                        <span className="text-xl">{center.globalScore}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({center.reviews.length} avis)
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge>{getOfferLabel(center)}</Badge>
                      {mainProfession && (
                        <Badge variant="secondary">{mainProfession}</Badge>
                      )}
                      {locationKindLabel && (
                        <Badge variant="outline">{locationKindLabel}</Badge>
                      )}
                      {isHealthcareLocation && (
                        <Badge variant="outline">Source Santé.fr / ANS</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>
                      {center.address}, {center.postalCode} {center.city}
                    </span>
                  </div>
                  {phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${phone}`} className="hover:underline">
                        {phone}
                      </a>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${email}`} className="hover:underline">
                        {email}
                      </a>
                    </div>
                  )}
                  {websiteUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Site web
                      </a>
                    </div>
                  )}
                  {!phone && !email && !websiteUrl && (
                    <p className="text-sm text-muted-foreground">
                      Contact non renseigné.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{center.hours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Scores d&apos;accessibilité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Accessibilité physique</span>
                    <span
                      className={`${getScoreColor(center.accessibilityScore.physique)}`}
                    >
                      {center.accessibilityScore.physique}/5
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${getProgressColor(center.accessibilityScore.physique)}`}
                      style={{
                        width: `${(center.accessibilityScore.physique / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>
                      {isHealthcareLocation
                        ? "Disponibilité numérique"
                        : "Accessibilité numérique"}
                    </span>
                    <span
                      className={`${getScoreColor(center.accessibilityScore.numerique)}`}
                    >
                      {center.accessibilityScore.numerique}/5
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${getProgressColor(center.accessibilityScore.numerique)}`}
                      style={{
                        width: `${(center.accessibilityScore.numerique / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {isHealthcareLocation && center.digitalAccess && (
                  <div className="rounded-md border p-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">
                        Canaux numériques
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Accessibilité numérique non vérifiée
                      </span>
                    </div>
                    {digitalAccessBadges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {digitalAccessBadges.map((label) => (
                          <Badge key={label} variant="secondary">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Aucun canal numérique identifié dans les données source.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Qualité de l&apos;accueil</span>
                    <span
                      className={`${getScoreColor(center.accessibilityScore.accueil)}`}
                    >
                      {center.accessibilityScore.accueil}/5
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${getProgressColor(center.accessibilityScore.accueil)}`}
                      style={{
                        width: `${(center.accessibilityScore.accueil / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            {center.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services & Équipements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {center.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Avis et retours d&apos;expérience</CardTitle>
                  {canOpenRatingForm ? (
                    <Button
                      onClick={() => {
                        setEditingReviewId(null);
                        setReviewActionError(null);
                        setShowRatingForm(!showRatingForm);
                      }}
                    >
                      {showRatingForm
                        ? "Annuler"
                        : userReviewCount > 0
                          ? "Donner un autre avis"
                          : "Donner mon avis"}
                    </Button>
                  ) : !user ? (
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = loginRedirectUrl)}
                    >
                      Se connecter pour donner un avis
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                {reviewActionError && (
                  <div
                    className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
                    role="alert"
                    aria-live="polite"
                  >
                    {reviewActionError}
                  </div>
                )}

                {showRatingForm && canOpenRatingForm ? (
                  <RatingForm
                    center={center}
                    user={user!}
                    token={session?.accessToken || ""}
                    review={null}
                    onSubmit={() => {
                      setShowRatingForm(false);
                      loadCenter();
                    }}
                    onCancel={() => setShowRatingForm(false)}
                  />
                ) : (
                  <>
                    {center.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {center.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="border-b last:border-0 pb-4 last:pb-0"
                          >
                            {editingReviewId === review.id &&
                            canOpenRatingForm ? (
                              <RatingForm
                                center={center}
                                user={user!}
                                token={session?.accessToken || ""}
                                review={review}
                                onSubmit={() => {
                                  setEditingReviewId(null);
                                  loadCenter();
                                }}
                                onCancel={() => setEditingReviewId(null)}
                              />
                            ) : (
                              <>
                                <div className="flex justify-between items-start gap-3 mb-2">
                                  <div>
                                    <p className="font-medium">
                                      {review.userName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(review.date).toLocaleDateString(
                                        "fr-FR",
                                      )}
                                    </p>
                                  </div>

                                  {user?.id === review.userId && (
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setShowRatingForm(false);
                                          setReviewActionError(null);
                                          setEditingReviewId(review.id);
                                        }}
                                      >
                                        <Pencil className="mr-1 h-4 w-4" />
                                        Modifier
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                          deletingReviewId === review.id
                                        }
                                        onClick={() =>
                                          handleDeleteReview(review.id)
                                        }
                                      >
                                        <Trash2 className="mr-1 h-4 w-4" />
                                        {deletingReviewId === review.id
                                          ? "Suppression..."
                                          : "Supprimer"}
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                <p className="text-sm mb-2">{review.comment}</p>

                                {review.accessibilityItems?.length ? (
                                  <div className="mb-2 flex flex-wrap gap-2">
                                    {review.accessibilityItems.map((item) => (
                                      <Badge
                                        key={`${review.id}-${item.criterionKey}-${item.status}`}
                                        variant={getReviewItemBadgeVariant(
                                          item.status,
                                        )}
                                      >
                                        {getReviewItemStatusLabel(item.status)}{" "}
                                        · {item.label}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : null}

                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    Utile ({review.helpfulCount})
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Aucun avis pour le moment.
                        {!user
                          ? " Connectez-vous pour partager votre expérience."
                          : ""}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!appointmentUrl}
                    onClick={() => {
                      if (appointmentUrl)
                        window.open(
                          appointmentUrl,
                          "_blank",
                          "noopener,noreferrer",
                        );
                    }}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    {appointmentUrl
                      ? "Prendre rendez-vous"
                      : "RDV en ligne indisponible"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGetDirections}
                  >
                    <Navigation className="mr-2 h-5 w-5" />
                    Itinéraire accessible
                  </Button>
                </CardContent>
              </Card>

              {!user && (
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="pt-6">
                    <h3 className="mb-2 text-white">
                      Partagez votre expérience
                    </h3>
                    <p className="text-sm text-white mb-4 opacity-90">
                      Connectez-vous pour publier un avis et contribuer à la
                      communauté.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => (window.location.href = loginRedirectUrl)}
                    >
                      Se connecter
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
