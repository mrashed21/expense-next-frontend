"use client";

import { PasswordStrength } from "@/components/auth/password-strength";
import PhonesInput from "@/components/custom/phone-input";
import { SearchableSelect } from "@/components/custom/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { bangladeshCities, cityAreas } from "@/lib/location-data";
import { RootState } from "@/redux/store";
import { useRegisterMutation } from "@/services/auth-api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

const registerSchema = z
  .object({
    user_name: z.string().min(2, "Name must be at least 2 characters"),
    user_email: z.string().email("Please enter a valid email address"),
    user_password: passwordSchema,
    user_confirm_password: z.string(),
    user_phone: z.string().optional(),
    user_city: z.string().optional(),
    user_area: z.string().optional(),
    user_country: z.string().optional(),
  })
  .refine((data) => data.user_password === data.user_confirm_password, {
    message: "Passwords do not match",
    path: ["user_confirm_password"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const [registerApi, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const selectedCity = watch("user_city");
  const currentPassword = watch("user_password");

  useEffect(() => {
    if (!selectedCity) return;
    const currentArea = getValues("user_area");
    if (currentArea && !(cityAreas[selectedCity] || []).includes(currentArea)) {
      setValue("user_area", "");
    }
  }, [selectedCity, getValues, setValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const payload = { ...data, user_country: "Bangladesh" };
      const response: any = await registerApi(payload).unwrap();
      if (response.success) {
        toast.success("Account created! Enter the OTP sent to your email.");
        router.push(`/verify-otp?email=${encodeURIComponent(data.user_email)}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to register account.");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details to get started with Expense Tracker
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-medium text-foreground"
                >
                  Full name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="name"
                    {...register("user_name")}
                    type="text"
                    placeholder="Muhammad Rashed"
                    className="pl-9 h-9 text-sm bg-background border-input hover:border-primary/50 transition-colors focus-visible:ring-primary/20"
                  />
                </div>
                {errors.user_name && (
                  <p className="text-[11px] text-destructive">
                    {errors.user_name.message}
                  </p>
                )}
              </div>

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
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="password"
                    {...register("user_password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className="pl-9 pr-9 h-9 text-sm bg-background border-input hover:border-primary/50 transition-colors focus-visible:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                {errors.user_password && (
                  <p className="text-[11px] text-destructive">
                    {errors.user_password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm_password"
                  className="text-xs font-medium text-foreground"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="confirm_password"
                    {...register("user_confirm_password")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9 h-9 text-sm bg-background border-input hover:border-primary/50 transition-colors focus-visible:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.user_confirm_password && (
                  <p className="text-[11px] text-destructive">
                    {errors.user_confirm_password.message}
                  </p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-medium text-foreground"
                >
                  Phone{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <div className="relative">
                  <Controller
                    name="user_phone"
                    control={control}
                    render={({ field }) => (
                      <PhonesInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              {/* City & Area */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    City (Bangladesh)
                  </Label>
                  <Controller
                    name="user_city"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={bangladeshCities.map(city => ({ label: city, value: city }))}
                        value={field.value || undefined}
                        onChange={(value) => {
                          field.onChange(value);
                          // Auto reset area when city changes if area is no longer valid
                          // But to keep it simple, just update the value
                        }}
                        placeholder="Select City"
                      />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Area
                  </Label>
                  <Controller
                    name="user_area"
                    control={control}
                    render={({ field }) => {
                      const availableAreas =
                        selectedCity && cityAreas[selectedCity]
                          ? cityAreas[selectedCity]
                          : [];

                      return (
                        <SearchableSelect
                          options={availableAreas.map(area => ({ label: area, value: area }))}
                          value={field.value || undefined}
                          onChange={field.onChange}
                          placeholder={
                            selectedCity ? "Select Area" : "Select City first"
                          }
                          disabled={!selectedCity}
                        />
                      );
                    }}
                  />
                </div>
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
                    <span>Create account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex-col gap-0 pt-6 p-0 mt-6">
              <Separator className="mb-4 bg-border/50" />
              <p className="text-xs text-muted-foreground text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </div>
    </div>
  );
}
