import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CinematicIntro } from "@/components/intro/CinematicIntro";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { ComparisonTray } from "@/components/comparison/ComparisonTray";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LocationProvider } from "@/context/LocationContext";
import { LocationSelectorModal } from "@/components/location/LocationSelectorModal";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#09090B",
};

export const metadata: Metadata = {
  title: "BookMyStudio — World-Class Studios & Soundstages for Your Next Shoot",
  description:
    "Instant booking for commercial cycloramas, soundproof stages, natural daylight lofts, and vetted crew across global production hubs.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BookMyStudio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('bms_theme');var d=document.documentElement;var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=s?s==='dark':prefersDark;if(isDark){d.classList.add('dark');d.setAttribute('data-theme','dark');d.style.colorScheme='dark';}else{d.classList.remove('dark');d.setAttribute('data-theme','light');d.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-page)] text-[var(--text-primary)] selection:bg-amber-500/30 selection:text-amber-800 dark:selection:text-amber-200">
        <ThemeProvider>
          <MarketplaceProvider>
            <AuthProvider>
              <LocationProvider>
                <Suspense fallback={null}>
                  <CinematicIntro />
                </Suspense>
                <Suspense fallback={<div className="h-16 sm:h-20 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]" />}>
                  <Header />
                </Suspense>
                <main className="flex-1 flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] pb-16 lg:pb-0">{children}</main>
                <Suspense fallback={null}>
                  <Footer />
                </Suspense>
                <Suspense fallback={null}>
                  <ComparisonTray />
                </Suspense>
                <Suspense fallback={null}>
                  <MobileBottomNav />
                </Suspense>
                <LocationSelectorModal />
              </LocationProvider>
            </AuthProvider>
          </MarketplaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
