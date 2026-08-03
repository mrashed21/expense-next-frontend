import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { RootState } from "../redux/store";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5005";

let globalSocket: Socket | null = null;
let subscriberCount = 0;

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(globalSocket);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) return; // Only connect if authenticated

    subscriberCount++;

    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        withCredentials: true,
      });

      globalSocket.on("connect", () => {
        console.log("Socket connected:", globalSocket?.id);
      });

      globalSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      globalSocket.on("error", (error) => {
        console.error("Socket general error:", error);
      });

      globalSocket.on("new_notification", (data: any) => {
        // Show real-time notification toast
        toast.info(`🔔 ${data.title}`, {
          description: data.message,
        });
      });
      
      setSocket(globalSocket);
    } else {
      setSocket(globalSocket);
    }

    return () => {
      subscriberCount--;
      if (subscriberCount === 0 && globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
    };
  }, [user]);

  return socket;
};
