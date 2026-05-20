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



import { HandicapType } from "@/types";

const handicapTypes: { value: HandicapType; label: string }[] = [
  { value: 'wheelchair', label: 'Fauteuil roulant' },
  { value: 'walking_difficulty', label: 'Marche difficile' },
  { value: 'vision', label: 'Déficience visuelle' },
  { value: 'hearing', label: 'Déficience auditive' },
  { value: 'intellectual', label: 'Déficience intellectuelle' },
  { value: 'psychological', label: 'Handicap psychique' },
  { value: 'autism', label: 'TSA' },
  { value: 'obesity', label: 'Obésité' },
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
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
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
            : "Une erreur est survenue lors de l'inscription",
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
    // Évolution v2 : Fond bleu lumineux et conteneur relatif pour les décorations
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-[#f4f8ff] font-sans p-4 relative overflow-hidden"
    >
      <h1 className="sr-only">Création de compte MyAccess</h1>

      {/* Annonce invisible pour lecteur d'écran lors du changement d'étape */}
      <div aria-live="polite" className="sr-only">
        Étape {step} sur 2 :{" "}
        {step === 1 ? "Créer un compte" : "Personnalisez votre profil"}
      </div>

      {/* Cercles de décoration en arrière-plan (masqués pour l'accessibilité) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 border border-blue-200/40 rounded-full animate-[spin_240s_linear_infinite]" />
        <div className="absolute inset-12 border border-dashed border-blue-200/50 rounded-full animate-[spin_180s_linear_infinite]" />
        <div className="absolute inset-24 border border-blue-100/40 rounded-full" />
      </div>

      {/* Carte surélevée avec effet de flou et ombre douce */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] my-12">
        <CardHeader className="text-center pb-6">
          <CardTitle>
            {step === 1 ? "Créer un compte" : "Personnalisez votre profil"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Rejoignez MyAccess pour trouver des centres adaptés"
              : "Configurez vos préférences d'accessibilité (recommandé)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Gestion des erreurs globales accessible */}
            {generalError && (
              <div
                ref={errorRef}
                tabIndex={-1}
                className="p-3.5 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl outline-none focus:ring-2 focus:ring-destructive"
                role="alert"
                aria-live="assertive"
              >
                {generalError}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-bold text-[#14284b]"
                    >
                      Prénom
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className={`rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all ${errors.firstName ? "border-destructive focus-visible:border-destructive" : ""}`}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={
                        errors.firstName ? "firstName-error" : undefined
                      }
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p
                        id="firstName-error"
                        className="text-sm font-medium text-destructive mt-1"
                        role="alert"
                      >
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-bold text-[#14284b]"
                    >
                      Nom
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className={`rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all ${errors.lastName ? "border-destructive focus-visible:border-destructive" : ""}`}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={
                        errors.lastName ? "lastName-error" : undefined
                      }
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p
                        id="lastName-error"
                        className="text-sm font-medium text-destructive mt-1"
                        role="alert"
                      >
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-bold text-[#14284b]"
                  >
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all ${errors.email ? "border-destructive focus-visible:border-destructive" : ""}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="text-sm font-medium text-destructive mt-1"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-bold text-[#14284b]"
                  >
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all ${errors.password ? "border-destructive focus-visible:border-destructive" : ""}`}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-sm font-medium text-destructive mt-1"
                      role="alert"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-bold text-[#14284b]"
                  >
                    Confirmer le mot de passe
                  </Label>
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
                    className={`rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all ${errors.confirmPassword ? "border-destructive focus-visible:border-destructive" : ""}`}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirmPassword-error"
                        : undefined
                    }
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p
                      id="confirmPassword-error"
                      className="text-sm font-medium text-destructive mt-1"
                      role="alert"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 pt-2">
                <div>
                  <h2 className="text-sm font-bold text-[#14284b] mb-1 block">
                    Sélectionnez vos besoins d&apos;accessibilité
                  </h2>
                  <p className="text-sm text-[#556987] font-medium mb-5">
                    Cela nous aidera à personnaliser vos résultats de recherche.
                  </p>
                  <div
                    className="space-y-3.5"
                    role="group"
                    aria-label="Sélectionnez vos besoins en aménagements et services"
                  >
                    {handicapTypes.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={type.value}
                          checked={formData.handicapTypes.includes(type.value)}
                          onCheckedChange={() => toggleHandicapType(type.value)}
                          disabled={isLoading}
                          className="rounded-[4px] border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                          htmlFor={type.value}
                          className="text-sm font-medium text-[#14284b] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl font-bold border-slate-200 text-[#556987] hover:bg-slate-50 transition-all focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Retour
                </Button>
              )}
              <Button
                type="submit"
                className="flex-[2] h-11 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 transition-all focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      aria-hidden="true"
                      className="mr-2 h-5 w-5 animate-spin"
                    />
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
                className="w-full h-11 rounded-xl font-semibold text-[#556987] hover:bg-slate-50 hover:text-[#14284b] transition-all focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                disabled={isLoading}
              >
                Passer cette étape
              </Button>
            )}

            <div className="text-center text-sm font-medium text-[#556987] pt-2">
              Déjà un compte ?{" "}
              <Link
                className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded px-1 transition-colors"
                href="/login"
              >
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
