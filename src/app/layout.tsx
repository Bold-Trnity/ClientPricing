import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "PayPricing Pro — Payment Processing Pricing",
  description: "Generate and manage payment processing pricing proposals for your clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
