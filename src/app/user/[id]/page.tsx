"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import {
  getCachedActivity,
  getCachedUserProfile,
  setCachedUserProfile,
  buildUserProfile,
  UserProfile,
} from "@/lib/dataCache";
import {
  formatDate,
  formatNumber,
  isFormatterInitialized,
  initializeFormatters,
} from "@/lib/formatters";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        let cached = getCachedUserProfile(userId);

        if (!cached) {
          const activity = getCachedActivity();

          if (!activity) {
            const response = await fetch("/api/activity");
            if (!response.ok) {
              throw new Error("Failed to fetch activity data");
            }
            const data = await response.json();

            const username = decodeURIComponent(userId);
            cached = buildUserProfile(userId, username, data.events);
            setCachedUserProfile(userId, cached);
          } else {
            const username = decodeURIComponent(userId);
            cached = buildUserProfile(userId, username, activity);
            setCachedUserProfile(userId, cached);
          }
        }

        setProfile(cached);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        Sentry.captureException(error);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [userId]);

  const handleViewDetails = () => {
    if (!profile) return;

    Sentry.addBreadcrumb({
      category: "navigation",
      message: `Viewing extended details for ${profile.username}`,
      level: "info",
    });

    const serialized = JSON.stringify(profile);
    sessionStorage.setItem("userProfile", serialized);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-neutral-50 border border-neutral-300 p-6">
            <h2 className="text-lg font-semibold text-neutral-800">Error Loading User</h2>
            <p className="mt-2 text-neutral-600">{error.message}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-neutral-700 text-white hover:bg-neutral-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-neutral-50 border border-neutral-300 p-6">
            <h2 className="text-lg font-semibold text-neutral-800">User Not Found</h2>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-neutral-700 text-white hover:bg-neutral-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formattedLastSeen = profile.lastActivity
    ? formatDate(profile.lastActivity.timestamp)
    : "Never";

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="text-neutral-600 hover:text-neutral-800 mb-4 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-neutral-800">User Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-neutral-50 border border-neutral-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-800">{profile.username}</h2>
              <p className="text-neutral-600">{profile.email}</p>
              <p className="text-sm text-neutral-500 mt-2">Last seen: {formattedLastSeen}</p>
            </div>
            <button
              onClick={handleViewDetails}
              className="px-4 py-2 bg-neutral-600 text-white hover:bg-neutral-700"
            >
              Export Profile
            </button>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
          {profile.recentActions.length > 0 ? (
            <div className="space-y-3">
              {profile.recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0"
                >
                  <div>
                    <p className="text-neutral-800">{action.action}</p>
                    <p className="text-sm text-neutral-500">
                      {formatDate(action.timestamp)}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-neutral-200 text-neutral-700">
                    {action.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No recent activity</p>
          )}
        </div>

        <div className="bg-neutral-50 border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-800">
                {formatNumber(profile.recentActions.length)}
              </p>
              <p className="text-sm text-neutral-500">Total Actions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-800">
                {formatNumber(
                  profile.recentActions.filter((a) => a.status === "success").length
                )}
              </p>
              <p className="text-sm text-neutral-500">Successful</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-800">
                {formatNumber(
                  profile.recentActions.filter((a) => a.status === "error").length
                )}
              </p>
              <p className="text-sm text-neutral-500">Errors</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
