// BUG 3: The REVENUE_MULTIPLIER env var is undefined
// This causes a cascading null propagation error when used in calculations
// The error will surface in RevenueChart.tsx as "Cannot read property 'toFixed' of undefined"
// but the root cause is here - the env var doesn't exist

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  // BUG: This reads an undefined env var and doesn't provide a fallback
  // When useCustomConfig is true, this undefined value propagates through
  revenueMultiplier: process.env.NEXT_PUBLIC_REVENUE_MULTIPLIER
    ? parseFloat(process.env.NEXT_PUBLIC_REVENUE_MULTIPLIER)
    : undefined,
  defaultMultiplier: 1.0,
  dateFormat: "yyyy-MM-dd",
  refreshInterval: 30000,
};

export function getRevenueMultiplier(useCustomConfig: boolean): number | undefined {
  // BUG: When useCustomConfig is true, returns undefined instead of defaultMultiplier
  // This is intentional to demonstrate null propagation bugs
  if (useCustomConfig) {
    return config.revenueMultiplier; // undefined!
  }
  return config.defaultMultiplier;
}
