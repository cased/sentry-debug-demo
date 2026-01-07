import { MetricDataPoint, RevenueDataPoint, ActivityItem } from "./types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

interface DataCache {
  metrics: CacheEntry<MetricDataPoint[]> | null;
  revenue: CacheEntry<RevenueDataPoint[]> | null;
  activity: CacheEntry<ActivityItem[]> | null;
  userProfiles: Map<string, CacheEntry<UserProfile>>;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  lastActivity: ActivityItem | null;
  recentActions: ActivityItem[];
  metadata: Record<string, unknown>;
}

const cache: DataCache = {
  metrics: null,
  revenue: null,
  activity: null,
  userProfiles: new Map(),
};

let globalVersion = 0;

export function getCachedMetrics(): MetricDataPoint[] | null {
  if (!cache.metrics) return null;
  return cache.metrics.data;
}

export function setCachedMetrics(data: MetricDataPoint[]): void {
  cache.metrics = {
    data,
    timestamp: Date.now(),
    version: ++globalVersion,
  };
}

export function getCachedRevenue(): RevenueDataPoint[] | null {
  if (!cache.revenue) return null;
  return cache.revenue.data;
}

export function setCachedRevenue(data: RevenueDataPoint[]): void {
  cache.revenue = {
    data,
    timestamp: Date.now(),
    version: ++globalVersion,
  };
}

export function getCachedActivity(): ActivityItem[] | null {
  if (!cache.activity) return null;
  return cache.activity.data;
}

export function setCachedActivity(data: ActivityItem[]): void {
  cache.activity = {
    data,
    timestamp: Date.now(),
    version: ++globalVersion,
  };
}

export function getCachedUserProfile(userId: string): UserProfile | null {
  const entry = cache.userProfiles.get(userId);
  if (!entry) return null;
  return entry.data;
}

export function setCachedUserProfile(userId: string, profile: UserProfile): void {
  cache.userProfiles.set(userId, {
    data: profile,
    timestamp: Date.now(),
    version: ++globalVersion,
  });
}

export function buildUserProfile(
  userId: string,
  username: string,
  activity: ActivityItem[]
): UserProfile {
  const userActivity = activity.filter((a) => a.user === username);
  const lastActivity = userActivity[0] || null;

  const profile: UserProfile = {
    id: userId,
    username,
    email: `${username.toLowerCase()}@example.com`,
    lastActivity,
    recentActions: userActivity.slice(0, 5),
    metadata: {},
  };

  if (lastActivity) {
    profile.metadata.lastSeen = lastActivity.timestamp;
    profile.metadata.source = lastActivity;
  }

  return profile;
}

export function enrichActivityWithUserData(
  activity: ActivityItem[],
  getUserProfile: (username: string) => UserProfile | null
): ActivityItem[] {
  return activity.map((item) => {
    const profile = getUserProfile(item.user);
    if (profile) {
      const enriched = { ...item } as ActivityItem & { userProfile?: UserProfile };
      enriched.userProfile = profile;
      return enriched as ActivityItem;
    }
    return item;
  });
}

export function invalidateCache(): void {
  cache.metrics = null;
  cache.revenue = null;
  cache.activity = null;
  cache.userProfiles.clear();
}

export function getCacheVersion(): number {
  return globalVersion;
}
