"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { setCredentials } from "../../../redux/slices/authSlice";
import { useLoginMutation } from "../../../services/authApi";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight, Loader2, TrendingUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  user_email: z.string().email("Please enter a valid email address"),
  user_password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const [loginApi, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [authLoading, isAuthenticated, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response: any = await loginApi(data).unwrap();
      if (response.success) {
        dispatch(
          setCredentials({
            user: response.data.user,
            accessToken: response.data.accessToken,
          })
        );
        toast.success("Welcome back! Login successful.");
        router.push(redirectUrl);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to log in. Please check credentials.");
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
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="password"
                    {...register("user_password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9 h-9 text-sm bg-secondary/40 border-border/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.user_password && (
                  <p className="text-[11px] text-destructive">{errors.user_password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 text-sm font-medium mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-0 pt-0 pb-5 px-6">
            <Separator className="mb-4" />
            <p className="text-xs text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline underline-offset-4">
                Create account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
