import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using a "world-class" standard font
import "./globals.css"; // This imports your Tailwind CSS

// Setup the font
const inter = Inter({ subsets: ["latin"] });

// Setup "world-class" SEO and metadata
export const metadata: Metadata = {
  title: "Xpress Point",
  description: "Your all-in-one platform for NIN, BVN, and VTU services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* This 'children' prop is where all your pages (like 'app/login/page.tsx' 
          or 'app/dashboard/layout.tsx') will be rendered.
        */}
        {children}
      </body>
    </html>
  );
}
