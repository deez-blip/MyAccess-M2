import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessibilityStatement() {
  return (
    // 1. Remplacement de <div> par <main> pour définir la zone de contenu principal
    <main id="main-content" className="min-h-[calc(100vh-80px)] bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Centrage et renforcement visuel du H1 */}
          <h1 className="mb-8 text-3xl font-bold text-center">Déclaration d'Accessibilité</h1>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <p>
                MyAccess s'engage à rendre son site web accessible conformément au 
                Référentiel Général d'Amélioration de l'Accessibilité (RGAA).
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            
            {/* 2. Découpage en <section> logiques avec aria-labelledby */}
            <section aria-labelledby="conformite-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {/* 3. Forçage du niveau <h2> pour respecter la hiérarchie h1 -> h2 sans saut */}
                    <h2 id="conformite-title" className="text-xl">État de conformité</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Ce site est en conformité partielle avec le RGAA version 4.1. 
                    Les non-conformités et dérogations sont énumérées ci-dessous.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="accessibles-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 id="accessibles-title" className="text-xl">Fonctionnalités accessibles</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
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
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 id="non-accessibles-title" className="text-xl">Contenus non accessibles</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Certains contenus peuvent ne pas être totalement accessibles pour les raisons suivantes :
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Carte interactive (alternative textuelle fournie)</li>
                    <li>Certains documents PDF téléchargeables</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="contact-title">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 id="contact-title" className="text-xl">Signaler un problème d'accessibilité</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Si vous rencontrez un problème d'accessibilité, contactez-nous à :
                  </p>
                  <p className="mt-2">
                    <strong>Email :</strong>{" "}
                    {/* 4. Transformation du texte en véritable lien d'action (mailto) avec focus visible */}
                    <a 
                      href="mailto:accessibilite@accessisante.fr"
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
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
