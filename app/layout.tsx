import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Procvičování matematiky",
  description: "Aplikace pro procvičování matematiky pro prvňáčky",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
