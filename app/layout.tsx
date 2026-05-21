import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "LaunchForge AI — Describe your startup. Launch your SaaS.",
    template: "%s | LaunchForge AI",
  },
  description:
    "AI-powered SaaS blueprint generator. Enter your idea, get a full product architecture, database schema, Stripe billing, and deployment plan in seconds.",
  keywords: ["SaaS generator", "AI startup", "app builder", "Claude AI", "Next.js"],
  openGraph: {
    title: "LaunchForge AI",
    description: "Describe your startup. Launch your SaaS.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
