import ToastContainer from '@/components/Toast/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import { Varela_Round, Playwrite_HU, Nunito } from "next/font/google";
import '@/app/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

const varelaRound = Varela_Round({
  subsets: ["latin"],
  variable: "--font-varela-round",
  display: "swap",
  weight: ["400"],
});

const playwriteHU = Playwrite_HU({
  variable: "--font-playwrite",
  display: "swap",
  weight: ["100", "200", "300", "400"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  style: ["normal", "italic"],
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.isSecureContext) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register('/service-worker.js');
        } catch (e) {
          // ignore registration errors
        }
      };
      register();
    }
  }, []);
  return (
    <main className={`${varelaRound.variable} ${playwriteHU.variable} ${nunito.variable}`} style={{ fontFamily: 'var(--font-varela-round), Arial, Helvetica, sans-serif' }}>
      <ToastProvider>
        <Component {...pageProps} />
        <ToastContainer />
      </ToastProvider>
    </main>
  );
}