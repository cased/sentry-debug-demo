import { NextResponse } from "next/server";

function generateRevenueData() {
  const categories = [
    { name: "Subscriptions", baseRevenue: 45000 },
    { name: "One-time", baseRevenue: 12000 },
    { name: "Enterprise", baseRevenue: 78000 },
    { name: "Add-ons", baseRevenue: 8500 },
  ];

  return {
    categories: categories.map((cat) => ({
      name: cat.name,
      revenue: cat.baseRevenue + Math.floor(Math.random() * 5000),
      yoy_growth: Math.random() * 30 - 5, // -5% to +25%
    })),
  };
}

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 250));

  const data = generateRevenueData();

  return NextResponse.json(data);
}
