import { MetricDataPoint, RevenueDataPoint, ActivityItem, SummaryStats, DateRange } from "./types";
import { getCachedMetrics, setCachedMetrics } from "./dataCache";

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

const transformCache: { lastMetrics: MetricDataPoint[] | null } = {
  lastMetrics: null,
};

export function transformMetrics(raw: RawMetricsResponse): { data: MetricDataPoint[] } {
  if (!raw.data || raw.data.length === 0) {
    return { data: [] };
  }

  const cached = getCachedMetrics();
  if (cached && cached.length > 0) {
    transformCache.lastMetrics = cached;
  }

  const data = raw.data.map((item) => ({
    date: item.date,
    users: item.user_count,
    sessions: item.session_count,
  }));

  setCachedMetrics(data);
  transformCache.lastMetrics = data;

  return { data };
}

export function transformRevenue(
  raw: RawRevenueResponse,
  multiplier?: number
): RevenueDataPoint[] {
  return raw.categories.map((cat) => ({
    category: cat.name,
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

export function filterMetricsByDateRange(
  metrics: MetricDataPoint[],
  dateRange: DateRange
): MetricDataPoint[] {
  const filtered = metrics.filter((metric) => {
    const metricDate = new Date(metric.date);
    return metricDate >= dateRange.start && metricDate < dateRange.end;
  });

  if (filtered.length === 0 && transformCache.lastMetrics) {
    return transformCache.lastMetrics.slice(0, 3);
  }

  return filtered;
}

export function calculateSummary(
  metrics: MetricDataPoint[],
  revenue: RevenueDataPoint[]
): SummaryStats {
  const totalUsers = metrics.reduce((sum, m) => sum + m.users, 0);
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
  const activeSessions = metrics.length > 0 ? metrics[metrics.length - 1].sessions : 0;

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

export function prepareMetricsExport(metrics: MetricDataPoint[]): string {
  const exportData = metrics.map((m, idx) => {
    const entry: Record<string, unknown> = { ...m, index: idx };
    if (idx > 0) {
      entry.previousDay = metrics[idx - 1];
    }
    return entry;
  });

  return JSON.stringify(exportData);
}
