import { HelpCircle, Search, Star, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function HelpPage() {
  return (
    // Remplacement de <div> par <main> pour la sémantique
    <main id="main-content" className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle aria-hidden="true" className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="mb-4 text-3xl font-bold">Centre d'aide</h1>
            <p className="text-muted-foreground">
              Trouvez des réponses à vos questions sur l'utilisation de MyAccess
            </p>
          </div>

          {/* Section 1 : Liens rapides */}
          <section aria-labelledby="quick-links-title" className="mb-12">
            {/* Titre h2 masqué visuellement pour respecter la hiérarchie h1 -> h2 -> h3 */}
            <h2 id="quick-links-title" className="sr-only">Raccourcis vers les thématiques d'aide</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Search aria-hidden="true" className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="mb-2 font-semibold">Recherche</h3>
                  <p className="text-sm text-muted-foreground">
                    Comment trouver un centre accessible
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar aria-hidden="true" className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="mb-2 font-semibold">Rendez-vous</h3>
                  <p className="text-sm text-muted-foreground">
                    Prendre et gérer vos rendez-vous
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Star aria-hidden="true" className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="mb-2 font-semibold">Notation</h3>
                  <p className="text-sm text-muted-foreground">
                    Comment fonctionne notre système de notation
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 2 : FAQ */}
          <section aria-labelledby="faq-title">
            <Card>
              <CardHeader>
                {/* Intégration sémantique d'un h2 dans le CardTitle */}
                <CardTitle>
                  <p id="faq-title" className="text-xl">Questions fréquentes</p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      Comment fonctionne la notation des centres ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Chaque centre est noté sur 3 critères principaux :
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Accessibilité physique</strong> : rampes, ascenseurs, parking PMR, toilettes adaptées</li>
                        <li><strong>Accessibilité numérique</strong> : site web accessible, prise de RDV en ligne</li>
                        <li><strong>Qualité de l'accueil</strong> : personnel formé, langue des signes, patience</li>
                      </ul>
                      <p className="mt-2">
                        La note globale est la moyenne de ces 3 critères, calculée à partir des avis de la communauté.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      Comment prendre rendez-vous ?
                    </AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Recherchez un centre via la carte ou la liste</li>
                        <li>Cliquez sur "Voir les détails" pour accéder à la fiche du centre</li>
                        <li>Cliquez sur "Prendre rendez-vous"</li>
                        <li>Sélectionnez le type de rendez-vous (vaccination ou dépistage)</li>
                        <li>Choisissez une date et une heure disponibles</li>
                        <li>Confirmez votre rendez-vous</li>
                      </ol>
                      <p className="mt-2">
                        Vous recevrez un email de confirmation et pourrez obtenir un itinéraire accessible.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      Comment sont vérifiées les informations d'accessibilité ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Les informations d'accessibilité proviennent de plusieurs sources :
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Données officielles des établissements de santé</li>
                        <li>Avis et retours d'expérience de notre communauté</li>
                        <li>Vérifications régulières par notre équipe</li>
                      </ul>
                      <p className="mt-2">
                        Nous encourageons les utilisateurs à signaler toute information incorrecte ou obsolète.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>
                      Puis-je filtrer par type de handicap ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Oui ! Vous pouvez filtrer les centres selon 5 types de handicap :
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Handicaps moteurs (fauteuil roulant, mobilité réduite)</li>
                        <li>Handicaps sensoriels (vue, audition)</li>
                        <li>Handicaps mentaux</li>
                        <li>Handicaps psychiques</li>
                        <li>Handicaps cognitifs</li>
                      </ul>
                      <p className="mt-2">
                        Vous pouvez configurer vos besoins dans votre profil pour personnaliser automatiquement vos recherches.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>
                      Comment donner mon avis sur un centre ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Pour publier un avis :
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Connectez-vous à votre compte</li>
                        <li>Accédez à la fiche détaillée du centre</li>
                        <li>Cliquez sur "Donner mon avis"</li>
                        <li>Notez les 3 critères d'accessibilité (de 1 à 5 étoiles)</li>
                        <li>Ajoutez un commentaire détaillé (optionnel mais recommandé)</li>
                        <li>Indiquez le(s) type(s) de handicap concerné(s)</li>
                        <li>Publiez votre avis</li>
                      </ol>
                      <p className="mt-2">
                        Vos retours aident la communauté à faire des choix éclairés !
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>
                      Comment obtenir un itinéraire accessible ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Après avoir pris rendez-vous ou depuis la fiche d'un centre, cliquez sur 
                      &quot;Itinéraire accessible&quot;. Cette fonctionnalité utilise Google Maps en mode 
                      transport en commun, qui prend en compte l'accessibilité des stations et arrêts.
                      <p className="mt-2">
                        Vous pouvez également copier l'adresse du centre pour l'utiliser dans votre 
                        application de navigation préférée.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>
                      Mes données personnelles sont-elles protégées ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Absolument. Nous prenons la protection de vos données très au sérieux :
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Vos données sont stockées de manière sécurisée</li>
                        <li>Nous ne partageons jamais vos informations personnelles</li>
                        <li>Vous pouvez supprimer votre compte à tout moment</li>
                        <li>Conformité RGPD et réglementations sur les données de santé</li>
                      </ul>
                      <p className="mt-2">
                        Consultez notre politique de confidentialité pour plus de détails.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* Section 3 : Contact */}
          <section aria-labelledby="contact-title" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare aria-hidden="true" className="h-5 w-5" />
                  <p id="contact-title" className="text-xl">Besoin d'aide supplémentaire ?</p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Notre équipe est là pour vous aider. N'hésitez pas à nous contacter si vous 
                  ne trouvez pas la réponse à votre question.
                </p>
                <div className="space-y-2 text-sm">
                  {/* Utilisation de véritables liens mailto et tel pour l'accessibilité */}
                  <p>
                    <strong>Email :</strong>{' '}
                    <a href="mailto:support@accessisante.fr" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
                      support@accessisante.fr
                    </a>
                  </p>
                  <p>
                    <strong>Téléphone :</strong>{' '}
                    <a href="tel:+33123456789" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
                      01 23 45 67 89
                    </a>{' '}
                    <span className="text-muted-foreground">(Lun-Ven 9h-18h)</span>
                  </p>
                  <p><strong>Temps de réponse :</strong> Généralement sous 24h</p>
                </div>
              </CardContent>
            </Card>
          </section>
          
        </div>
      </div>
    </main>
  );
}
