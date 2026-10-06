import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteDescription = "Warehouse and inventory management";

function siteUrl(): URL {
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) {
    return new URL(`https://${productionHost}`);
  }
  const frontend = process.env.FRONTEND_URL?.replace(/\/$/, "");
  if (frontend) {
    return new URL(frontend);
  }
  return new URL("https://stockhub-three.vercel.app");
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "StockHub",
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName: "StockHub",
    title: "StockHub",
    description: siteDescription,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "StockHub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StockHub",
    description: siteDescription,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full min-w-0 flex flex-col overflow-x-clip font-sans">
        {children}
      </body>
    </html>
  );
}
