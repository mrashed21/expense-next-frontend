"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, KeyRound, Loader2, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "../../../services/authApi";

const otpSchema = z.object({
  otp_code: z.string().length(6, "OTP must be exactly 6 digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [verifyOtpApi, { isLoading }] = useVerifyOtpMutation();
  const [resendOtpApi, { isLoading: isResending }] = useResendOtpMutation();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpFormValues) => {
    try {
      const response: any = await verifyOtpApi({
        user_email: email,
        otp_code: data.otp_code,
      }).unwrap();
      if (response.success) {
        toast.success("Email verified successfully! You can now log in.");
        router.push("/login");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid or expired OTP code.");
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email address missing. Please register again.");
      return;
    }
    try {
      const response: any = await resendOtpApi({ user_email: email }).unwrap();
      if (response.success) {
        toast.success("A new OTP code has been sent to your email.");
        setCountdown(60);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to resend OTP code.");
    }
  };

  return (
    <>
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-60`">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">
              {email || "your email"}
            </span>
          </p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Verify your email
            </CardTitle>
            <CardDescription className="text-xs">
              Enter the OTP code sent to your inbox
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="otp"
                  className="text-xs font-medium text-foreground"
                >
                  Verification code
                </Label>
                <Input
                  id="otp"
                  {...register("otp_code")}
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center tracking-[0.5em] text-lg font-semibold h-11 bg-secondary/40 border-border/60"
                />
                {errors.otp_code && (
                  <p className="text-[11px] text-destructive text-center">
                    {errors.otp_code.message}
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
                    <span>Verify &amp; activate</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-0 pt-0 pb-5 px-6">
            <Separator className="mb-4" />
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isResending}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline underline-offset-4 disabled:opacity-50 disabled:no-underline transition-opacity"
              >
                {isResending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
