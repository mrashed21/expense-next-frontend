import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { RootState } from "../redux/store";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) return; // Only connect if authenticated

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current?.id);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socketRef.current.on("error", (error) => {
        console.error("Socket general error:", error);
      });

      socketRef.current.on("new_notification", (data: any) => {
        // Show real-time notification toast
        toast.info(`🔔 ${data.title}`, {
          description: data.message,
        });
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  return socketRef.current;
};
