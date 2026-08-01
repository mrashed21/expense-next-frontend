"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useRegisterMutation } from "../../../services/authApi";
import { toast } from "sonner";
import { User, Mail, Lock, Phone, ArrowRight, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const registerSchema = z.object({
  user_name: z.string().min(2, "Name must be at least 2 characters"),
  user_email: z.string().email("Please enter a valid email address"),
  user_password: z.string().min(8, "Password must be at least 8 characters"),
  user_phone: z.string().optional(),
  user_city: z.string().optional(),
  user_country: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const [registerApi, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response: any = await registerApi(data).unwrap();
      if (response.success) {
        toast.success("Account created! Enter the OTP sent to your email.");
        router.push(`/verify-otp?email=${encodeURIComponent(data.user_email)}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to register account.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.54_0.19_264/0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.62_0.19_264/0.12),transparent)]" />

      <div className="w-full max-w-sm">
        {/* Brand Mark */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">ExpenseVault</h1>
          <p className="text-sm text-muted-foreground mt-1">Create your free account</p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Get started</CardTitle>
            <CardDescription className="text-xs">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-foreground">
                  Full name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="name"
                    {...register("user_name")}
                    type="text"
                    placeholder="John Doe"
                    className="pl-9 h-9 text-sm bg-secondary/40 border-border/60"
                  />
                </div>
                {errors.user_name && (
                  <p className="text-[11px] text-destructive">{errors.user_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="email"
                    {...register("user_email")}
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9 h-9 text-sm bg-secondary/40 border-border/60"
                  />
                </div>
                {errors.user_email && (
                  <p className="text-[11px] text-destructive">{errors.user_email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="password"
                    {...register("user_password")}
                    type="password"
                    placeholder="Min. 8 characters"
                    className="pl-9 h-9 text-sm bg-secondary/40 border-border/60"
                  />
                </div>
                {errors.user_password && (
                  <p className="text-[11px] text-destructive">{errors.user_password.message}</p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                  Phone{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="phone"
                    {...register("user_phone")}
                    type="text"
                    placeholder="+8801700000000"
                    className="pl-9 h-9 text-sm bg-secondary/40 border-border/60"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 text-sm font-medium mt-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-0 pt-0 pb-5 px-6">
            <Separator className="mb-4" />
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
