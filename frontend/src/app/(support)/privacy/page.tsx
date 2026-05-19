import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    // 1. Définition de la zone de contenu principal avec <main>
    <main id="main-content" className="min-h-[calc(100vh-80px)] bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-8 text-3xl font-bold text-center">Politique de Confidentialité</h1>

          <div className="space-y-6">
            
            {/* 2. Groupement logique avec <section> et aria-labelledby */}
            <section aria-labelledby="collecte-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {/* 3. Forçage du niveau h2 pour respecter la hiérarchie h1 -> h2 */}
                    <h2 id="collecte-title" className="text-xl">Collecte des données</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    MyAccess collecte les données personnelles suivantes :
                  </p>
                  <ul className="list-disc list-inside space-y-1">
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
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 id="utilisation-title" className="text-xl">Utilisation des données</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Vos données sont utilisées pour :</p>
                  <ul className="list-disc list-inside space-y-1">
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
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 id="protection-title" className="text-xl">Protection des données</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Nous mettons en œuvre toutes les mesures techniques et organisationnelles 
                    appropriées pour protéger vos données contre tout accès, modification, 
                    divulgation ou destruction non autorisés.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="droits-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 id="droits-title" className="text-xl">Vos droits</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Droit d'accès à vos données</li>
                    <li>Droit de rectification</li>
                    <li>Droit à l'effacement</li>
                    <li>Droit à la limitation du traitement</li>
                    <li>Droit à la portabilité</li>
                    <li>Droit d'opposition</li>
                  </ul>
                  <p className="mt-4">
                    Pour exercer ces droits, contactez-nous à :{" "}
                    {/* 4. Lien cliquable (mailto) avec focus visible */}
                    <a 
                      href="mailto:privacy@accessisante.fr"
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
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
