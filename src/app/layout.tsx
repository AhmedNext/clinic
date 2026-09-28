import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dental Clinic — Cases & Odontogram",
  description: "Professional clinical management and 3D dental chart system",
  icons: {
    icon: "/dr.png",
    shortcut: "/dr.png",
    apple: "/dr.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ClinicSettingsProvider } from "@/context/ClinicSettingsContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <LanguageProvider>
          <AuthProvider>
            <ClinicSettingsProvider>{children}</ClinicSettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
