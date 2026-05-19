import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    // Évolution v2 : Fond bleu lumineux et conteneur relatif pour les décors
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
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="mb-4 text-4xl lg:text-5xl font-extrabold text-[#14284b] tracking-tight">
              Politique de Confidentialité
            </h1>
          </div>

          <div className="space-y-8">
            
            <section aria-labelledby="collecte-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="collecte-title" className="text-xl">Collecte des données</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#556987] font-medium leading-relaxed">
                  <p>MyAccess collecte les données personnelles suivantes :</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Préférences d'accessibilité (types de handicap)</li>
                    <li>Historique des rendez-vous</li>
                    <li>Avis et commentaires publiés</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="utilisation-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="utilisation-title" className="text-xl">Utilisation des données</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#556987] font-medium leading-relaxed">
                  <p>Vos données sont utilisées pour :</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Gérer votre compte utilisateur</li>
                    <li>Personnaliser vos résultats de recherche</li>
                    <li>Gérer vos rendez-vous</li>
                    <li>Publier vos avis (de manière anonyme ou avec votre nom)</li>
                    <li>Vous envoyer des notifications importantes</li>
                    <li>Améliorer nos services</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="protection-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="protection-title" className="text-xl">Protection des données</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#556987] font-medium leading-relaxed">
                  <p>
                    Nous mettons en œuvre toutes les mesures techniques et organisationnelles 
                    appropriées pour protéger vos données contre tout accès, modification, 
                    divulgation ou destruction non autorisés.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="droits-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="droits-title" className="text-xl">Vos droits</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#556987] font-medium leading-relaxed">
                  <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Droit d'accès à vos données</li>
                    <li>Droit de rectification</li>
                    <li>Droit à l'effacement</li>
                    <li>Droit à la limitation du traitement</li>
                    <li>Droit à la portabilité</li>
                    <li>Droit d'opposition</li>
                  </ul>
                  <p className="mt-6 pt-4 border-t border-slate-100">
                    Pour exercer ces droits, contactez-nous à :{" "}
                    <a 
                      href="mailto:privacy@accessisante.fr"
                      className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all"
                    >
                      privacy@accessisante.fr
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
