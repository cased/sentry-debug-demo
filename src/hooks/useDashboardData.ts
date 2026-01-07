"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { getCachedMetrics, setCachedRevenue, invalidateCache } from "@/lib/dataCache";
import { initializeFormatters } from "@/lib/formatters";

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  loadEmptyDataset: () => void;
}

const pendingRequests = new Map<string, Promise<any>>();

export function useDashboardData(filters: DashboardFilters): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [forceEmpty, setForceEmpty] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const requestIdRef = useRef(0);
  const lastFiltersRef = useRef<DashboardFilters | null>(null);

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;

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

      const metricsKey = `metrics-${startStr}-${endStr}-${forceEmpty}`;
      let metricsDataPromise = pendingRequests.get(metricsKey);
      if (!metricsDataPromise) {
        metricsDataPromise = fetch(`/api/metrics?start=${startStr}&end=${endStr}&empty=${forceEmpty}`)
          .then(async (res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch metrics data");
            }
            return res.json();
          });
        pendingRequests.set(metricsKey, metricsDataPromise);
      }

      const [rawMetrics, revenueRes, activityRes] = await Promise.all([
        metricsDataPromise,
        fetch("/api/revenue"),
        fetch("/api/activity"),
      ]);

      pendingRequests.delete(metricsKey);

      if (!revenueRes.ok || !activityRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [rawRevenue, rawActivity] = await Promise.all([
        revenueRes.json(),
        activityRes.json(),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      const metricsResult = transformMetrics(rawMetrics);
      let metrics: MetricDataPoint[] = metricsResult.data;

      if (metrics.length === 0) {
        const cached = getCachedMetrics();
        if (cached) {
          metrics = cached;
        }
      }

      const multiplier = getRevenueMultiplier(filters.useCustomConfig);
      const revenue: RevenueDataPoint[] = transformRevenue(rawRevenue, multiplier);
      setCachedRevenue(revenue);

      const activity: ActivityItem[] = transformActivity(rawActivity);

      const filteredMetrics = filterMetricsByDateRange(metrics, filters.dateRange);

      const summary = calculateSummary(filteredMetrics, revenue);

      lastFiltersRef.current = filters;

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
  }, [filters, forceEmpty, refreshCounter]);

  useEffect(() => {
    initializeFormatters();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    Sentry.addBreadcrumb({
      category: "dashboard",
      message: "Manual refresh triggered",
      level: "info",
    });
    invalidateCache();
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
