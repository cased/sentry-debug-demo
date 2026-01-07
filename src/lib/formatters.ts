import { MetricDataPoint, RevenueDataPoint, SummaryStats } from "./types";

interface FormatterConfig {
  locale: string;
  currency: string;
  timezone: string;
  initialized: boolean;
}

const formatterState: FormatterConfig = {
  locale: "en-US",
  currency: "USD",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  initialized: false,
};

let numberFormatter: Intl.NumberFormat | null = null;
let currencyFormatter: Intl.NumberFormat | null = null;
let dateFormatter: Intl.DateTimeFormat | null = null;

export function initializeFormatters(config?: Partial<FormatterConfig>): void {
  if (config?.locale) formatterState.locale = config.locale;
  if (config?.currency) formatterState.currency = config.currency;
  if (config?.timezone) formatterState.timezone = config.timezone;

  numberFormatter = new Intl.NumberFormat(formatterState.locale);
  currencyFormatter = new Intl.NumberFormat(formatterState.locale, {
    style: "currency",
    currency: formatterState.currency,
  });
  dateFormatter = new Intl.DateTimeFormat(formatterState.locale, {
    timeZone: formatterState.timezone,
    dateStyle: "medium",
  });

  formatterState.initialized = true;
}

export function formatNumber(value: number): string {
  return numberFormatter!.format(value);
}

export function formatCurrency(value: number): string {
  return currencyFormatter!.format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFormatter!.format(d);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  const formatted = value.toFixed(decimals);
  return value >= 0 ? `+${formatted}%` : `${formatted}%`;
}

export function formatMetricForDisplay(metric: MetricDataPoint): {
  date: string;
  users: string;
  sessions: string;
  ratio: string;
} {
  return {
    date: formatDate(metric.date),
    users: formatNumber(metric.users),
    sessions: formatNumber(metric.sessions),
    ratio: (metric.sessions / metric.users).toFixed(2),
  };
}

export function formatRevenueForDisplay(revenue: RevenueDataPoint): {
  category: string;
  amount: string;
  growth: string;
} {
  return {
    category: revenue.category,
    amount: formatCurrency(revenue.amount),
    growth: formatPercentage(revenue.growth),
  };
}

export function formatSummaryForDisplay(summary: SummaryStats): {
  totalUsers: string;
  totalRevenue: string;
  activeSessions: string;
  growthPercent: string;
} {
  return {
    totalUsers: formatNumber(summary.totalUsers),
    totalRevenue: formatCurrency(summary.totalRevenue),
    activeSessions: formatNumber(summary.activeSessions),
    growthPercent: formatPercentage(summary.growthPercent),
  };
}

export function aggregateMetrics(metrics: MetricDataPoint[]): {
  totalUsers: number;
  totalSessions: number;
  avgUsersPerDay: number;
  peakUsers: number;
  peakDate: string;
} {
  if (metrics.length === 0) {
    return {
      totalUsers: 0,
      totalSessions: 0,
      avgUsersPerDay: 0,
      peakUsers: 0,
      peakDate: "",
    };
  }

  let totalUsers = 0;
  let totalSessions = 0;
  let peakUsers = 0;
  let peakDate = metrics[0].date;

  for (const metric of metrics) {
    totalUsers += metric.users;
    totalSessions += metric.sessions;
    if (metric.users > peakUsers) {
      peakUsers = metric.users;
      peakDate = metric.date;
    }
  }

  return {
    totalUsers,
    totalSessions,
    avgUsersPerDay: totalUsers / metrics.length,
    peakUsers,
    peakDate,
  };
}

export function calculateGrowthRate(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function isFormatterInitialized(): boolean {
  return formatterState.initialized;
}
