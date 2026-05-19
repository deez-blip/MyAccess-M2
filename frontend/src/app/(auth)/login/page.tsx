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
        router.push("/dashboard");
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
    // Évolution v2 : Fond bleu lumineux et conteneur relatif pour les décorations
    <main 
      id="main-content" 
      className="min-h-screen flex items-center justify-center bg-[#f4f8ff] font-sans p-4 relative overflow-hidden"
    >
      <h1 className="sr-only">Connexion à MyAccess</h1>

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
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
        <CardHeader className="text-center pb-6">
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte MyAccess
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

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-bold text-[#14284b]">Adresse email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                // Évolution v2 : Inputs plus grands et arrondis
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
              <Label htmlFor="password" className="text-sm font-bold text-[#14284b]">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all ${errors.password ? "border-destructive focus-visible:border-destructive" : ""}`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
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

            <div className="text-right">
              <button
                type="button"
                className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-md transition-colors"
                onClick={() =>
                  alert("Fonctionnalité de récupération de mot de passe à venir")
                }
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div className="pt-2">
              {/* Évolution v2 : Bouton plein, arrondi, avec ombre */}
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 aria-hidden="true" className="mr-2 h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>

            <div className="text-center text-sm font-medium text-[#556987] pt-2">
              Pas encore de compte ?{" "}
              <Link 
                className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded px-1 transition-colors" 
                href="/signup"
              >
                S'inscrire
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
