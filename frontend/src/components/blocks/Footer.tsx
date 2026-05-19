"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-slate-50 mt-auto" aria-label="Pied de page">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Section Présentation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt=""
                aria-hidden="true"
                width={512}
                height={512}
                className="w-12 h-12 object-contain"
              />
              <span className="text-xl font-bold text-[#0052cc]">MyAccess</span>
            </div>
            <p className="text-sm text-[#556987] leading-relaxed">
              Votre plateforme de confiance pour trouver des centres de santé accessibles et adaptés à vos besoins.
            </p>
          </div>

          {/* Navigation Principale */}
          <nav aria-label="Navigation du site">
            <h2 className="font-semibold text-[#14284b] mb-4">Explorer</h2>
            <ul className="space-y-3 text-sm text-[#556987]">
              <li><Link href="/" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-1">Accueil</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-1">Trouver un centre</Link></li>
              <li><Link href="/help" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-1">Centre d'aide</Link></li>
              <li><Link href="/sitemap" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-1">Plan du site</Link></li>
            </ul>
          </nav>

          {/* Navigation Légal */}
          <nav aria-label="Informations légales">
            <h2 className="font-semibold text-[#14284b] mb-4">Légal</h2>
            <ul className="space-y-3 text-sm text-[#556987]">
              <li><Link href="/cgu" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-1">CGU</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-1">Politique de confidentialité</Link></li>
              <li><Link href="/legal" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-1">Mentions légales</Link></li>
              <li><Link href="/accessibility" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-1">Accessibilité</Link></li>
            </ul>
          </nav>

          {/* Contact Rapide */}
          <div>
            <h2 className="font-semibold text-[#14284b] mb-4">Contact</h2>
            <ul className="space-y-3 text-sm text-[#556987]">
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded px-1">
                  Page de contact
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@accessisante.fr"
                  className="text-primary font-medium hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
                >
                  support@accessisante.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-[#556987]">
          <p>© {currentYear} MyAccess. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
