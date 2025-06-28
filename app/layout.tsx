import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INTELICHAT - Chat Terminal",
  description: "Aplicación de chat en tiempo real con estilo terminal retro. Desarrollada con Next.js, TypeScript, Tailwind CSS y Supabase.",
  keywords: ["chat", "terminal", "tiempo real", "nextjs", "supabase", "retro"],
  authors: [{ name: "INTELICHAT Team" }],
  creator: "INTELICHAT",
  publisher: "INTELICHAT",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  category: "social",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00ff00",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
