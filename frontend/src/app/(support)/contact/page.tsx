import { Card, CardContent } from "@/components/ui/card";
import { LifeBuoy, Handshake, Newspaper, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    // Utilisation de <main> et ajustement de la hauteur pour éviter les conflits avec le header
    <main id="main-content" className="min-h-[calc(100vh-80px)] bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="mb-8 text-3xl font-bold text-center">Contact</h1>

          <Card>
            <CardContent className="pt-8 space-y-8">
              
              {/* Section Support Technique */}
              <section aria-labelledby="support-title">
                <div className="flex items-center gap-2 mb-2">
                  <LifeBuoy aria-hidden="true" className="h-5 w-5 text-primary" />
                  {/* Correction de la hiérarchie h1 -> h2 */}
                  <h2 id="support-title" className="text-xl font-semibold">Support technique</h2>
                </div>
                <p className="text-muted-foreground mb-3">
                  Pour toute question ou problème technique
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email :</strong>{" "}
                    {/* Transformation en véritable lien cliquable */}
                    <a 
                      href="mailto:support@accessisante.fr" 
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      support@accessisante.fr
                    </a>
                  </p>
                  <p>
                    <strong>Téléphone :</strong>{" "}
                    {/* Transformation en lien téléphonique */}
                    <a 
                      href="tel:+33123456789" 
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      01 23 45 67 89
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">Lun-Ven 9h-18h</p>
                </div>
              </section>

              {/* Section Partenariats */}
              <section aria-labelledby="partners-title">
                <div className="flex items-center gap-2 mb-2">
                  <Handshake aria-hidden="true" className="h-5 w-5 text-primary" />
                  <h2 id="partners-title" className="text-xl font-semibold">Partenariats</h2>
                </div>
                <p className="text-muted-foreground mb-3">
                  Vous êtes un centre de santé ou une organisation ?
                </p>
                <p>
                  <strong>Email :</strong>{" "}
                  <a 
                    href="mailto:partenariats@accessisante.fr" 
                    className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    partenariats@accessisante.fr
                  </a>
                </p>
              </section>

              {/* Section Presse */}
              <section aria-labelledby="press-title">
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper aria-hidden="true" className="h-5 w-5 text-primary" />
                  <h2 id="press-title" className="text-xl font-semibold">Presse</h2>
                </div>
                <p className="text-muted-foreground mb-3">
                  Demandes média et presse
                </p>
                <p>
                  <strong>Email :</strong>{" "}
                  <a 
                    href="mailto:presse@accessisante.fr" 
                    className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    presse@accessisante.fr
                  </a>
                </p>
              </section>

              {/* Section Adresse */}
              <section aria-labelledby="address-title">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin aria-hidden="true" className="h-5 w-5 text-primary" />
                  <h2 id="address-title" className="text-xl font-semibold">Adresse postale</h2>
                </div>
                {/* Utilisation de la balise sémantique address */}
                <address className="not-italic text-muted-foreground">
                  <p className="text-foreground font-medium">MyAccess SAS</p>
                  <p>123 Avenue de la République</p>
                  <p>75011 Paris</p>
                  <p>France</p>
                </address>
              </section>

            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
