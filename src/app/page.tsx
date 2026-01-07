"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardFilters } from "@/lib/types";
import { DashboardControls } from "@/components/DashboardControls";
import { SummaryCards } from "@/components/SummaryCards";
import { UserMetricsChart } from "@/components/UserMetricsChart";
import { RevenueChart } from "@/components/RevenueChart";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    useCustomConfig: false,
  });

  const { data, loading, error, refresh, loadEmptyDataset } = useDashboardData(filters);

  if (error) {
    Sentry.captureException(error);
    return (
      <div className="min-h-screen bg-neutral-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-neutral-50 border border-neutral-300 p-6">
            <h2 className="text-lg font-semibold text-neutral-800">Error Loading Dashboard</h2>
            <p className="mt-2 text-neutral-600">{error.message}</p>
            <button
              onClick={refresh}
              className="mt-4 px-4 py-2 bg-neutral-700 text-white hover:bg-neutral-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-neutral-800">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sentry Test App
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <DashboardControls
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={refresh}
          onLoadEmpty={loadEmptyDataset}
        />

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-400"></div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <SummaryCards data={data.summary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorBoundary>
                <UserMetricsChart data={data.metrics} />
              </ErrorBoundary>
              <ErrorBoundary>
                <RevenueChart data={data.revenue} />
              </ErrorBoundary>
            </div>

            <ActivityFeed data={data.activity} />
          </div>
        ) : null}

        <div className="mt-8 bg-neutral-50 border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-700">Test Actions</h3>
          <ul className="mt-2 text-sm text-neutral-600 space-y-1">
            <li>Load Empty Dataset</li>
            <li>Change date range rapidly</li>
            <li>Toggle Use Custom Config</li>
            <li>Click Refresh All repeatedly</li>
            <li>Select Today date range</li>
            <li>Navigate to user details</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
