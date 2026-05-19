import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CGUPage() {
  return (
    // 1. Définition de la zone principale pour les lecteurs d'écran
    <main id="main-content" className="min-h-[calc(100vh-80px)] bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Titre principal mis en valeur */}
          <h1 className="mb-8 text-3xl font-bold text-center">Conditions Générales d'Utilisation</h1>

          <div className="space-y-6">
            
            {/* 2. Regroupement logique avec <section> et aria-labelledby */}
            <section aria-labelledby="objet-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {/* 3. Forçage du niveau h2 pour respecter la hiérarchie h1 -> h2 */}
                    <p id="objet-title" className="text-xl">1. Objet</p>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir 
                    les modalités et conditions dans lesquelles les utilisateurs peuvent accéder et 
                    utiliser la plateforme MyAccess.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="acces-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <p id="acces-title" className="text-xl">2. Accès au service</p>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    L'accès à MyAccess est gratuit. Certaines fonctionnalités nécessitent la 
                    création d'un compte utilisateur.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="compte-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <p id="compte-title" className="text-xl">3. Compte utilisateur</p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Pour créer un compte, vous devez fournir des informations exactes et à jour. 
                    Vous êtes responsable de la confidentialité de vos identifiants.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="utilisation-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <p id="utilisation-title" className="text-xl">4. Utilisation du service</p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Vous vous engagez à :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ne pas publier de contenu illégal, diffamatoire ou offensant</li>
                    <li>Publier des avis honnêtes et basés sur votre expérience réelle</li>
                    <li>Ne pas tenter de manipuler les notes des centres</li>
                    <li>Respecter les autres utilisateurs</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="propriete-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <p id="propriete-title" className="text-xl">5. Propriété intellectuelle</p>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Tous les contenus présents sur MyAccess (textes, images, logos, etc.) sont 
                    protégés par le droit d'auteur. Toute reproduction non autorisée est interdite.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="responsabilite-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <p id="responsabilite-title" className="text-xl">6. Responsabilité</p>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    MyAccess ne peut être tenu responsable des informations fournies par les 
                    centres de santé ou des avis publiés par les utilisateurs. Nous vous recommandons 
                    de vérifier les informations directement auprès des établissements.
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
