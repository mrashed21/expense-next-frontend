"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSocket } from "@/hooks/useSocket";
import { Activity, Cpu, HardDrive } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface HealthData {
  time: string;
  memoryUsage: string;
  cpuUsage: string;
  uptime: number;
}

export function SystemHealthChart() {
  const socket = useSocket();
  const [data, setData] = useState<HealthData[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("system_health_update", (newData: HealthData) => {
      setData((prevData) => {
        // Keep only the last 30 data points for a smooth rolling window
        const updatedData = [...prevData, newData];
        if (updatedData.length > 30) {
          updatedData.shift();
        }
        return updatedData;
      });
    });

    return () => {
      socket.off("system_health_update");
    };
  }, [socket]);

  // Format time for X-axis
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  const currentData = data.length > 0 ? data[data.length - 1] : null;

  return (
    <Card className="col-span-full shadow-lg border-border overflow-hidden relative bg-card">
      <div className="absolute top-0 right-0 p-4 flex gap-2">
        {socket?.connected ? (
          <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Live
          </span>
        ) : (
          <span className="flex items-center text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
            Disconnected
          </span>
        )}
      </div>

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="w-5 h-5 text-primary" />
          Real-time System Health
        </CardTitle>
        <CardDescription>
          Live telemetry from the backend server
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col border border-border rounded-lg p-3 bg-secondary/20">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3 h-3" /> CPU Load
            </span>
            <span className="text-2xl font-bold text-foreground mt-1">
              {currentData ? `${currentData.cpuUsage}%` : "0.00%"}
            </span>
          </div>
          <div className="flex flex-col border border-border rounded-lg p-3 bg-secondary/20">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> Memory Usage
            </span>
            <span className="text-2xl font-bold text-foreground mt-1">
              {currentData ? `${currentData.memoryUsage}%` : "0.00%"}
            </span>
          </div>
        </div>

        <div className="h-75 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis
                dataKey="time"
                tickFormatter={formatTime}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6b7280" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6b7280" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                }}
                itemStyle={{ color: "var(--foreground)" }}
                labelFormatter={(label) => formatTime(label as string)}
              />
              <Area
                type="monotone"
                dataKey="cpuUsage"
                name="CPU (%)"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCpu)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="memoryUsage"
                name="Memory (%)"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMemory)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
