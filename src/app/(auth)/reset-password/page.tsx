"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResetPasswordMutation } from "../../../services/authApi";
import { toast } from "sonner";
import { Lock, KeyRound, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const resetSchema = z.object({
  otp_code: z.string().length(6, "OTP must be 6 digits"),
  new_password: z.string().min(8, "New password must be at least 8 characters"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [resetPasswordApi, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    try {
      const response: any = await resetPasswordApi({
        user_email: email,
        otp_code: data.otp_code,
        new_password: data.new_password,
      }).unwrap();
      if (response.success) {
        toast.success("Password reset successfully! Log in with your new password.");
        router.push("/login");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.54_0.19_264/0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.62_0.19_264/0.12),transparent)]" />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
            Enter the OTP sent to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Reset password</CardTitle>
            <CardDescription className="text-xs">
              Enter your OTP code and choose a new password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* OTP */}
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-xs font-medium text-foreground">
                  Reset code
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="otp"
                    {...register("otp_code")}
                    type="text"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    className="pl-9 h-9 text-sm tracking-widest bg-secondary/40 border-border/60"
                  />
                </div>
                {errors.otp_code && (
                  <p className="text-[11px] text-destructive">{errors.otp_code.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-medium text-foreground">
                  New password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="new-password"
                    {...register("new_password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
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
                {errors.new_password && (
                  <p className="text-[11px] text-destructive">{errors.new_password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 text-sm font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Reset &amp; sign in</span>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
