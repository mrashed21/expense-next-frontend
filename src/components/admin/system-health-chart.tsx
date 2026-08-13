"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const [data, setData] = useState<HealthData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchHealth = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://expense-tracker-bb-backend.vercel.app/api/v1";
        const res = await fetch(`${apiUrl}/admin/system-health`, {
          credentials: "include",
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setIsConnected(true);

            const newData: HealthData = {
              time: json.data.time || new Date().toISOString(),
              memoryUsage:
                json.data.memoryUsage ||
                (
                  ((json.data.usedMemory || 0) / (json.data.totalMemory || 1)) *
                  100
                ).toFixed(2) ||
                "0.00",
              cpuUsage:
                json.data.cpuUsage ||
                (json.data.loadAvg?.[0] || 0).toFixed(2) ||
                "0.00",
              uptime: json.data.uptime || 0,
            };

            if (isMounted) {
              setData((prevData) => {
                const updatedData = [...prevData, newData];
                if (updatedData.length > 30) {
                  updatedData.shift();
                }
                return updatedData;
              });
            }
          }
        } else {
          if (isMounted) setIsConnected(false);
        }
      } catch (err) {
        if (isMounted) setIsConnected(false);
      }
    };

    // Poll every 5 seconds
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
        {isConnected ? (
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

        <div className="h-[300px] w-full mt-4">
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
