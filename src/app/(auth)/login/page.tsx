"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { setCredentials } from "@/redux/slices/auth-slice";
import { RootState } from "@/redux/store";
import {
  useLoginMutation,
  useVerifyLogin2FAMutation,
} from "@/services/auth-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  user_email: z.string().email("Please enter a valid email address"),
  user_password: z.string().min(1, "Password is required"),
});

const twoFaSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 digits"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type TwoFaFormValues = z.infer<typeof twoFaSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const [loginApi, { isLoading }] = useLoginMutation();
  const [verify2FA, { isLoading: isVerifying2FA }] =
    useVerifyLogin2FAMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

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

  const {
    register: register2FA,
    handleSubmit: handleSubmit2FA,
    formState: { errors: errors2FA },
  } = useForm<TwoFaFormValues>({
    resolver: zodResolver(twoFaSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response: any = await loginApi(data).unwrap();

      if (response.data?.requires2FA) {
        setRequires2FA(true);
        setTempToken(response.data.tempToken);
        toast.info("Two-Factor Authentication required.");
        return;
      }

      if (response.success) {
        localStorage.removeItem("isAdmin");
        dispatch(
          setCredentials({
            user: response.data.user,
          }),
        );
        toast.success("Welcome back! Login successful.");
        router.push(redirectUrl);
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to log in. Please check credentials.",
      );
    }
  };

  const on2FASubmit = async (data: TwoFaFormValues) => {
    if (!tempToken) return;
    try {
      const response: any = await verify2FA({
        tempToken,
        code: data.code,
      }).unwrap();
      if (response.success) {
        localStorage.removeItem("isAdmin");
        dispatch(
          setCredentials({
            user: response.data.user,
          }),
        );
        toast.success("Login successful.");
        router.push(redirectUrl);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid 2FA code.");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center md:text-left space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to continue to your account
        </p>
      </div>

      {!requires2FA ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-foreground"
            >
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="email"
                {...register("user_email")}
                type="email"
                placeholder="rashedjaman768@gmail.com"
                className="pl-9 h-9 text-sm bg-background border-input hover:border-primary/50 transition-colors focus-visible:ring-primary/20"
              />
            </div>
            {errors.user_email && (
              <p className="text-[11px] text-destructive">
                {errors.user_email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-foreground"
              >
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
                className="pl-9 pr-9 h-9 text-sm bg-background border-input hover:border-primary/50 transition-colors focus-visible:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
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
              <p className="text-[11px] text-destructive">
                {errors.user_password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 text-sm font-medium mt-2"
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
      ) : (
        <form onSubmit={handleSubmit2FA(on2FASubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="code"
              className="text-xs font-medium text-foreground"
            >
              Authentication Code
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="code"
                {...register2FA("code", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(
                      /[^0-9a-zA-Z-]/g,
                      "",
                    );
                  },
                })}
                type="text"
                inputMode="text"
                placeholder="000000"
                maxLength={20}
                className="pl-9 h-9 text-sm bg-background border-input hover:border-primary/50 transition-colors focus-visible:ring-primary/20 text-center tracking-widest font-mono uppercase"
              />
            </div>
            {errors2FA.code && (
              <p className="text-[11px] text-destructive">
                {errors2FA.code.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isVerifying2FA}
            className="w-full h-10 text-sm font-medium mt-2"
          >
            {isVerifying2FA ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setRequires2FA(false);
              setTempToken(null);
            }}
            className="w-full h-10 text-xs"
          >
            Cancel
          </Button>
        </form>
      )}

      <div className="flex-col gap-0 pt-6 p-0 mt-6">
        <Separator className="mb-4 bg-border/50" />
        <p className="text-xs text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
