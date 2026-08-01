import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "../providers/ReduxProvider";
import { AuthProvider } from "../providers/AuthProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { ToastProvider } from "../providers/ToastProvider";

export const metadata: Metadata = {
  title: "ExpenseVault - Mobile-First SaaS Expense Tracker",
  description: "Production-ready, secure, scalable expense tracking and financial analytics application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-primary/20 selection:text-primary">
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
              <ToastProvider />
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
