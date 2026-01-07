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

const COLORS = ["#404040", "#737373", "#a3a3a3", "#d4d4d4"];

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((point) => {
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
    <div className="bg-neutral-50 border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">
        Revenue by Category
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
            <XAxis
              dataKey="category"
              stroke="#737373"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#737373"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fafafa",
                border: "1px solid #d4d4d4",
              }}
              formatter={(value) => [`$${(value as number).toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="amount">
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
