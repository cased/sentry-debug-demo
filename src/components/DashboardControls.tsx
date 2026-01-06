"use client";

import * as Sentry from "@sentry/nextjs";
import { DashboardFilters, DateRange } from "@/lib/types";
import { Switch } from "@base-ui/react/switch";

interface DashboardControlsProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  onLoadEmpty: () => void;
}

export function DashboardControls({
  filters,
  onFiltersChange,
  onRefresh,
  onLoadEmpty,
}: DashboardControlsProps) {
  const handleDateRangeChange = (preset: string) => {
    Sentry.addBreadcrumb({
      category: "ui",
      message: `Date range changed to ${preset}`,
      level: "info",
    });

    const end = new Date();
    let start: Date;

    switch (preset) {
      case "7d":
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "14d":
        start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "today":
        // BUG 5 trigger: Setting end to today exposes the off-by-one error
        start = new Date(end);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const newDateRange: DateRange = { start, end };
    onFiltersChange({ ...filters, dateRange: newDateRange });
  };

  const handleConfigToggle = (checked: boolean) => {
    Sentry.addBreadcrumb({
      category: "ui",
      message: `Custom config ${checked ? "enabled" : "disabled"}`,
      level: "info",
    });

    onFiltersChange({ ...filters, useCustomConfig: checked });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Date Range:</span>
          <div className="flex gap-1">
            {[
              { value: "today", label: "Today" },
              { value: "7d", label: "7 Days" },
              { value: "14d", label: "14 Days" },
              { value: "30d", label: "30 Days" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value)}
                className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium text-gray-700">
              Use Custom Config
            </span>
            <Switch.Root
              checked={filters.useCustomConfig}
              onCheckedChange={handleConfigToggle}
              className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors data-[checked]:bg-blue-600"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-x-0.5 data-[checked]:translate-x-[22px]" />
            </Switch.Root>
          </label>

          <button
            onClick={onLoadEmpty}
            className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors"
          >
            Load Empty Dataset
          </button>

          <button
            onClick={onRefresh}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh All
          </button>
        </div>
      </div>
    </div>
  );
}
