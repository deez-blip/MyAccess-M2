import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accessibility } from "lucide-react";

export default function AccessibilityStatement() {
  return (
    // Évolution v2 : Fond bleu lumineux, police sans-serif et conteneur relatif pour les décors
    <main id="main-content" className="min-h-screen bg-[#f4f8ff] font-sans relative overflow-hidden py-12 lg:py-20">
      
      {/* Cercles de décoration en arrière-plan (masqués pour l'accessibilité) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] pointer-events-none select-none z-0 opacity-60"
        aria-hidden="true"
      >
        <div className="absolute inset-0 border border-blue-200/40 rounded-full animate-[spin_240s_linear_infinite]" />
        <div className="absolute inset-12 border border-dashed border-blue-200/50 rounded-full animate-[spin_180s_linear_infinite]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner" aria-hidden="true">
              <Accessibility className="h-10 w-10" />
            </div>
            <h1 className="mb-4 text-4xl lg:text-5xl font-extrabold text-[#14284b] tracking-tight">
              Déclaration d'Accessibilité
            </h1>
          </div>

          <div className="space-y-8">
            
            <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
              <CardContent className="pt-6 text-[#556987] font-medium leading-relaxed">
                <p>
                  MyAccess s'engage à rendre son site web accessible conformément au 
                  Référentiel Général d'Amélioration de l'Accessibilité (RGAA).
                </p>
              </CardContent>
            </Card>

            <section aria-labelledby="conformite-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="conformite-title" className="text-xl">État de conformité</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#556987] font-medium leading-relaxed">
                  <p>
                    Ce site est en conformité partielle avec le RGAA version 4.1. 
                    Les non-conformités et dérogations sont énumérées ci-dessous.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="accessibles-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="accessibles-title" className="text-xl">Fonctionnalités accessibles</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-[#556987] font-medium">
                    <li>Navigation au clavier</li>
                    <li>Contrastes de couleurs conformes</li>
                    <li>Structure sémantique claire</li>
                    <li>Alternatives textuelles pour les images</li>
                    <li>Formulaires étiquetés correctement</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="non-accessibles-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="non-accessibles-title" className="text-xl">Contenus non accessibles</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#556987] font-medium leading-relaxed">
                  <p>
                    Certains contenus peuvent ne pas être totalement accessibles pour les raisons suivantes :
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Carte interactive (alternative textuelle fournie)</li>
                    <li>Certains documents PDF téléchargeables</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="contact-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="contact-title" className="text-xl">Signaler un problème d'accessibilité</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#556987] font-medium leading-relaxed">
                  <p>
                    Si vous rencontrez un problème d'accessibilité, contactez-nous à :
                  </p>
                  <p className="mt-2">
                    <strong>Email :</strong>{" "}
                    <a 
                      href="mailto:accessibilite@accessisante.fr"
                      className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all"
                    >
                      accessibilite@accessisante.fr
                    </a>
                  </p>
                </CardContent>
              </Card>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
