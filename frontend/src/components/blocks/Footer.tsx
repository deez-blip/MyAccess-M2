"use client"

import Image from "next/image";
import Link from "next/link";

interface FooterProps {}

export function Footer({ }: FooterProps) {
  return (
    // Le rôle contentinfo est implicite avec <footer>, mais c'est une bonne pratique de s'assurer de sa sémantique
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Section Présentation */}
          <div>
            <div className="flex items-center mb-2">
              <Image
                src="/logo.png"
                alt="" // Alt vide et aria-hidden car le texte "MyAccess" suit immédiatement
                aria-hidden="true"
                width={512}
                height={512}
                className="w-20"
              />
              {/* Remplacement du <h3> par un <span> stylisé pour ne pas casser la hiérarchie des titres */}
              <span className="text-xl font-bold text-primary">MyAccess</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Trouvez des centres de santé accessibles adaptés à vos besoins.
            </p>
          </div>

          {/* Section Navigation */}
          <nav aria-label="Navigation principale du pied de page">
            {/* Utilisation de <h2> pour une structure logique sans saut */}
            <h2 className="mb-4 font-semibold">Navigation</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Recherche de centres
                </Link>
              </li>
              <li>
                <Link 
                  href="/help"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Aide & FAQ
                </Link>
              </li>
            </ul>
          </nav>

          {/* Section Support */}
          <nav aria-label="Liens de support">
            <h2 className="mb-4 font-semibold">Support</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/accessibility"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Accessibilité du site
                </Link>
              </li>
              <li>
                <Link 
                  href="/sitemap"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Plan du site
                </Link>
              </li>
            </ul>
          </nav>

          {/* Section Légal */}
          <nav aria-label="Liens légaux">
            <h2 className="mb-4 font-semibold">Légal</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/legal"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link 
                  href="/cgu"
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  CGU
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MyAccess. Tous droits réservés.</p>
          <p className="mt-2">
            Plateforme dédiée à l'accessibilité des centres de santé pour tous.
          </p>
        </div>
      </div>
    </footer>
  );
}
