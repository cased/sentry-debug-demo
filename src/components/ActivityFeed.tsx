"use client";

import Link from "next/link";
import { ActivityItem } from "@/lib/types";
import { setCachedActivity } from "@/lib/dataCache";
import { useEffect } from "react";

interface ActivityFeedProps {
  data: ActivityItem[];
}

const statusStyles = {
  success: "bg-neutral-200 text-neutral-700",
  warning: "bg-neutral-300 text-neutral-700",
  error: "bg-neutral-400 text-neutral-800",
};

const actionLabels: Record<string, string> = {
  login: "Logged in",
  purchase: "Made a purchase",
  view_report: "Viewed report",
  export_data: "Exported data",
  update_settings: "Updated settings",
  invite_user: "Invited user",
};

export function ActivityFeed({ data }: ActivityFeedProps) {
  useEffect(() => {
    setCachedActivity(data);
  }, [data]);

  return (
    <div className="bg-neutral-50 border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h2>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {data.slice(0, 10).map((item) => (
              <tr key={item.id} className="hover:bg-neutral-100">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500">
                  {new Date(item.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/user/${encodeURIComponent(item.user)}`}
                    className="text-neutral-800 hover:text-neutral-600 underline"
                  >
                    {item.user}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                  {actionLabels[item.action] || item.action}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
