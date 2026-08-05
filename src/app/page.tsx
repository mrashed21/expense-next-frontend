"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Shield,
  Zap,
  Sparkles,
  Check,
  ChevronRight,
  BarChart3,
  PieChart as PieIcon,
  FileSpreadsheet,
  FileText,
  Bell,
  RefreshCw,
  Search,
  Lock,
  ArrowRight,
  Star,
  Users,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Tag,
  Paperclip,
  Target,
  Globe,
  HelpCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Static preview data for analytics charts
const categoryData = [
  { name: "Housing & Rent", value: 1200, color: "#6366f1" },
  { name: "Groceries & Food", value: 650, color: "#10b981" },
  { name: "Utilities & Bills", value: 320, color: "#f59e0b" },
  { name: "Entertainment", value: 240, color: "#ec4899" },
  { name: "Transport & Gas", value: 180, color: "#8b5cf6" },
];

const monthlyTrendData = [
  { month: "Jan", Income: 4200, Expense: 2400, Savings: 1800 },
  { month: "Feb", Income: 4500, Expense: 2600, Savings: 1900 },
  { month: "Mar", Income: 4800, Expense: 2300, Savings: 2500 },
  { month: "Apr", Income: 5100, Expense: 2700, Savings: 2400 },
  { month: "May", Income: 5400, Expense: 2500, Savings: 2900 },
  { month: "Jun", Income: 5800, Expense: 2800, Savings: 3000 },
];

const netWorthData = [
  { month: "Jan", value: 15200 },
  { month: "Feb", value: 17100 },
  { month: "Mar", value: 19600 },
  { month: "Apr", value: 22000 },
  { month: "May", value: 24900 },
  { month: "Jun", value: 27900 },
];

const features = [
  {
    icon: TrendingDown,
    title: "Expense Tracking",
    description: "Record daily expenses instantly with multi-currency support, custom payment methods, and automated categorization.",
  },
  {
    icon: TrendingUp,
    title: "Income Tracking",
    description: "Track salary, freelance paychecks, investments, and side-hustle revenues in one unified dashboard.",
  },
  {
    icon: Target,
    title: "Budget Planning",
    description: "Set custom category budget limits with automated real-time alerts before you exceed your monthly thresholds.",
  },
  {
    icon: Tag,
    title: "Categories & Tags",
    description: "Organize transactions into custom color-coded categories and tags for hyper-granular financial reporting.",
  },
  {
    icon: Wallet,
    title: "Multi-Account Sync",
    description: "Manage bank accounts, cash wallets, credit cards, and digital wallets with instant internal transfer recording.",
  },
  {
    icon: FileText,
    title: "PDF Expense Reports",
    description: "Generate polished, professional PDF expense summaries with single-click rendering and filtered date ranges.",
  },
  {
    icon: FileSpreadsheet,
    title: "Export to Excel",
    description: "Export all your financial records directly to formatted `.xlsx` spreadsheets for accountant review.",
  },
  {
    icon: Bell,
    title: "Live Notifications",
    description: "Receive instant notifications for budget warnings, upcoming bill payments, and security activity.",
  },
  {
    icon: RefreshCw,
    title: "Recurring Automations",
    description: "Automate monthly rent, subscriptions, and utility bills so recurring transactions log themselves on schedule.",
  },
  {
    icon: Paperclip,
    title: "Attach Receipts",
    description: "Upload images and PDF receipts directly to transactions for tax audits and quick expense verification.",
  },
  {
    icon: Search,
    title: "Search & Save Filters",
    description: "Search millions of records in milliseconds and save customized filter presets for instant repeat searches.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description: "Enterprise-ready administrative controls, user management, broadcast alerts, and activity audit logs.",
  },
];

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Senior Software Engineer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    review: "Expense Tracker completely transformed how I manage my monthly budget. The real-time alerts saved me over $500 last month alone!",
  },
  {
    name: "David Chen",
    role: "Small Business Owner",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    review: "The PDF and Excel export features save me hours during tax season. Having multi-account sync and receipt attachments is a game changer.",
  },
  {
    name: "Elena Rostova",
    role: "Freelance Designer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    review: "The UI is breathtaking! Dark mode looks stunning, the charts are responsive, and setting recurring bills takes seconds.",
  },
];

