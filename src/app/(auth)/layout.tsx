import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white/10 blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-black/20 blur-[100px]" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-black tracking-tight">Expense Tracker</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Manage your finances <br/> with confidence.
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Track expenses, set budgets, and achieve your financial goals with our intuitive platform designed for your peace of mind.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Expense Tracker Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.54_0.19_264/0.05),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.62_0.19_264/0.08),transparent)] pointer-events-none" />
        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo (hidden on desktop) */}
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black tracking-tight">Expense Tracker</span>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
