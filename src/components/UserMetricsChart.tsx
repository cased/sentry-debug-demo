"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MetricDataPoint } from "@/lib/types";

interface UserMetricsChartProps {
  data: MetricDataPoint[];
}

export function UserMetricsChart({ data }: UserMetricsChartProps) {
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    users: point.users,
    sessions: point.sessions,
  }));

  return (
    <div className="bg-neutral-50 border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">User Metrics</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
            <XAxis
              dataKey="date"
              stroke="#737373"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#737373" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fafafa",
                border: "1px solid #d4d4d4",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#525252"
              strokeWidth={2}
              dot={false}
              name="Users"
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#a3a3a3"
              strokeWidth={2}
              dot={false}
              name="Sessions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
