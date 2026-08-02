"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCredentials } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { useAdminLoginMutation } from "@/services/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  admin_email: z.string().email("Please enter a valid email address"),
  admin_password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
  } = useSelector((state: RootState) => state.auth);
  const [adminLoginApi, { isLoading }] = useAdminLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/admin";

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.isAdmin) {
      router.replace(redirectUrl);
    }
  }, [authLoading, isAuthenticated, user, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response: any = await adminLoginApi(data).unwrap();
      if (response.success) {
        const adminObj = response.data.admin;
        const userObj = {
          ...adminObj,
          user_name: adminObj.admin_name,
          user_email: adminObj.admin_email,
          user_role: adminObj.admin_role,
          isAdmin: true,
        };

        dispatch(
          setCredentials({
            user: userObj as any,
          }),
        );
        toast.success("Admin login successful.");
        router.push(redirectUrl);
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to log in. Please check credentials.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.54_0.19_264/0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.62_0.19_264/0.12),transparent)]" />

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-destructive flex items-center justify-center mb-4 shadow-lg shadow-destructive/20">
            <ShieldCheck className="w-5 h-5 text-destructive-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Admin Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in with administrator access
          </p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Admin Login
            </CardTitle>
            <CardDescription className="text-xs">
              Restricted area. Authorized personnel only.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-foreground"
                >
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="email"
                    {...register("admin_email")}
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-9 h-9 text-sm bg-secondary/40 border-border/60"
                  />
                </div>
                {errors.admin_email && (
                  <p className="text-[11px] text-destructive">
                    {errors.admin_email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-medium text-foreground"
                  >
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="password"
                    {...register("admin_password")}
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
                {errors.admin_password && (
                  <p className="text-[11px] text-destructive">
                    {errors.admin_password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 text-sm font-medium mt-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign in as Admin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
