import { AuthProvider } from "@/providers/auth-provider";
import { ReduxProvider } from "@/providers/redux-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://expense-trecker-bd.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Free Expense Tracker – Track Income, Expenses & Savings",
    template: "%s | Expense Tracker",
  },
  description:
    "Track your income, expenses, budgets and savings with a free, easy-to-use Expense Tracker. Get clear financial insights and manage your money smarter.",
  keywords: [
    "free expense tracker",
    "expense tracker",
    "income tracker",
    "budget tracker",
    "personal finance tracker",
    "expense management",
    "money management",
    "savings tracker",
    "BDT expense tracker",
    "Bangladesh expense tracker",
  ],
  authors: [{ name: "Muhammad Rashed", url: "https://www.mrashed21.me/" }],
  creator: "Muhammad Rashed",
  publisher: "Muhammad Rashed",
  icons: {
    icon: [
      { url: "/192-icon.png", sizes: "192x192", type: "image/png" },
      { url: "/512-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/192-icon.png", sizes: "192x192", type: "image/png" }],
    shortcut: "/192-icon.png",
  },
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
    title: "Free Expense Tracker – Track Income, Expenses & Savings",
    description:
      "Track your income, expenses, budgets and savings with a free, easy-to-use Expense Tracker. Get clear financial insights and manage your money smarter.",
    siteName: "Expense Tracker",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Expense Tracker Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Expense Tracker – Track Income, Expenses & Savings",
    description:
      "Track your income, expenses, budgets and savings with a free, easy-to-use Expense Tracker.",
    creator: "@mrashed21",
    images: [`${baseUrl}/og-image.jpg`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Expense Tracker",
      operatingSystem: "Web, iOS, Android",
      applicationCategory: "FinanceApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BDT",
      },
      description:
        "100% Free Expense Tracker for individuals and businesses with real-time analytics, budgeting, and export tools.",
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Muhammad Rashed",
      url: "https://www.mrashed21.me/",
      jobTitle: "Full-Stack Software Developer",
      sameAs: [
        "https://github.com/mrashed21",
        "https://www.linkedin.com/in/mrashed21/",
        "https://www.facebook.com/mrasheed21",
        "https://www.instagram.com/mrashed21/",
      ],
    },
  ];

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
