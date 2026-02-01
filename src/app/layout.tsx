import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from '@next/third-parties/google';
import { CookieConsentBanner } from '@/components/cookie-consent';

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: '%s | Fleuris',
    default: 'Fleuris - Bouquets & Compositions Florales Uniques',
  },
  description: "Découvrez Fleuris, votre artisan fleuriste en ligne. Bouquets poétiques, fleurs fraîches et livraison soignée pour toutes les occasions (Mariage, Deuil, Amour).",
  keywords: ["fleuriste", "bouquet", "fleurs", "livraison fleurs", "mariage", "deuil", "artisan fleuriste"],
  authors: [{ name: "Fleuris" }],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://fleuris.store',
    siteName: 'Fleuris',
    title: 'Fleuris - Bouquets & Compositions Florales',
    description: 'L’émotion des fleurs, la simplicité du service.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Fleuris',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased`}
      >
        <CartProvider>
          {children}
          <Footer />
        </CartProvider>

        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}

        {/* Cookie Consent Banner */}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
