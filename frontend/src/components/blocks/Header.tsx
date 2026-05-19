"use client";

import { User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Center, User as UserType } from "@/types";
import { useEffect, useState } from "react";
import { getCenter, getCurrentUser, setCurrentUser } from "@/lib/mockData";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type Page =
  | "home"
  | "login"
  | "signup"
  | "dashboard"
  | "center"
  | "booking"
  | "profile"
  | "appointments"
  | "notifications"
  | "my-reviews"
  | "help"
  | "legal"
  | "privacy"
  | "cgu"
  | "accessibility"
  | "contact"
  | "sitemap";

interface HeaderProps {}

export function Header({}: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  const isHome = pathname === "/";

  // Load user on mount
  /*useEffect(() => {
      const savedUser = getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
        setCurrentPage('dashboard');
      }
    }, []);*/

  // Load center when needed
  useEffect(() => {
    if (
      selectedCenterId &&
      (currentPage === "center" || currentPage === "booking")
    ) {
      const center = getCenter(selectedCenterId);
      if (center) {
        setSelectedCenter(center);
      }
    }
  }, [selectedCenterId, currentPage]);

  const handleNavigate = (page: string, centerId?: string) => {
    if (centerId) {
      setSelectedCenterId(centerId);
    }
    setCurrentPage(page as Page);
    window.scrollTo(0, 0);
  };

  /*const handleLogin = () => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setCurrentPage('dashboard');
    }
  };*/

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className={`${isHome ? "absolute bg-transparent" : "sticky bg-white border-b border-slate-100 shadow-sm"} w-full top-0 z-50 transition-all`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only px-6 h-10 bg-primary text-primary-foreground rounded-md focus:absolute focus:top-4 focus:left-4"
      >
        Aller au contenu principal
      </a>
      <div className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link
            href={"/"}
            className="flex items-center gap-2"
            aria-label="Retour à l'acceuil"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground">
              <Image
                src={"/logo.png"}
                alt="Logo MyAccess"
                width={512}
                height={512}
              />
              <span className="sr-only">Logo</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="currentColor"
                  opacity="0.7"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="tracking-tight text-primary font-bold">
                MyAccess
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                Centres accessibles
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors font-sans"
            >
              Trouver un centre
            </Link>
            <Link
              href="/help"
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors font-sans"
            >
              Santé de A à Z
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white shadow-sm ring-1 ring-black/5"
                  aria-label="Paramètres utilisateurs"
                >
                  <User className="h-5 w-5 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 font-sans">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-bold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/my-reviews")}
                  className="cursor-pointer"
                >
                  Mes avis
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm font-bold text-foreground hover:text-primary transition-colors font-sans"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center font-sans justify-center rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-lg shadow-primary/30 h-11 px-6 transition-all"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
