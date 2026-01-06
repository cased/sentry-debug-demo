import { NextRequest, NextResponse } from "next/server";

function generateMetricsData(startDate: Date, endDate: Date, empty: boolean = false) {
  if (empty) {
    return { data: [] };
  }

  const data = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    data.push({
      date: currentDate.toISOString().split("T")[0],
      user_count: Math.floor(Math.random() * 1000) + 500,
      session_count: Math.floor(Math.random() * 2000) + 1000,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { data };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const empty = searchParams.get("empty") === "true";
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  // Default to last 7 days
  const endDate = endParam ? new Date(endParam) : new Date();
  const startDate = startParam
    ? new Date(startParam)
    : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

  const data = generateMetricsData(startDate, endDate, empty);

  return NextResponse.json(data);
}
