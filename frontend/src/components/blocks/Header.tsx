"use client"

import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Center } from '@/types';
import { useEffect, useState } from 'react';
import { getCenter, getNotifications } from '@/lib/mockData';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

type Page = 
  | 'home' 
  | 'login' 
  | 'signup' 
  | 'dashboard' 
  | 'center' 
  | 'booking' 
  | 'profile' 
  | 'appointments' 
  | 'notifications' 
  | 'my-reviews'
  | 'help'
  | 'legal'
  | 'privacy'
  | 'cgu'
  | 'accessibility'
  | 'contact'
  | 'sitemap';

interface HeaderProps {}

export function Header({ }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter(); // Remplacement de window.location par le router de Next.js
  
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Update unread notifications count
  useEffect(() => {
    if (user) {
      const notifications = getNotifications(user.id);
      const unread = notifications.filter(n => !n.read).length;
      setUnreadNotifications(unread);
    }
  }, [user, currentPage]);

  // Load center when needed
  useEffect(() => {
    if (selectedCenterId && (currentPage === 'center' || currentPage === 'booking')) {
      const center = getCenter(selectedCenterId);
      if (center) {
        setSelectedCenter(center);
      }
    }
  }, [selectedCenterId, currentPage]);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      {/* Lien d'évitement rendu visible uniquement au focus (Tabulation) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only px-6 h-10 bg-primary text-primary-foreground rounded-md focus:absolute focus:top-4 focus:left-4 z-[100] flex items-center justify-center"
      >
        Aller au contenu principal
      </a>

      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          
          {/* Logo - Nettoyé pour ne pas faire bégayer les lecteurs d'écran */}
          <Link href={"/"} className="flex items-center gap-2" aria-label="Retour à l'accueil">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground" aria-hidden="true">
              <Image
                src={"/logo.png"}
                alt="" // L'attribut alt est vide car le lien possède déjà un aria-label complet
                width={512}
                height={512}
              />
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.7"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex flex-col items-start" aria-hidden="true">
              <span className="tracking-tight text-primary">MyAccess</span>
              <span className="text-xs text-muted-foreground">Centres accessibles</span>
            </div>
          </Link>

          {user && (
            // Menu de navigation étiqueté pour l'accessibilité
            <nav className="hidden md:flex gap-6" aria-label="Navigation principale">
              <Link 
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Centres
              </Link>
              <Link 
                href="/help"
                className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Aide
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Utilisation de asChild pour lier le design de shadcn avec la navigation propre de Next.js */}
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link href="/notifications" aria-label="Voir les notifications">
                  <Bell aria-hidden="true" className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      variant="destructive"
                      aria-label={`${unreadNotifications} notifications non lues`}
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Ouvrir le menu utilisateur">
                    <User aria-hidden="true" className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {/* Remplacement de window.location par router.push() */}
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User aria-hidden="true" className="mr-2 h-4 w-4" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/my-reviews')}>
                    <Star aria-hidden="true" className="mr-2 h-4 w-4" />
                    Mes avis
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              {/* Le code lourd des balises <a> est remplacé par les composants propres */}
              <Button asChild variant="outline">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">S'inscrire</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
