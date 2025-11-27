import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avatar TTS - AI Talking Avatar",
  description: "Interactive 3D avatar with AI-powered conversations and lip-sync",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
