import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://expensetracker.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Expense Tracker - Premium SaaS Expense Tracker & Financial Analytics",
    template: "%s | Expense Tracker",
  },
  description:
    "Take full control of your personal and business finances with Expense Tracker. Track income, manage budget limits, automate recurring bills, and export custom PDF & Excel reports.",
  keywords: [
    "Expense Tracker",
    "SaaS Financial Manager",
    "Budget Planner",
    "Personal Finance App",
    "Income and Expense Tracker",
    "Financial Analytics",
    "PDF Expense Reports",
    "Excel Export",
    "Money Management",
  ],
  authors: [{ name: "Expense Tracker Team" }],
  creator: "Expense Tracker",
  publisher: "Expense Tracker",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "Expense Tracker - Premium SaaS Expense Tracker & Financial Analytics",
    description:
      "Modern, secure, and intuitive expense tracking application. Real-time budget alerts, instant search, multi-account transfers, and financial visual charts.",
    siteName: "Expense Tracker",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Expense Tracker SaaS Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expense Tracker - Smart Expense Tracker & Finance Dashboard",
    description:
      "Track daily expenses, set budget alerts, and generate automated PDF/Excel reports in seconds.",
    creator: "@expensetracker",
    images: [`${baseUrl}/og-image.jpg`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Expense Tracker",
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "FinanceApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Production-ready SaaS Expense Tracker for individuals and businesses with real-time analytics, budgeting, and export tools.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased selection:bg-primary/20 selection:text-primary min-h-screen bg-background text-foreground`}
      >
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <ToastProvider />
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener("wheel", function (event) {
                if (document.activeElement && document.activeElement.type === "number") {
                  document.activeElement.blur();
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
