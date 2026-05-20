import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";
import { Header } from "../components/blocks/Header";
import { Footer } from "../components/blocks/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AccessibilityWidget } from "@/components/blocks/AccessibilityWidget";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "MyAccess - Centres de santé accessibles",
  description:
    "Trouvez des centres de vaccination et dépistage accessibles près de chez vous",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          strategy="afterInteractive"
        />
      </head>
      <body className={`${jakarta.variable} font-sans`} suppressHydrationWarning>
        <AccessibilityProvider>
          <AuthProvider>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
            <AccessibilityWidget />
          </AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
