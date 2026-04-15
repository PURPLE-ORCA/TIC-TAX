import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useFinance() {
  const stats = useQuery(api.transactions.getDashboardStats);

  return {
    safeToSpend: stats?.safeToSpend ?? 0,
    taxHostage: stats?.taxHostage ?? 0,
    pendingCapital: stats?.pendingCapital ?? 0,
    totalBleed: stats?.totalBleed ?? 0,
    recentTransactions: stats?.recentTransactions ?? [],
    isLoading: stats === undefined,
  };
}
