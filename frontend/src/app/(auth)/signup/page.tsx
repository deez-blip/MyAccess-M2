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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type HandicapType =
  | "moteur"
  | "sensoriel"
  | "mental"
  | "psychique"
  | "cognitif";

const handicapTypes: { value: HandicapType; label: string }[] = [
  { value: "moteur", label: "Handicaps moteurs" },
  { value: "sensoriel", label: "Handicaps sensoriels" },
  { value: "mental", label: "Handicaps mentaux" },
  { value: "psychique", label: "Handicaps psychiques" },
  { value: "cognitif", label: "Handicaps cognitifs" },
];

export default function SignUpPage() {
  const router = useRouter();
  const { signup, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    handicapTypes: [] as HandicapType[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const errorRef = useRef<HTMLDivElement>(null);

  // Focus automatique sur l'erreur générale lorsqu'elle apparaît
  useEffect(() => {
    if (generalError && errorRef.current) {
      errorRef.current.focus();
    }
  }, [generalError]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) {
      newErrors.firstName = "Prénom requis";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Nom requis";
    }

    if (!formData.email) {
      newErrors.email = "Email requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Mot de passe requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else {
      setIsSubmitting(true);
      try {
        await signup({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          handicapType: formData.handicapTypes.join(",") || undefined,
        });
        router.push("/dashboard");
      } catch (error) {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'inscription"
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleHandicapType = (type: HandicapType) => {
    setFormData((prev) => ({
      ...prev,
      handicapTypes: prev.handicapTypes.includes(type)
        ? prev.handicapTypes.filter((t) => t !== type)
        : [...prev.handicapTypes, type],
    }));
  };

  const isLoading = isSubmitting || authLoading;

  return (
    <main id="main-content" className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-muted/30 py-12 px-4">
      <h1 className="sr-only">Création de compte MyAccess</h1>
      
      {/* Annonce invisible pour lecteur d'écran lors du changement d'étape */}
      <div aria-live="polite" className="sr-only">
        Étape {step} sur 2 : {step === 1 ? "Créer un compte" : "Personnalisez votre profil"}
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {step === 1 ? "Créer un compte" : "Personnalisez votre profil"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Créez votre compte pour accéder à toutes les fonctionnalités"
              : "Configurez vos préférences d'accessibilité (optionnel mais recommandé)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {generalError && (
              <div
                ref={errorRef}
                tabIndex={-1}
                className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md outline-none focus:ring-2 focus:ring-destructive"
                role="alert"
                aria-live="assertive"
              >
                {generalError}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className={errors.firstName ? "border-destructive" : ""}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? "firstName-error" : undefined}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p id="firstName-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className={errors.lastName ? "border-destructive" : ""}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={errors.lastName ? "lastName-error" : undefined}
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p id="lastName-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

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
                    <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
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
                    <p id="password-error" className="text-sm text-destructive mt-1" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={
                      errors.confirmPassword ? "border-destructive" : ""
                    }
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p id="confirmPassword-error" className="text-sm text-destructive mt-1" role="alert">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium leading-none mb-3 block">
                    Sélectionnez vos besoins d&apos;accessibilité
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cela nous aidera à personnaliser vos résultats de recherche
                  </p>
                  <div className="space-y-3" role="group" aria-label="Sélectionnez vos types de handicap">
                    {handicapTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={formData.handicapTypes.includes(type.value)}
                          onCheckedChange={() => toggleHandicapType(type.value)}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor={type.value}
                          className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Retour
                </Button>
              )}
              <Button type="submit" className="flex-1 focus:ring-2 focus:ring-primary focus:ring-offset-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                    {step === 1 ? "Chargement..." : "Création..."}
                  </>
                ) : step === 1 ? (
                  "Continuer"
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </div>

            {step === 2 && (
              <Button
                type="submit"
                variant="ghost"
                className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-2"
                disabled={isLoading}
              >
                Passer cette étape
              </Button>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" href="/login">
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
