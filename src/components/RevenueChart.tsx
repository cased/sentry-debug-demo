"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { RevenueDataPoint } from "@/lib/types";

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export function RevenueChart({ data }: RevenueChartProps) {
  // BUG 3 surfaces here: When amount is NaN (from undefined multiplier),
  // the validation below throws an error
  // The root cause is in config.ts returning undefined for REVENUE_MULTIPLIER

  const chartData = data.map((point) => {
    // BUG 3: This validation throws when amount is NaN due to undefined multiplier
    if (isNaN(point.amount)) {
      throw new Error(`Invalid revenue amount for category: ${point.category}`);
    }
    return {
      category: point.category,
      amount: point.amount,
      formattedAmount: `$${point.amount.toFixed(2)}`,
      growth: point.growth,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Revenue by Category
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="category"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value) => [`$${(value as number).toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
