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
  // BUG 1 surfaces here: When transformMetrics returns undefined for empty data,
  // data prop becomes undefined, and calling .map() below crashes with
  // "Cannot read property 'map' of undefined"

  // Format data for the chart
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    users: point.users,
    sessions: point.sessions,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">User Metrics</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Users"
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#10b981"
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
