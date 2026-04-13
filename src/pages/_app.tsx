import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Log para debug - ver quais rotas são acessadas
    console.log("Current route:", router.pathname);
  }, [router.pathname]);

  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  );
}
