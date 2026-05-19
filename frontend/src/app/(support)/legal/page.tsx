import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalPage() {
  return (
    // 1. Définition de la zone de contenu principal avec <main> et ID pour le lien d'évitement
    <main id="main-content" className="min-h-[calc(100vh-80px)] bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Titre principal centré et mis en valeur */}
          <h1 className="mb-8 text-3xl font-bold text-center">Mentions Légales</h1>

          <div className="space-y-6">
            
            {/* 2. Regroupement logique avec <section> et aria-labelledby */}
            <section aria-labelledby="editeur-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {/* 3. Forçage du H2 pour respecter la hiérarchie stricte h1 -> h2 */}
                    <h2 id="editeur-title" className="text-xl">Éditeur du site</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nom :</strong> MyAccess SAS</p>
                  
                  {/* 4. Utilisation de la balise sémantique <address> (not-italic car le navigateur la met en italique par défaut) */}
                  <address className="not-italic">
                    <strong>Adresse :</strong> 123 Avenue de la République, 75011 Paris
                  </address>
                  
                  <p><strong>SIRET :</strong> 123 456 789 00012</p>
                  <p>
                    <strong>Email :</strong>{" "}
                    {/* 5. Liens d'action cliquables avec gestion du focus visible */}
                    <a 
                      href="mailto:contact@accessisante.fr"
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      contact@accessisante.fr
                    </a>
                  </p>
                  <p>
                    <strong>Téléphone :</strong>{" "}
                    <a 
                      href="tel:+33123456789"
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      01 23 45 67 89
                    </a>
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="hebergement-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 id="hebergement-title" className="text-xl">Hébergement</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Hébergeur :</strong> OVH</p>
                  <address className="not-italic">
                    <strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France
                  </address>
                  <p>
                    <strong>Téléphone :</strong>{" "}
                    <a 
                      href="tel:1007"
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      1007
                    </a>
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="directeur-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 id="directeur-title" className="text-xl">Directeur de publication</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
