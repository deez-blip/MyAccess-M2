import { Card, CardContent } from "@/components/ui/card";
import { LifeBuoy, Handshake, Newspaper, MapPin, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    // Évolution v2 : Fond bleu lumineux, typographie sans-serif et conteneur relatif pour les décorations
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
        <div className="max-w-3xl mx-auto">
          
          {/* En-tête de la page mis en valeur */}
          <div className="text-center mb-16">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner" aria-hidden="true">
              <Mail className="h-10 w-10" />
            </div>
            <h1 className="mb-4 text-4xl lg:text-5xl font-extrabold text-[#14284b] tracking-tight">
              Contactez-nous
            </h1>
            <p className="text-lg text-[#556987] font-medium max-w-2xl mx-auto">
              Notre équipe est à votre disposition pour vous accompagner et répondre à toutes vos questions.
            </p>
          </div>

          {/* Carte principale de contact */}
          <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
            <CardContent className="p-8 md:p-12 space-y-12">
              
              {/* Section Support Technique */}
              <section aria-labelledby="support-title" className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e5edff] text-primary group-hover:scale-105 transition-transform" aria-hidden="true">
                    <LifeBuoy className="h-7 w-7" />
                  </div>
                  <h2 id="support-title" className="text-2xl font-bold text-[#14284b]">Support technique</h2>
                </div>
                <div className="md:ml-[4.5rem]">
                  <p className="text-[#556987] font-medium mb-4 text-lg">
                    Pour toute question ou problème technique sur la plateforme.
                  </p>
                  <div className="space-y-3 font-medium text-[#14284b] bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-[#556987]">Email :</span>
                      {/* Transformation en véritable lien cliquable accessible */}
                      <a 
                        href="mailto:support@accessisante.fr" 
                        className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded transition-all"
                      >
                        support@accessisante.fr
                      </a>
                    </p>
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-[#556987]">Téléphone :</span>
                      {/* Transformation en lien téléphonique accessible */}
                      <a 
                        href="tel:+33123456789" 
                        className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded transition-all"
                      >
                        01 23 45 67 89
                      </a>
                      <span className="text-sm text-[#556987] ml-1">(Lun-Ven 9h-18h)</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Séparateur visuel */}
              <div className="h-px w-full bg-slate-100" aria-hidden="true" />

              {/* Section Partenariats */}
              <section aria-labelledby="partners-title" className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e5edff] text-primary group-hover:scale-105 transition-transform" aria-hidden="true">
                    <Handshake className="h-7 w-7" />
                  </div>
                  <h2 id="partners-title" className="text-2xl font-bold text-[#14284b]">Partenariats</h2>
                </div>
                <div className="md:ml-[4.5rem]">
                  <p className="text-[#556987] font-medium mb-3 text-lg">
                    Vous êtes un centre de santé ou une organisation ?
                  </p>
                  <p className="font-medium text-[#14284b]">
                    <span className="text-[#556987] mr-2">Email :</span>
                    <a 
                      href="mailto:partenariats@accessisante.fr" 
                      className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded transition-all"
                    >
                      partenariats@accessisante.fr
                    </a>
                  </p>
                </div>
              </section>

              {/* Séparateur visuel */}
              <div className="h-px w-full bg-slate-100" aria-hidden="true" />

              {/* Section Presse */}
              <section aria-labelledby="press-title" className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e5edff] text-primary group-hover:scale-105 transition-transform" aria-hidden="true">
                    <Newspaper className="h-7 w-7" />
                  </div>
                  <h2 id="press-title" className="text-2xl font-bold text-[#14284b]">Presse</h2>
                </div>
                <div className="md:ml-[4.5rem]">
                  <p className="text-[#556987] font-medium mb-3 text-lg">
                    Demandes média et relations presse.
                  </p>
                  <p className="font-medium text-[#14284b]">
                    <span className="text-[#556987] mr-2">Email :</span>
                    <a 
                      href="mailto:presse@accessisante.fr" 
                      className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded transition-all"
                    >
                      presse@accessisante.fr
                    </a>
                  </p>
                </div>
              </section>

              {/* Séparateur visuel */}
              <div className="h-px w-full bg-slate-100" aria-hidden="true" />

              {/* Section Adresse */}
              <section aria-labelledby="address-title" className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e5edff] text-primary group-hover:scale-105 transition-transform" aria-hidden="true">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <h2 id="address-title" className="text-2xl font-bold text-[#14284b]">Adresse postale</h2>
                </div>
                <div className="md:ml-[4.5rem]">
                  {/* Utilisation de la balise sémantique address */}
                  <address className="not-italic text-[#556987] font-medium text-lg leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100 inline-block w-full sm:w-auto">
                    <span className="text-[#14284b] font-bold block mb-1">MyAccess SAS</span>
                    123 Avenue de la République<br />
                    75011 Paris<br />
                    France
                  </address>
                </div>
              </section>

            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
