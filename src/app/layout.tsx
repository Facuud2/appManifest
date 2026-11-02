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
  themeColor: '#E8E8E8',
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
    <html lang="es" className={`${plusJakartaSans.variable} ${lora.variable} ${courierPrime.variable} light`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
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
                // PWA Overscroll Boundary Lock: Bloquea el rubber-band elástico al no haber elementos arriba o abajo
                (function initPwaScrollLock() {
                  var startY = 0;
                  var startX = 0;

                  function isScrollableEl(el) {
                    if (!el || el === document.body || el === document.documentElement) return false;
                    var style = window.getComputedStyle(el);
                    var overflowY = style.overflowY;
                    var canScroll = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
                    return canScroll;
                  }

                  function getScrollableAncestor(node) {
                    var curr = node;
                    while (curr && curr !== document.body && curr !== document.documentElement) {
                      if (isScrollableEl(curr)) return curr;
                      curr = curr.parentElement;
                    }
                    return null;
                  }

                  function handleTouchStart(e) {
                    if (!e.touches || e.touches.length === 0) return;
                    startY = e.touches[0].clientY;
                    startX = e.touches[0].clientX;
                  }

                  function handleTouchMove(e) {
                    if (!e.touches || e.touches.length === 0) return;
                    var curY = e.touches[0].clientY;
                    var curX = e.touches[0].clientX;
                    var deltaY = curY - startY;
                    var deltaX = curX - startX;

                    if (Math.abs(deltaY) < 1) return;
                    if (Math.abs(deltaX) > Math.abs(deltaY)) return;

                    var target = e.target;
                    var scrollable = getScrollableAncestor(target);

                    if (scrollable) {
                      var scrollTop = scrollable.scrollTop;
                      var isAtTop = scrollTop <= 0;
                      var isAtBottom = scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;

                      if (deltaY > 0 && isAtTop) {
                        if (e.cancelable) e.preventDefault();
                      } else if (deltaY < 0 && isAtBottom) {
                        if (e.cancelable) e.preventDefault();
                      }
                    } else {
                      var doc = document.documentElement;
                      var body = document.body;
                      var sTop = window.scrollY || doc.scrollTop || (body ? body.scrollTop : 0) || 0;
                      var sHeight = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0);
                      var cHeight = window.innerHeight || doc.clientHeight;
                      var hasScroll = sHeight > cHeight + 2;

                      if (!hasScroll) {
                        if (e.cancelable) e.preventDefault();
                      } else {
                        var atTop = sTop <= 0;
                        var atBottom = sTop + cHeight >= sHeight - 2;

                        if (deltaY > 0 && atTop) {
                          if (e.cancelable) e.preventDefault();
                        } else if (deltaY < 0 && atBottom) {
                          if (e.cancelable) e.preventDefault();
                        }
                      }
                    }
                  }

                  window.addEventListener('touchstart', handleTouchStart, { passive: true });
                  window.addEventListener('touchmove', handleTouchMove, { passive: false });
                  document.addEventListener('touchstart', handleTouchStart, { passive: true });
                  document.addEventListener('touchmove', handleTouchMove, { passive: false });
                })();

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
