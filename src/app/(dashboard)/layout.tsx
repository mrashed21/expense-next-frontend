import { ProtectedRoute } from "@/components/auth/protected-route";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-background text-foreground overflow-x-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
          {/* Sticky Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 w-full max-w-full space-y-4 md:space-y-6 overflow-x-hidden">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
