import { RootState } from "@/redux/store";
import { apiSlice } from "@/services/api-slice";
import Ably from "ably";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const ablyClient =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_ABLY_KEY
    ? new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_KEY })
    : null;

export const useRealtime = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user?._id) return;

    if (!ablyClient) {
      console.warn(
        "[Realtime] Disabled: NEXT_PUBLIC_ABLY_KEY is not set. Notifications will only appear after a refetch.",
      );
      return;
    }

    const channelName = `user:${user._id}`;
    const channel = ablyClient.channels.get(channelName);

    const onNotification = (msg: Ably.Message) => {
      const data = msg.data;
      if (data.type === "success") {
        toast.success(`🔔 ${data.title}`, { description: data.message });
      } else if (data.type === "error") {
        toast.error(`🚨 ${data.title}`, { description: data.message });
      } else {
        toast.info(`🔔 ${data.title}`, { description: data.message });
      }

      dispatch(apiSlice.util.invalidateTags(["Notifications"]));
    };

    channel.subscribe("new_notification", onNotification);

    let adminChannel: any = null;

    if (user.isAdmin) {
      adminChannel = ablyClient.channels.get("admin_room");

      const onAdminFeedback = (msg: Ably.Message) => {
        toast.info("New Feedback Received", {
          description: "A user just submitted feedback.",
        });
        dispatch(apiSlice.util.invalidateTags(["Feedbacks"] as any));
      };

      const onAdminReview = (msg: Ably.Message) => {
        toast.info("New Review Received", {
          description: "A user just submitted a review.",
        });
        dispatch(apiSlice.util.invalidateTags(["Reviews"] as any));
      };

      adminChannel.subscribe("new_feedback", onAdminFeedback);
      adminChannel.subscribe("new_review", onAdminReview);
    }

    return () => {
      channel.unsubscribe("new_notification", onNotification);
      if (adminChannel) {
        adminChannel.unsubscribe();
      }
    };
  }, [user?._id, user?.isAdmin, dispatch]);
};
