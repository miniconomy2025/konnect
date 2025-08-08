import ToastContainer from '@/components/Toast/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

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
    <ToastProvider>
      <Component {...pageProps} />
      <ToastContainer />
    </ToastProvider>
  );
}