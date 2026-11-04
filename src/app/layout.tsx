import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Lora, Courier_Prime } from 'next/font/google';
import './globals.css';
import { PwaScrollBoundary } from '@/components/pwa/PwaScrollBoundary';
import { PwaInputEnterNavigator } from '@/components/pwa/PwaInputEnterNavigator';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Manifest — Santuario Místico & Grimorio',
  description: 'Espacio íntimo y místico para manifestar intenciones, registrar reflexiones en tu grimorio personal y liberar cargas.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Manifest',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9FD' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0812' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${lora.variable} ${courierPrime.variable} light`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
                var s = localStorage.getItem('manifest_user_settings');
                if (s && JSON.parse(s).isLiteMode) {
                  document.documentElement.classList.add('lite-mode');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="aura-bg text-manifest-ink font-sans antialiased selection:bg-manifest-auraPurple/30 selection:text-manifest-ink min-h-screen">
        <PwaScrollBoundary />
        <PwaInputEnterNavigator />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function purgeNetlifyBadge() {
                  var selectors = [
                    '#nl-badge-frame',
                    '[id*="nl-badge"]',
                    '[id*="netlify-drawer"]',
                    '[id*="netlify-feedback"]',
                    'iframe[title*="Netlify" i]',
                    'iframe[title*="Powered by Netlify" i]',
                    'netlify-drawer'
                  ];
                  selectors.forEach(function(sel) {
                    var els = document.querySelectorAll(sel);
                    for (var i = 0; i < els.length; i++) {
                      els[i].remove();
                    }
                  });
                }
                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', purgeNetlifyBadge);
                  window.addEventListener('load', purgeNetlifyBadge);
                  var observer = new MutationObserver(purgeNetlifyBadge);
                  observer.observe(document.documentElement, { childList: true, subtree: true });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
