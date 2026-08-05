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
import { useResetPasswordMutation } from "@/services/auth-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PasswordStrength } from "@/components/auth/password-strength";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const resetSchema = z.object({
  otp_code: z.string().length(6, "OTP must be 6 digits"),
  new_password: passwordSchema,
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [resetPasswordApi, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const currentPassword = watch("new_password");

  const onSubmit = async (data: ResetFormValues) => {
    try {
      const response: any = await resetPasswordApi({
        user_email: email,
        otp_code: data.otp_code,
        new_password: data.new_password,
      }).unwrap();
      if (response.success) {
        toast.success(
          "Password reset successfully! Log in with your new password.",
        );
        router.push("/login");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Set new password
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-65">
            Enter the OTP sent to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Reset password
            </CardTitle>
            <CardDescription className="text-xs">
              Enter your OTP code and choose a new password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* OTP */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="otp"
                  className="text-xs font-medium text-foreground"
                >
                  Reset code
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="otp"
                    {...register("otp_code", {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      }
                    })}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    className="pl-9 h-9 text-sm tracking-widest bg-secondary/40 border-border/60"
                  />
                </div>
                {errors.otp_code && (
                  <p className="text-[11px] text-destructive">
                    {errors.otp_code.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="new-password"
                  className="text-xs font-medium text-foreground"
                >
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
                <PasswordStrength password={currentPassword} />
                {errors.new_password && (
                  <p className="text-[11px] text-destructive">
                    {errors.new_password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-password"
                  className="text-xs font-medium text-foreground"
                >
                  Confirm password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    {...register("confirm_password")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9 h-9 text-sm bg-secondary/40 border-border/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-[11px] text-destructive">
                    {errors.confirm_password.message}
                  </p>
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
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
