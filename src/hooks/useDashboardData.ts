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

  // BUG 4: Race condition setup - these track parallel requests without proper coordination
  // When "Refresh All" is clicked rapidly, multiple requests fire and responses arrive out of order
  let currentRequestId = 0;

  const fetchData = useCallback(async () => {
    // BUG 4: This requestId is captured in closure but currentRequestId keeps incrementing
    // leading to race conditions where old requests overwrite newer data
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

      // BUG 4: Parallel fetches without proper coordination
      // When refresh is clicked rapidly, these promises resolve in unpredictable order
      const [metricsRes, revenueRes, activityRes] = await Promise.all([
        fetch(`/api/metrics?start=${startStr}&end=${endStr}&empty=${forceEmpty}`),
        fetch("/api/revenue"),
        fetch("/api/activity"),
      ]);

      // BUG 4: By the time we get here, currentRequestId may have changed
      // but we don't check if this is still the latest request
      // This can cause stale data to overwrite fresh data

      if (!metricsRes.ok || !revenueRes.ok || !activityRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [rawMetrics, rawRevenue, rawActivity] = await Promise.all([
        metricsRes.json(),
        revenueRes.json(),
        activityRes.json(),
      ]);

      // BUG 4: No check like `if (requestId !== currentRequestId) return;`
      // Old responses can overwrite newer ones

      // Transform data (Bug 1 triggers here on empty data)
      const metricsResult = transformMetrics(rawMetrics);
      const metrics: MetricDataPoint[] = metricsResult?.data ?? [];

      // Bug 3 cascades through here when useCustomConfig is true
      const multiplier = getRevenueMultiplier(filters.useCustomConfig);
      const revenue: RevenueDataPoint[] = transformRevenue(rawRevenue, multiplier);

      const activity: ActivityItem[] = transformActivity(rawActivity);

      // Bug 5: filterMetricsByDateRange has off-by-one error
      const filteredMetrics = filterMetricsByDateRange(metrics, filters.dateRange);

      const summary = calculateSummary(filteredMetrics, revenue);

      // BUG 4: This setState happens even if a newer request has already started
      // causing data mismatches and incorrect totals
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
    // BUG 2: Missing `filters` in dependency array
    // This causes stale closure - when filters change rapidly,
    // the callback still uses old filter values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceEmpty, refreshCounter]);

  // BUG 2: The effect depends on fetchData which doesn't include filters
  // So when filters change, this effect won't re-run with the new values
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
