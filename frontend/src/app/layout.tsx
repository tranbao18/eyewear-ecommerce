import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MẮT KÍNH - Kính Mát & Kính Cận Thời Trang Cao Cấp",
  description: "Cửa hàng mắt kính hiện đại, phong cách và đẳng cấp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-gray-50 text-gray-900" suppressHydrationWarning>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#111',
              color: '#fff',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
            },
            success: {
              iconTheme: {
                primary: '#fff',
                secondary: '#111',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
