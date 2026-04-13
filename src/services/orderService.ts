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

  async create(orderData: {
    branch_id: string;
    items: Array<{ product_id: string; quantity: number; unit_price: number }>;
    subtotal: number;
    freight_cost: number;
    urgency_fee: number;
    total: number;
    is_urgent: boolean;
    freight_option: string;
    observations: string | null;
    status: string;
    estimated_delivery_days: number;
  }) {
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + orderData.estimated_delivery_days);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        branch_id: orderData.branch_id,
        items: orderData.items,
        total: orderData.total,
        freight_cost: orderData.freight_cost,
        urgent_fee: orderData.urgency_fee,
        freight_option: orderData.freight_option,
        notes: orderData.observations,
        status: orderData.status,
        estimated_delivery: estimatedDelivery.toISOString(),
      })
      .select()
      .single();

    console.log("orderService.create:", { data, error });
    if (error) throw error;
    return data;
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
