import {
  HelpCircle,
  Search,
  Star,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    // Évolution v2 : Fond bleu lumineux, typographie sans-serif et conteneur relatif pour les décorations
    <main
      id="main-content"
      className="min-h-screen bg-[#f4f8ff] font-sans relative overflow-hidden py-12 lg:py-20"
    >
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
          {/* En-tête de la page */}
          <div className="text-center mb-16">
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner"
              aria-hidden="true"
            >
              <HelpCircle className="h-10 w-10" />
            </div>
            <h1 className="mb-4 text-4xl lg:text-5xl font-extrabold text-[#14284b] tracking-tight">
              Centre d'aide
            </h1>
            <p className="text-lg text-[#556987] font-medium max-w-2xl mx-auto">
              Trouvez des réponses à vos questions sur l'utilisation de MyAccess
            </p>
          </div>

          {/* Section 1 : Liens rapides */}
          <section aria-labelledby="quick-links-title" className="mb-16">
            <h2 id="quick-links-title" className="sr-only">
              Raccourcis vers les thématiques d'aide
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 text-center">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e5edff] text-primary"
                    aria-hidden="true"
                  >
                    <Search className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#14284b]">
                    Recherche
                  </h3>
                  <p className="text-sm font-medium text-[#556987]">
                    Comment trouver un centre accessible
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 text-center">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e5edff] text-primary"
                    aria-hidden="true"
                  >
                    <Calendar className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#14284b]">
                    Rendez-vous
                  </h3>
                  <p className="text-sm font-medium text-[#556987]">
                    Prendre et gérer vos rendez-vous
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 text-center">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e5edff] text-primary"
                    aria-hidden="true"
                  >
                    <Star className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#14284b]">
                    Notation
                  </h3>
                  <p className="text-sm font-medium text-[#556987]">
                    Comment fonctionne notre système de notation
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 2 : FAQ */}
          <section aria-labelledby="faq-title" className="mb-12">
            <Card className="bg-white/95 backdrop-blur-sm border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
              <CardHeader className="border-b border-slate-100 pb-6">
                {/* Plus besoin de <h2/p> imbriqué car CardTitle génère un <h2> avec le nouveau card.tsx */}
                <CardTitle id="faq-title">Questions fréquentes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-slate-100">
                    <AccordionTrigger className="text-[#14284b] hover:text-primary font-bold text-base data-[state=open]:text-primary transition-colors">
                      Comment fonctionne la notation des centres ?
                    </AccordionTrigger>
                    <AccordionContent className="text-[#556987] font-medium leading-relaxed pt-2">
                      Chaque centre est noté sur 3 critères principaux :
                      <ul className="list-disc list-inside mt-3 space-y-2 ml-2">
                        <li>
                          <strong className="text-[#14284b]">
                            Accessibilité physique
                          </strong>{" "}
                          : rampes, ascenseurs, parking PMR, toilettes adaptées
                        </li>
                        <li>
                          <strong className="text-[#14284b]">
                            Accessibilité numérique
                          </strong>{" "}
                          : site web accessible, prise de RDV en ligne
                        </li>
                        <li>
                          <strong className="text-[#14284b]">
                            Qualité de l'accueil
                          </strong>{" "}
                          : personnel formé, langue des signes, patience
                        </li>
                      </ul>
                      <p className="mt-4">
                        La note globale est la moyenne de ces 3 critères,
                        calculée à partir des avis de la communauté.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border-slate-100">
                    <AccordionTrigger className="text-[#14284b] hover:text-primary font-bold text-base data-[state=open]:text-primary transition-colors">
                      Comment prendre rendez-vous ?
                    </AccordionTrigger>
                    <AccordionContent className="text-[#556987] font-medium leading-relaxed pt-2">
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>Recherchez un centre via la carte ou la liste</li>
                        <li>
                          Cliquez sur "Voir les détails" pour accéder à la fiche
                          du centre
                        </li>
                        <li>Cliquez sur "Prendre rendez-vous"</li>
                        <li>
                          Sélectionnez le type de rendez-vous (vaccination ou
                          dépistage)
                        </li>
                        <li>Choisissez une date et une heure disponibles</li>
                        <li>Confirmez votre rendez-vous</li>
                      </ol>
                      <p className="mt-4">
                        Vous recevrez un email de confirmation et pourrez
                        obtenir un itinéraire accessible.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border-slate-100">
                    <AccordionTrigger className="text-[#14284b] hover:text-primary font-bold text-base data-[state=open]:text-primary transition-colors">
                      Comment sont vérifiées les informations d'accessibilité ?
                    </AccordionTrigger>
                    <AccordionContent className="text-[#556987] font-medium leading-relaxed pt-2">
                      Les informations d'accessibilité proviennent de plusieurs
                      sources :
                      <ul className="list-disc list-inside mt-3 space-y-2 ml-2">
                        <li>Données officielles des établissements de santé</li>
                        <li>
                          Avis et retours d'expérience de notre communauté
                        </li>
                        <li>Vérifications régulières par notre équipe</li>
                      </ul>
                      <p className="mt-4">
                        Nous encourageons les utilisateurs à signaler toute
                        information incorrecte ou obsolète.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border-slate-100">
                    <AccordionTrigger className="text-[#14284b] hover:text-primary font-bold text-base data-[state=open]:text-primary transition-colors">
                      Puis-je filtrer par type de services ou d'équipements ?
                    </AccordionTrigger>
                    <AccordionContent className="text-[#556987] font-medium leading-relaxed pt-2">
                      Oui ! Vous pouvez filtrer les centres selon divers
                      aménagements :
                      <ul className="list-disc list-inside mt-3 space-y-2 ml-2">
                        <li>Accès plain-pied, Rampe, Ascenseur PMR</li>
                        <li>Soutien LSF, Audio-description, Braille</li>
                        <li>Accueil adapté, Signalétique simplifiée</li>
                        <li>Espace calme, Environnement apaisé</li>
                        <li>Aménagements TSA, Guidage spécifique</li>
                      </ul>
                      <p className="mt-4">
                        Vous pouvez configurer vos besoins dans votre profil
                        pour personnaliser automatiquement vos recherches.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border-slate-100">
                    <AccordionTrigger className="text-[#14284b] hover:text-primary font-bold text-base data-[state=open]:text-primary transition-colors">
                      Comment donner mon avis sur un centre ?
                    </AccordionTrigger>
                    <AccordionContent className="text-[#556987] font-medium leading-relaxed pt-2">
                      Pour publier un avis :
                      <ol className="list-decimal list-inside mt-3 space-y-2 ml-2">
                        <li>Connectez-vous à votre compte</li>
                        <li>Accédez à la fiche détaillée du centre</li>
                        <li>Cliquez sur "Donner mon avis"</li>
                        <li>
                          Notez les 3 critères d'accessibilité (de 1 à 5
                          étoiles)
                        </li>
                        <li>
                          Ajoutez un commentaire détaillé (optionnel mais
                          recommandé)
                        </li>
                        <li>Indiquez le(s) type(s) de handicap concerné(s)</li>
                        <li>Publiez votre avis</li>
                      </ol>
                      <p className="mt-4">
                        Vos retours aident la communauté à faire des choix
                        éclairés !
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6" className="border-slate-100">
                    <AccordionTrigger className="text-[#14284b] hover:text-primary font-bold text-base data-[state=open]:text-primary transition-colors">
                      Comment obtenir un itinéraire accessible ?
                    </AccordionTrigger>
                    <AccordionContent className="text-[#556987] font-medium leading-relaxed pt-2">
                      Après avoir pris rendez-vous ou depuis la fiche d'un
                      centre, cliquez sur &quot;Itinéraire accessible&quot;.
                      Cette fonctionnalité utilise Google Maps en mode transport
                      en commun, qui prend en compte l'accessibilité des
                      stations et arrêts.
                      <p className="mt-4">
                        Vous pouvez également copier l'adresse du centre pour
                        l'utiliser dans votre application de navigation
                        préférée.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="item-7"
                    className="border-slate-100 border-b-0"
                  >
                    <AccordionTrigger className="text-[#14284b] hover:text-primary font-bold text-base data-[state=open]:text-primary transition-colors">
                      Mes données personnelles sont-elles protégées ?
                    </AccordionTrigger>
                    <AccordionContent className="text-[#556987] font-medium leading-relaxed pt-2">
                      Absolument. Nous prenons la protection de vos données très
                      au sérieux :
                      <ul className="list-disc list-inside mt-3 space-y-2 ml-2">
                        <li>Vos données sont stockées de manière sécurisée</li>
                        <li>
                          Nous ne partageons jamais vos informations
                          personnelles
                        </li>
                        <li>
                          Vous pouvez supprimer votre compte à tout moment
                        </li>
                        <li>
                          Conformité RGPD et réglementations sur les données de
                          santé
                        </li>
                      </ul>
                      <p className="mt-4">
                        Consultez notre politique de confidentialité pour plus
                        de détails.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* Section 3 : Contact */}
          <section aria-labelledby="contact-title">
            <Card className="bg-primary text-white shadow-xl shadow-primary/10 border-transparent relative overflow-hidden">
              {/* Effet visuel dans la carte */}
              <div
                className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
                aria-hidden="true"
              />

              <CardHeader className="relative z-10">
                <CardTitle
                  id="contact-title"
                  className="flex items-center gap-3 text-white"
                >
                  <MessageSquare aria-hidden="true" className="h-6 w-6" />
                  Besoin d'aide supplémentaire ?
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 text-white/90">
                <p className="mb-6 font-medium text-md">
                  Notre équipe est là pour vous aider. N'hésitez pas à nous
                  contacter si vous ne trouvez pas la réponse à votre question.
                </p>
                <div className="space-y-3 font-medium bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <p className="flex items-center flex-wrap gap-2">
                    <span className="text-white font-bold">Email :</span>
                    <a
                      href="mailto:support@accessisante.fr"
                      className="text-white font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-1 transition-all"
                    >
                      support@accessisante.fr
                    </a>
                  </p>
                  <p className="flex items-center flex-wrap gap-2">
                    <span className="text-white font-bold">Téléphone :</span>
                    <a
                      href="tel:+33123456789"
                      className="text-white font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-1 transition-all"
                    >
                      01 23 45 67 89
                    </a>
                    <span className=" text-sm ml-2">(Lun-Ven 9h-18h)</span>
                  </p>
                  <p className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
                    <span className="text-white font-bold">
                      Temps de réponse :
                    </span>
                    <strong>Généralement sous 24h</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
