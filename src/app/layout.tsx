import type { Metadata } from "next";
import { Inter, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "ExpenseVault - Mobile-First SaaS Expense Tracker",
  description:
    "Production-ready, secure, scalable expense tracking and financial analytics application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${roboto.variable} font-sans antialiased selection:bg-primary/20 selection:text-primary`}
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
