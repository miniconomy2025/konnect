import ToastContainer from '@/components/Toast/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <Component {...pageProps} />
      <ToastContainer />
    </ToastProvider>
  );
}