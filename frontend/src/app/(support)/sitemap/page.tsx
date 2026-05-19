import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";

export default function SitemapPage() {
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
              <Map className="h-10 w-10" />
            </div>
            <h1 className="mb-4 text-4xl lg:text-5xl font-extrabold text-[#14284b] tracking-tight">
              Plan du site
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            <section aria-labelledby="public-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="public-title" className="text-xl">Pages publiques</h2></CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 font-medium text-[#556987]">
                    <li>
                      <Link href="/" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Accueil</Link>
                    </li>
                    <li>
                      <Link href="/login" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Connexion</Link>
                    </li>
                    <li>
                      <Link href="/signup" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Inscription</Link>
                    </li>
                    <li>
                      <Link href="/dashboard" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Recherche de centres</Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="user-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="user-title" className="text-xl">Espace utilisateur</h2></CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 font-medium text-[#556987]">
                    <li>
                      <Link href="/profile" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Mon profil</Link>
                    </li>
                    <li>
                      <Link href="/appointments" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Mes rendez-vous</Link>
                    </li>
                    <li>
                      <Link href="/my-reviews" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Mes avis</Link>
                    </li>
                    <li>
                      <Link href="/notifications" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Notifications</Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="centers-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="centers-title" className="text-xl">Centres</h2></CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 font-medium text-[#556987]">
                    <li>
                      <Link href="/dashboard" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Recherche et carte</Link>
                    </li>
                    <li>
                      <Link href="/dashboard" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Fiche détaillée</Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="legal-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="legal-title" className="text-xl">Support & Légal</h2></CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 font-medium text-[#556987]">
                    <li>
                      <Link href="/help" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Aide & FAQ</Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Contact</Link>
                    </li>
                    <li>
                      <Link href="/legal" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Mentions légales</Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Politique de confidentialité</Link>
                    </li>
                    <li>
                      <Link href="/cgu" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">CGU</Link>
                    </li>
                    <li>
                      <Link href="/accessibility" className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1 transition-all">Accessibilité du site</Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