const faqs = [
  {
    q: "Is my financial data secure on Expense Tracker?",
    a: "Yes. We use industry-standard 256-bit AES encryption in transit and at rest, secure JWT authentication with HttpOnly cookies, and strict database isolation.",
  },
  {
    q: "Can I export my financial data to Excel or PDF?",
    a: "Absolutely. You can export filtered transaction lists, monthly statements, and net worth reports directly to formatted PDF or XLSX files at any time.",
  },
  {
    q: "How do automated recurring expenses work?",
    a: "You can set up rules for monthly rent, utility bills, or subscriptions. Expense Tracker automatically logs these transactions on your designated due dates.",
  },
  {
    q: "Can I manage multiple bank accounts and cash wallets?",
    a: "Yes! Expense Tracker supports unlimited custom accounts (Checking, Savings, Credit Cards, Cash Wallets, Crypto) and records transfers between them seamlessy.",
  },
  {
    q: "Is Expense Tracker fully responsive on mobile devices?",
    a: "Yes. Expense Tracker is built with a mobile-first philosophy, featuring touch-optimized tables, drawers, and responsive charts across all screen sizes.",
  },
];

export default function HomePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activePreviewTab, setActivePreviewTab] = useState<"dashboard" | "analytics" | "transactions" | "mobile">("dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-primary to-indigo-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Expense Tracker
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#preview" className="hover:text-foreground transition-colors">Preview</a>
            <a href="#why-us" className="hover:text-foreground transition-colors">Why Choose Us</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-1.5"
                >
                  Get Started
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* 2. Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
          {/* Subtle Grid / Glow Background */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            {/* Release Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-xs animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen SaaS Expense Tracker v2.0 Released</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Master Your Money with{" "}
              <span className="bg-linear-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Smart Analytics
              </span>{" "}
              & Effortless Tracking
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
              Expense Tracker gives you complete clarity over income, expenses, budgets, and net worth. Generate automated PDF/Excel reports, get real-time alerts, and achieve true financial freedom.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-linear-to-r from-primary via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-primary/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-all flex items-center justify-center gap-2"
              >
                <TrendingDown className="w-4 h-4 text-primary" />
                <span>Track Expenses Now</span>
              </Link>
            </div>

            {/* Hero Dashboard Preview Frame */}
            <div className="pt-8 relative max-w-5xl mx-auto">
              <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl p-3 sm:p-5 shadow-2xl shadow-primary/10">
                <div className="rounded-2xl border border-border bg-background/90 p-4 sm:p-6 space-y-6 text-left">
                  {/* Top Bar Mockup */}
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="text-xs font-mono text-muted-foreground ml-2">app.expensetracker.com/dashboard</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-extrabold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live Sync
                      </span>
                    </div>
                  </div>

                  {/* Summary Stat Mini Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
                      <p className="text-[11px] text-muted-foreground font-medium">Total Balance</p>
                      <p className="text-lg font-black text-foreground mt-0.5">$27,900.00</p>
                      <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
                        <TrendingUp className="w-3 h-3" /> +12.4% this month
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
                      <p className="text-[11px] text-muted-foreground font-medium">Monthly Income</p>
                      <p className="text-lg font-black text-emerald-500 mt-0.5">$5,800.00</p>
                      <p className="text-[10px] text-muted-foreground mt-1">2 Salary Records</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
                      <p className="text-[11px] text-muted-foreground font-medium">Monthly Expense</p>
                      <p className="text-lg font-black text-rose-500 mt-0.5">$2,800.00</p>
                      <p className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5 mt-1">
                        <TrendingDown className="w-3 h-3" /> -4.1% vs last month
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
                      <p className="text-[11px] text-muted-foreground font-medium">Net Savings</p>
                      <p className="text-lg font-black text-primary mt-0.5">$3,000.00</p>
                      <p className="text-[10px] text-emerald-500 font-bold mt-1">51.7% Savings Rate</p>
                    </div>
                  </div>

                  {/* Chart Preview */}
                  <div className="h-48 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                        <YAxis stroke="#888888" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="hidden lg:block absolute -top-4 -left-8 p-3 rounded-2xl bg-card/90 border border-border shadow-xl backdrop-blur-md animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold">$4,850 Saved This Quarter</p>
                    <p className="text-[10px] text-muted-foreground">Automated goal tracker</p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block absolute -bottom-4 -right-6 p-3 rounded-2xl bg-card/90 border border-border shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <p className="text-xs font-bold">Budget Alert Active</p>
                    <p className="text-[10px] text-muted-foreground">Dining & Outings 78% used</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Trusted Users & Metrics Banner */}
        <section className="py-12 border-y border-border/60 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-primary">10,000+</p>
                <p className="text-xs font-semibold text-muted-foreground">Active Monthly Users</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-emerald-500">1M+</p>
                <p className="text-xs font-semibold text-muted-foreground">Transactions Logged</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-indigo-500">99.9%</p>
                <p className="text-xs font-semibold text-muted-foreground">Platform Uptime SLA</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-amber-500">4.9 / 5</p>
                <p className="text-xs font-semibold text-muted-foreground">User Satisfaction Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                Powerful Features
              </h2>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                Everything You Need for Complete Financial Mastery
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Built from the ground up to handle personal budgeting, small business accounting, and automated financial reports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-200 group hover:-translate-y-1 shadow-xs"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Dashboard Preview Section */}
        <section id="preview" className="py-20 bg-secondary/30 border-y border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
            <div className="space-y-3 max-w-3xl mx-auto">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                Interactive Preview
              </h2>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                Explore the Expense Tracker Interface
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sleek, responsive, and designed for effortless navigation on every device.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: "dashboard", label: "Dashboard Overview", icon: BarChart3 },
                { id: "analytics", label: "Analytics & Charts", icon: PieIcon },
                { id: "transactions", label: "Expense List", icon: FileText },
                { id: "mobile", label: "Mobile Experience", icon: Smartphone },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      activePreviewTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Display */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xl max-w-4xl mx-auto text-left">
              {activePreviewTab === "dashboard" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <h4 className="font-extrabold text-sm">Dashboard Overview</h4>
                    <span className="text-xs text-muted-foreground">Real-Time Financial Health</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Cash Balance</p>
                      <p className="text-xl font-extrabold text-foreground mt-1">$14,250.00</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Investments</p>
                      <p className="text-xl font-extrabold text-emerald-500 mt-1">$13,650.00</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Monthly Bills Due</p>
                      <p className="text-xl font-extrabold text-amber-500 mt-1">$450.00</p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === "analytics" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <h4 className="font-extrabold text-sm">Visual Category Breakdown</h4>
                    <span className="text-xs text-muted-foreground">Expense Distribution</span>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activePreviewTab === "transactions" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <h4 className="font-extrabold text-sm">Recent Transactions</h4>
                    <span className="text-xs text-muted-foreground">Filtered View</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex justify-between items-center">
                      <div>
                        <p className="font-bold">Apple Store Purchase</p>
                        <p className="text-[10px] text-muted-foreground">Electronics • Aug 04</p>
                      </div>
                      <span className="font-extrabold text-rose-500">-$999.00</span>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex justify-between items-center">
                      <div>
                        <p className="font-bold">Client Payroll Deposit</p>
                        <p className="text-[10px] text-muted-foreground">Income • Aug 01</p>
                      </div>
                      <span className="font-extrabold text-emerald-500">+$4,500.00</span>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === "mobile" && (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm">Mobile-Optimized PWA</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Access your financial dashboard seamlessly on your iPhone, Android, or tablet with full offline capability and smooth touch interactions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 6. Why Choose Us Section */}
        <section id="why-us" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                Why Expense Tracker
              </h2>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                Designed for Speed, Security & Precision
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Lightning Fast</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sub-100ms response times for all record queries and instant report rendering.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Bank-Grade Security</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  256-bit AES data encryption, secure HttpOnly cookie management, and JWT session handling.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">100% Responsive</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tailored touch interfaces for mobile phones, tablets, laptops, and ultra-wide desktops.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Intuitive UX</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Clean design, clear typography, and zero clutter make tracking expenses enjoyable.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Real-Time Analytics</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Interactive charts dynamically compute spending trends, net worth growth, and budget health.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Cloud Sync</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Continuous background cloud replication ensures your financial data is safe and accessible anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Analytics Preview Section */}
        <section className="py-20 bg-secondary/20 border-y border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                Financial Insights
              </h2>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                Visual Analytics at Your Fingertips
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Line Chart */}
              <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                <h3 className="font-bold text-sm text-foreground">Net Worth Growth Trajectory</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={netWorthData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                <h3 className="font-bold text-sm text-foreground">Income vs Expenses Monthly Comparison</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                Simple Workflow
              </h2>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                How Expense Tracker Works in 5 Easy Steps
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { step: "01", title: "Create Account", desc: "Sign up in 30 seconds with email or Google auth." },
                { step: "02", title: "Add Income", desc: "Log your salary, business revenue, and active accounts." },
                { step: "03", title: "Add Expense", desc: "Record daily purchases with receipt photo attachments." },
                { step: "04", title: "View Reports", desc: "Generate PDF and Excel reports with one click." },
                { step: "05", title: "Save Money", desc: "Optimize spending habits and build lasting wealth." },
              ].map((s) => (
                <div key={s.step} className="p-5 rounded-3xl bg-card border border-border space-y-3 text-center relative">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary font-black text-sm mx-auto flex items-center justify-center">
                    {s.step}
                  </div>
                  <h3 className="font-extrabold text-sm">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Testimonials Section */}
        <section className="py-20 bg-secondary/30 border-y border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                User Reviews
              </h2>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                Loved by Thousands of Smart Savers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{t.review}"
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-foreground">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Pricing Section */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                Simple Pricing
              </h2>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                Transparent Plans for Every Budget
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                No hidden fees. Upgrade or cancel anytime.
              </p>

              {/* Monthly/Yearly Toggle */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-secondary border border-border">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    billingCycle === "monthly"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    billingCycle === "yearly"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly Billing (Save 20%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Free Plan */}
              <div className="p-8 rounded-3xl bg-card border border-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <h3 className="font-extrabold text-lg">Free Starter</h3>
                  <p className="text-xs text-muted-foreground">Essential tracking for individuals.</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">৳0</span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                  <ul className="space-y-2 text-xs pt-4 border-t border-border">
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Up to 100 Transactions / mo</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>3 Financial Accounts</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Basic Category Analytics</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground line-through">
                      <span>PDF & Excel Exports</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-2xl bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80 transition-colors text-center"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Pro Plan (Highlighted) */}
              <div className="p-8 rounded-3xl bg-linear-to-b from-primary/10 via-card to-card border-2 border-primary relative flex flex-col justify-between space-y-6 shadow-2xl shadow-primary/15">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <h3 className="font-extrabold text-lg text-primary">Pro Unlimited</h3>
                  <p className="text-xs text-muted-foreground">For active savers & freelancers.</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">
                      {billingCycle === "monthly" ? "৳299" : "৳239"}
                    </span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                  <ul className="space-y-2 text-xs pt-4 border-t border-border">
                    <li className="flex items-center gap-2 text-foreground font-semibold">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Unlimited Transactions</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-semibold">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Unlimited Financial Accounts</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-semibold">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>PDF & Formatted Excel Exports</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-semibold">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Recurring Bill Automations</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-semibold">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Receipt Attachments & Storage</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors text-center"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>

              {/* Business Plan */}
              <div className="p-8 rounded-3xl bg-card border border-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <h3 className="font-extrabold text-lg">Business Suite</h3>
                  <p className="text-xs text-muted-foreground">For business teams & accountants.</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">
                      {billingCycle === "monthly" ? "৳999" : "৳799"}
                    </span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                  <ul className="space-y-2 text-xs pt-4 border-t border-border">
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Everything in Pro Plan</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Multi-User Role-Based Access</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Audit Logs & Admin Panel</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Dedicated Priority Support</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-2xl bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80 transition-colors text-center"
                >
                  Contact Business Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 11. FAQ Section */}
        <section id="faq" className="py-20 bg-secondary/30 border-y border-border/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                Got Questions?
              </h2>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                Frequently Asked Questions
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full bg-card rounded-3xl p-4 sm:p-6 border border-border shadow-xs">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-sm font-bold">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 12. Large CTA Banner */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-linear-to-r from-primary via-indigo-600 to-purple-600 p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl shadow-primary/25 relative">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Take Control of Your Finances Today.
              </h2>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto">
                Join over 10,000+ users who log daily expenses, track net worth, and achieve financial security with Expense Tracker.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-primary font-extrabold text-sm shadow-lg hover:bg-slate-100 transition-colors"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
                >
                  Sign In to Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 13. Footer Section */}
      <footer className="border-t border-border/60 bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Summary */}
            <div className="space-y-3 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base">Expense Tracker</span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The all-in-one financial tracking platform for smart budgeting, expense management, and real-time visual analytics.
              </p>
            </div>

            {/* Links Column 1 */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-foreground">Product</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#preview" className="hover:text-foreground">Live Preview</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing Plans</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground">How It Works</a></li>
              </ul>
            </div>

            {/* Links Column 2 */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-foreground">Resources</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li><a href="#faq" className="hover:text-foreground">Help & FAQ</a></li>
                <li><a href="/login" className="hover:text-foreground">Account Access</a></li>
                <li><a href="/register" className="hover:text-foreground">New Registration</a></li>
              </ul>
            </div>

            {/* Links Column 3 */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-foreground">Legal & Security</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li><span className="hover:text-foreground cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-foreground cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-foreground cursor-pointer">256-bit Encryption</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 Expense Tracker SaaS. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>English (US)</span>
              <span>BDT (৳)</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
