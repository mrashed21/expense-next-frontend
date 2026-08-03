"use client";

import { apiSlice } from "@/services/apiSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { RootState } from "../redux/store";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5005";

let globalSocket: Socket | null = null;
let subscriberCount = 0;

/**
 * Singleton socket hook — connects once per authenticated session.
 * Joins the user's private room so the backend can send targeted events.
 * On `new_notification`: shows a toast and invalidates RTK Notifications cache.
 */
export const useSocket = (): Socket | null => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?._id) return;

    const userId = user._id as string;
    subscriberCount++;

    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        withCredentials: true,
        auth: { userId },
      });

      globalSocket.on("connect", () => {
        console.log("[Socket] Connected:", globalSocket?.id);
      });

      globalSocket.on("connect_error", (error) => {
        console.error("[Socket] Connection error:", error.message);
      });

      globalSocket.on("new_notification", (data: { title: string; message: string }) => {
        toast.info(`🔔 ${data.title}`, { description: data.message });
        dispatch(apiSlice.util.invalidateTags(["Notifications"]));
      });
    }

    return () => {
      subscriberCount--;
      if (subscriberCount === 0 && globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
    };
  }, [user?._id, dispatch]);

  return globalSocket;
};
