import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { MobileNav } from "../../components/layout/MobileNav";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-background text-foreground">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0">
          {/* Sticky Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
