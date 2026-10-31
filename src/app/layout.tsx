import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Manifest Journal — Santuario Personal',
  description: 'Espacio íntimo para manifestar intenciones, registrar reflexiones, organizar tu vida y liberar cargas.',
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
  themeColor: '#DCCFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={plusJakartaSans.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="aura-bg text-manifest-ink font-sans antialiased selection:bg-manifest-lavender/50 min-h-screen">
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
