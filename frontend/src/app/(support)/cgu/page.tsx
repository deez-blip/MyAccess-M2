import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function CGUPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f4f8ff] font-sans relative overflow-hidden py-12 lg:py-20">
      
      {/* Cercles de décoration en arrière-plan */}
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
              <FileText className="h-10 w-10" />
            </div>
            <h1 className="mb-4 text-4xl lg:text-5xl font-extrabold text-[#14284b] tracking-tight">
              Conditions Générales d'Utilisation
            </h1>
          </div>

          <div className="space-y-8">
            
            <section aria-labelledby="objet-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="objet-title" className="text-xl">1. Objet</h2></CardTitle>
                </CardHeader>
                <CardContent className="text-[#556987] font-medium leading-relaxed">
                  <p>Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir les modalités et conditions dans lesquelles les utilisateurs peuvent accéder et utiliser la plateforme MyAccess.</p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="acces-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="acces-title" className="text-xl">2. Accès au service</h2></CardTitle>
                </CardHeader>
                <CardContent className="text-[#556987] font-medium leading-relaxed">
                  <p>L'accès à MyAccess est gratuit. Certaines fonctionnalités nécessitent la création d'un compte utilisateur pour une expérience personnalisée.</p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="compte-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="compte-title" className="text-xl">3. Compte utilisateur</h2></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#556987] font-medium leading-relaxed">
                  <p>Lors de la création de votre compte, vous vous engagez à :</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Fournir des informations exactes et à jour</li>
                    <li>Maintenir la confidentialité de vos identifiants</li>
                    <li>Ne pas partager votre compte avec des tiers</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="regles-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="regles-title" className="text-xl">4. Utilisation et avis</h2></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#556987] font-medium leading-relaxed">
                  <p>En tant qu'utilisateur, vous vous engagez à :</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Ne pas publier de contenu illégal, diffamatoire ou offensant</li>
                    <li>Publier des avis honnêtes basés sur une expérience réelle</li>
                    <li>Ne pas tenter de manipuler le système de notation</li>
                    <li>Respecter la courtoisie envers les autres utilisateurs et centres</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="propriete-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="propriete-title" className="text-xl">5. Propriété intellectuelle</h2></CardTitle>
                </CardHeader>
                <CardContent className="text-[#556987] font-medium leading-relaxed">
                  <p>Tous les contenus présents sur MyAccess (textes, images, logos, etc.) sont protégés par le droit d'auteur. Toute reproduction non autorisée est strictement interdite.</p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="responsabilite-title">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <CardHeader>
                  <CardTitle><h2 id="responsabilite-title" className="text-xl">6. Responsabilité</h2></CardTitle>
                </CardHeader>
                <CardContent className="text-[#556987] font-medium leading-relaxed">
                  <p>MyAccess ne peut être tenu responsable des informations fournies par les centres de santé ou du contenu des avis publiés par les utilisateurs. Nous recommandons toujours de vérifier les informations directement auprès des établissements concernés.</p>
                </CardContent>
              </Card>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
