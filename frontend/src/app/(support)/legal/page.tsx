import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function LegalPage() {
  return (
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
              <Scale className="h-10 w-10" />
            </div>
            <h1 className="mb-4 text-4xl lg:text-5xl font-extrabold text-[#14284b] tracking-tight">
              Mentions Légales
            </h1>
          </div>

          <div className="space-y-8">
            
            <section aria-labelledby="editeur-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="editeur-title" className="text-xl">Éditeur du site</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#556987] font-medium">
                  <p><strong>Nom :</strong> MyAccess SAS</p>
                  <address className="not-italic">
                    <strong>Adresse :</strong> 123 Avenue de la République, 75011 Paris
                  </address>
                  <p><strong>SIRET :</strong> 123 456 789 00012</p>
                  <p>
                    <strong>Email :</strong>{" "}
                    <a 
                      href="mailto:contact@accessisante.fr"
                      className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all"
                    >
                      contact@accessisante.fr
                    </a>
                  </p>
                  <p>
                    <strong>Téléphone :</strong>{" "}
                    <a 
                      href="tel:+33123456789"
                      className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all"
                    >
                      01 23 45 67 89
                    </a>
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="hebergement-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="hebergement-title" className="text-xl">Hébergement</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#556987] font-medium">
                  <p><strong>Hébergeur :</strong> OVH</p>
                  <address className="not-italic">
                    <strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France
                  </address>
                  <p>
                    <strong>Téléphone :</strong>{" "}
                    <a 
                      href="tel:1007"
                      className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all"
                    >
                      1007
                    </a>
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="directeur-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle>
                    <h2 id="directeur-title" className="text-xl">Directeur de publication</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#556987] font-medium">
                  <p>M. Jean Dupont, Président</p>
                </CardContent>
              </Card>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
