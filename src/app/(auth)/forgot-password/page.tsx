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
import { useForgotPasswordMutation } from "@/services/auth-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const forgotSchema = z.object({
  user_email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [forgotPasswordApi, { isLoading }] = useForgotPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    try {
      const response: any = await forgotPasswordApi(data).unwrap();
      if (response.success) {
        toast.success("Password reset code sent to your email!");
        setSubmittedEmail(data.user_email);
        setIsSuccess(true);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to process request.");
    }
  };

  return (
    <>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Forgot password?
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-60">
            No worries, we&apos;ll send you reset instructions
          </p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Reset your password
            </CardTitle>
            <CardDescription className="text-xs">
              Enter the email address associated with your account
            </CardDescription>
          </CardHeader>

          {!isSuccess ? (
            <>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        className="pl-9 h-9 text-sm bg-secondary/40 border-border/60"
                      />
                    </div>
                    {errors.user_email && (
                      <p className="text-[11px] text-destructive">
                        {errors.user_email.message}
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
                        <span>Send reset code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex-col gap-0 pt-0 pb-5 px-6">
                <Separator className="mb-4" />
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to sign in
                </Link>
              </CardFooter>
            </>
          ) : (
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Check your email</h3>
                  <p className="text-xs text-muted-foreground">
                    We sent a password reset link to <br />
                    <span className="font-medium text-foreground">
                      {submittedEmail}
                    </span>
                  </p>
                </div>
                <Button
                  className="w-full h-9 text-sm font-medium mt-4"
                  onClick={() =>
                    router.push(
                      `/reset-password?email=${encodeURIComponent(submittedEmail)}`,
                    )
                  }
                >
                  Enter Reset Code
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
