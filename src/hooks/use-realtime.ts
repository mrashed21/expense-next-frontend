import { apiSlice } from "@/services/api-slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Ably from "ably";
import { useEffect } from "react";
import { toast } from "sonner";

const ablyClient = typeof window !== "undefined" && process.env.NEXT_PUBLIC_ABLY_KEY
  ? new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_KEY })
  : null;

export const useRealtime = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user?._id) return;

    if (!ablyClient) return;

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
      // Refresh notifications list
      dispatch(apiSlice.util.invalidateTags(["Notifications"]));
    };

    channel.subscribe("new_notification", onNotification);

    return () => {
      channel.unsubscribe("new_notification", onNotification);
    };
  }, [user?._id, dispatch]);
};
