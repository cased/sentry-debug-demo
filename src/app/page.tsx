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
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h2>
            <p className="mt-2 text-red-600">{error.message}</p>
            <button
              onClick={refresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sentry Debug Demo - Trigger bugs to test error tracking
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <SummaryCards data={data.summary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserMetricsChart data={data.metrics} />
              <RevenueChart data={data.revenue} />
            </div>

            <ActivityFeed data={data.activity} />
          </div>
        ) : null}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800">Bug Triggers</h3>
          <ul className="mt-2 text-sm text-yellow-700 space-y-1">
            <li><strong>Bug 1:</strong> Click &quot;Load Empty Dataset&quot; - causes chart crash</li>
            <li><strong>Bug 2:</strong> Change date range rapidly - causes stale data</li>
            <li><strong>Bug 3:</strong> Toggle &quot;Use Custom Config&quot; - causes toFixed error</li>
            <li><strong>Bug 4:</strong> Click &quot;Refresh All&quot; repeatedly - causes race condition</li>
            <li><strong>Bug 5:</strong> Select &quot;Today&quot; date range - causes off-by-one error</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
