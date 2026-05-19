"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Référence pour gérer le focus sur l'erreur globale
  const errorRef = useRef<HTMLDivElement>(null);

  // Déplace le focus sur le message d'erreur lorsqu'il apparaît
  useEffect(() => {
    if (generalError && errorRef.current) {
      errorRef.current.focus();
    }
  }, [generalError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    setGeneralError(null);

    if (!formData.email) {
      newErrors.email = "Email requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Mot de passe requis";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await login(formData.email, formData.password);
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get("redirect");
        router.push(
          redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
            ? redirectTo
            : "/dashboard"
        );
      } catch (error) {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la connexion"
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isLoading = isSubmitting || authLoading;

  return (
    // Transformation en <main> pour la structure de la page
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      {/* Titre invisible visuellement mais crucial pour la hiérarchie des lecteurs d'écran */}
      <h1 className="sr-only">Connexion à MyAccess</h1>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          {/* Si CardTitle rend un <h3> ou <div>, la hiérarchie est maintenant protégée par le <h1> au-dessus */}
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte MyAccess
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {generalError && (
              <div
                ref={errorRef}
                tabIndex={-1} // Permet le focus programmatique sans perturber la navigation Tab classique
                className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md outline-none focus:ring-2 focus:ring-destructive"
                role="alert"
                aria-live="assertive" // Assertive est préférable pour une erreur bloquante
              >
                {generalError}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={errors.email ? "border-destructive" : ""}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isLoading}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-destructive mt-1"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={errors.password ? "border-destructive" : ""}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                disabled={isLoading}
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive mt-1"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                onClick={() =>
                  alert("Fonctionnalité de récupération de mot de passe à venir")
                }
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              {/* Utilisation de Link au lieu de <a> */}
              <Link className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" href="/signup">
                S&apos;inscrire
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
