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

  async list() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        branches (
          id,
          name,
          cnpj,
          networks (
            id,
            name,
            logo_url
          )
        )
      `)
      .order("created_at", { ascending: false });
    
    console.log("orderService.list:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async updateStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();
    
    console.log("orderService.updateStatus:", { data, error });
    if (error) throw error;
    return data;
  },

  async getRecent(limit: number = 5) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        branches (
          id,
          name,
          cnpj,
          networks (
            id,
            name
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    console.log("orderService.getRecent:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async getByBranch(branchId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(10);

    console.log("orderService.getByBranch:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    console.log("orderService.getById:", { data, error });
    if (error) throw error;
    return data;
  },
};
