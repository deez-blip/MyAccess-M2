"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { Review } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Building, Star } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type ReviewWithCenter = Review & {
  center: {
    id: string;
    name: string;
    address: string;
    city: string;
    type: string;
  };
};

export default function MyReviewsPage() {
  const { session } = useAuth();
  const token = session?.accessToken;
  const [reviews, setReviews] = useState<ReviewWithCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .myReviews(token)
      .then((data) => {
        setReviews(data);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération de vos avis", err);
        setError("Erreur lors de la récupération de vos avis.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6 text-primary">Mes avis</h1>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive rounded-lg p-6">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-lg border p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas encore laissé d'avis.
          </p>
          <Link
            href="/dashboard"
            className="text-primary hover:underline font-medium"
          >
            Explorer les centres
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="overflow-hidden transition-all hover:shadow-md"
            >
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link
                      href={`/center/${review.centerId}`}
                      className="hover:underline"
                    >
                      <CardTitle className="text-xl text-primary flex items-center gap-2">
                        {review.center.name}
                      </CardTitle>
                    </Link>
                    <CardDescription className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {review.center.type || "Centre médical"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {review.center.city || "Localisation non renseignée"}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{review.scores.accueil}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Publié le{" "}
                    {format(new Date(review.date), "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-foreground leading-relaxed my-4 italic border-l-4 border-muted pl-4">
                    "{review.comment}"
                  </p>
                )}

                {review.handicapTypes && review.handicapTypes.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.handicapTypes.map((type, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-primary/5"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
