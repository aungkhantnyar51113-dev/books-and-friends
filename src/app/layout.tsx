import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Nav } from "@/components/Nav";
import { NetworkStatus } from "@/components/NetworkStatus";
import { BackButton } from "@/components/BackButton";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Books & Friends",
  description: "Read together, discuss, and share progress with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${libreBaskerville.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans antialiased overflow-x-hidden">
        <NetworkStatus />
        <AuthProvider>
          <NotificationProvider>
            <Nav />
            <main className="flex-1 overflow-x-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                {children}
              </div>
            </main>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
