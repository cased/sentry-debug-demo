export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  revenueMultiplier: process.env.NEXT_PUBLIC_REVENUE_MULTIPLIER
    ? parseFloat(process.env.NEXT_PUBLIC_REVENUE_MULTIPLIER)
    : undefined,
  defaultMultiplier: 1.0,
  dateFormat: "yyyy-MM-dd",
  refreshInterval: 30000,
};

export function getRevenueMultiplier(useCustomConfig: boolean): number | undefined {
  if (useCustomConfig) {
    return config.revenueMultiplier;
  }
  return config.defaultMultiplier;
}
