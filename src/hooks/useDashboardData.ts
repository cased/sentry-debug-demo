"use client";

import { useState, useEffect, useCallback } from "react";
import * as Sentry from "@sentry/nextjs";
import {
  DashboardData,
  DashboardFilters,
  MetricDataPoint,
  RevenueDataPoint,
  ActivityItem,
} from "@/lib/types";
import {
  transformMetrics,
  transformRevenue,
  transformActivity,
  filterMetricsByDateRange,
  calculateSummary,
} from "@/lib/transformers";
import { getRevenueMultiplier } from "@/lib/config";

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  loadEmptyDataset: () => void;
}

export function useDashboardData(filters: DashboardFilters): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [forceEmpty, setForceEmpty] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  let currentRequestId = 0;

  const fetchData = useCallback(async () => {
    const requestId = ++currentRequestId;

    Sentry.addBreadcrumb({
      category: "dashboard",
      message: "Fetching dashboard data",
      data: { filters, forceEmpty, requestId },
      level: "info",
    });

    setLoading(true);
    setError(null);

    try {
      const startStr = filters.dateRange.start.toISOString().split("T")[0];
      const endStr = filters.dateRange.end.toISOString().split("T")[0];

      const [metricsRes, revenueRes, activityRes] = await Promise.all([
        fetch(`/api/metrics?start=${startStr}&end=${endStr}&empty=${forceEmpty}`),
        fetch("/api/revenue"),
        fetch("/api/activity"),
      ]);

      if (!metricsRes.ok || !revenueRes.ok || !activityRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [rawMetrics, rawRevenue, rawActivity] = await Promise.all([
        metricsRes.json(),
        revenueRes.json(),
        activityRes.json(),
      ]);

      const metricsResult = transformMetrics(rawMetrics);
      const metrics: MetricDataPoint[] = metricsResult.data;

      const multiplier = getRevenueMultiplier(filters.useCustomConfig);
      const revenue: RevenueDataPoint[] = transformRevenue(rawRevenue, multiplier);

      const activity: ActivityItem[] = transformActivity(rawActivity);

      const filteredMetrics = filterMetricsByDateRange(metrics, filters.dateRange);

      const summary = calculateSummary(filteredMetrics, revenue);

      setData({
        metrics: filteredMetrics,
        revenue,
        activity,
        summary,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceEmpty, refreshCounter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    Sentry.addBreadcrumb({
      category: "dashboard",
      message: "Manual refresh triggered",
      level: "info",
    });
    setRefreshCounter((c) => c + 1);
  }, []);

  const loadEmptyDataset = useCallback(() => {
    Sentry.addBreadcrumb({
      category: "dashboard",
      message: "Loading empty dataset",
      level: "info",
    });
    setForceEmpty(true);
  }, []);

  return { data, loading, error, refresh, loadEmptyDataset };
}
