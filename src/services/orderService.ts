import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Order = Tables<"orders">;

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  monthRevenue: number;
}

export const orderService = {
  async getMonthStats(): Promise<OrderStats> {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, total")
      .gte("created_at", firstDayOfMonth.toISOString());

    console.log("orderService.getMonthStats:", { data: orders, error });
    if (error) throw error;

    const stats: OrderStats = {
      totalOrders: orders?.length || 0,
      pendingOrders: orders?.filter(o => o.status === "new").length || 0,
      monthRevenue: orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
    };

    return stats;
  },

  async getRecent(limit: number = 5) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        branches!orders_branch_id_fkey (
          name,
          networks!branches_network_id_fkey (name)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    console.log("orderService.getRecent:", { data, error });
    if (error) throw error;
    return data || [];
  },
};
