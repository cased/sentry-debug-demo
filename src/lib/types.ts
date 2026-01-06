export interface MetricDataPoint {
  date: string;
  users: number;
  sessions: number;
}

export interface RevenueDataPoint {
  category: string;
  amount: number;
  growth: number;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: "success" | "warning" | "error";
}

export interface SummaryStats {
  totalUsers: number;
  totalRevenue: number;
  activeSessions: number;
  growthPercent: number;
}

export interface DashboardData {
  metrics: MetricDataPoint[];
  revenue: RevenueDataPoint[];
  activity: ActivityItem[];
  summary: SummaryStats;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardFilters {
  dateRange: DateRange;
  useCustomConfig: boolean;
}
