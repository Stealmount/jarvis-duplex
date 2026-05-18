import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { Bebas_Neue, DM_Sans, DM_Mono, Cormorant_Garamond } from 'next/font/google';
import ParticleBackground from '@/components/ParticleBackground';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--loaded-bebas',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--loaded-dm-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--loaded-dm-mono',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--loaded-cormorant',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'JARVIS — Your Indian AI Companion',
  description: 'Voice-first AI companion with full-duplex conversation, research, therapy, and study modes. 50 free messages daily.',
  keywords: 'AI, voice assistant, Indian AI, JARVIS, study, therapy, research',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('jarvis_theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}` }} />
      </head>
      <body>
        <SessionProvider>
          <ParticleBackground />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
