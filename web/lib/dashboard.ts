import { api } from "@/lib/api-client";

export type DashboardSummary = {
  lowStockArticles: number;
  supplierOrdersPending: number;
  supplierOrdersChecking: number;
  supplierOrdersChecked: number;
  customerOrdersOpen: number;
};

export type DashboardSummaryResponse = {
  summary: DashboardSummary;
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummaryResponse>(
    "/api/dashboard/summary",
  );
  return data.summary;
}
