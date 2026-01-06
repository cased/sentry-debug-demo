import { MetricDataPoint, RevenueDataPoint, ActivityItem, SummaryStats, DateRange } from "./types";

interface RawMetricsResponse {
  data: Array<{
    date: string;
    user_count: number;
    session_count: number;
  }>;
}

interface RawRevenueResponse {
  categories: Array<{
    name: string;
    revenue: number;
    yoy_growth: number;
  }>;
}

interface RawActivityResponse {
  events: Array<{
    event_id: string;
    created_at: string;
    username: string;
    event_type: string;
    result: string;
  }>;
}

// BUG 1: When API returns empty array, this returns wrong shape
// Instead of returning { data: [] }, it returns undefined
// This causes "Cannot read property 'map' of undefined" in UserMetricsChart
export function transformMetrics(raw: RawMetricsResponse): { data: MetricDataPoint[] } {
  // BUG: No check for empty array - returns undefined instead of { data: [] }
  if (!raw.data || raw.data.length === 0) {
    // Should return { data: [] } but returns undefined
    return undefined as unknown as { data: MetricDataPoint[] };
  }

  return {
    data: raw.data.map((item) => ({
      date: item.date,
      users: item.user_count,
      sessions: item.session_count,
    })),
  };
}

export function transformRevenue(
  raw: RawRevenueResponse,
  multiplier?: number
): RevenueDataPoint[] {
  return raw.categories.map((cat) => ({
    category: cat.name,
    // BUG 3 continues: multiplier can be undefined, causing amount to be NaN
    // which then fails when calling .toFixed() in RevenueChart
    amount: cat.revenue * (multiplier as number),
    growth: cat.yoy_growth,
  }));
}

export function transformActivity(raw: RawActivityResponse): ActivityItem[] {
  return raw.events.map((event) => ({
    id: event.event_id,
    timestamp: event.created_at,
    user: event.username,
    action: event.event_type,
    status: event.result as ActivityItem["status"],
  }));
}

// BUG 5: Off-by-one error in date filtering
// Uses < instead of <= for end date, missing the last day
export function filterMetricsByDateRange(
  metrics: MetricDataPoint[],
  dateRange: DateRange
): MetricDataPoint[] {
  return metrics.filter((metric) => {
    const metricDate = new Date(metric.date);
    // BUG: Should be <= for end date, but uses <
    // This causes the last day of the range to be excluded
    return metricDate >= dateRange.start && metricDate < dateRange.end;
  });
}

export function calculateSummary(
  metrics: MetricDataPoint[],
  revenue: RevenueDataPoint[]
): SummaryStats {
  const totalUsers = metrics.reduce((sum, m) => sum + m.users, 0);
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
  const activeSessions = metrics.length > 0 ? metrics[metrics.length - 1].sessions : 0;

  // Calculate growth (comparing last two data points)
  let growthPercent = 0;
  if (metrics.length >= 2) {
    const current = metrics[metrics.length - 1].users;
    const previous = metrics[metrics.length - 2].users;
    growthPercent = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }

  return {
    totalUsers,
    totalRevenue,
    activeSessions,
    growthPercent,
  };
}
