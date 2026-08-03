"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RootState } from "@/redux/store";
import { useBroadcastNotificationMutation } from "@/services/adminApi";
import { Megaphone, ShieldAlert, Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormSelect from "@/components/custom/form-select";

const broadcastSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(50),
  message: z.string().min(5, "Message must be at least 5 characters").max(200),
  type: z.enum(["info", "success", "warning", "error", "alert"]),
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;

export default function BroadcastPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && user.user_role !== "super_admin") {
      router.replace("/admin");
    }
  }, [user, router]);

  const [broadcast, { isLoading }] = useBroadcastNotificationMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      type: "info",
    },
  });

  const onSubmit = async (data: BroadcastFormValues) => {
    try {
      const response = await broadcast(data).unwrap();
      toast.success(response.message || "Broadcast sent successfully.");
      reset();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send broadcast");
    }
  };

  if (!user || user.user_role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">
          Only Super Administrators can send broadcast notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Megaphone className="w-8 h-8 text-primary" />
          Broadcast Notification
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send a real-time notification to all active users on the platform.
        </p>
      </div>

      <Card className="p-6 border border-border">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              placeholder="e.g. Scheduled Maintenance"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Notification Message</Label>
            <textarea
              id="message"
              rows={4}
              placeholder="Provide details about the announcement..."
              {...register("message")}
              className={`flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.message
                  ? "border-destructive focus-visible:ring-destructive"
                  : "border-input focus-visible:ring-ring"
              }`}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notification Type</Label>
            <FormSelect
              control={control}
              name="type"
              options={[
                { label: "Information (Blue)", value: "info" },
                { label: "Success (Green)", value: "success" },
                { label: "Warning (Yellow)", value: "warning" },
                { label: "Alert (Red)", value: "alert" },
              ]}
              placeholder="Select notification type"
            />
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to All Active Users
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
