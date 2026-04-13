import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const branchService = {
  async list() {
    const { data, error } = await supabase
      .from("branches")
      .select(`
        *,
        networks (
          id,
          name,
          logo_url,
          brand_color
        )
      `)
      .order("created_at", { ascending: false });
    
    console.log("branchService.list:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async create(branch: Partial<Tables<"branches">>) {
    const { data, error } = await supabase
      .from("branches")
      .insert([branch])
      .select()
      .single();
    
    console.log("branchService.create:", { data, error });
    if (error) throw error;
    return data;
  },

  async update(id: string, branch: Partial<Tables<"branches">>) {
    const { data, error } = await supabase
      .from("branches")
      .update(branch)
      .eq("id", id)
      .select()
      .single();
    
    console.log("branchService.update:", { data, error });
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("id", id);
    
    console.log("branchService.delete:", { error });
    if (error) throw error;
  },

  async getByCNPJ(cnpj: string) {
    const { data, error } = await supabase
      .rpc("get_branch_by_cnpj", { cnpj_search: cnpj });
    
    console.log("branchService.getByCNPJ:", { data, error });
    if (error) throw error;
    return data?.[0] || null;
  },

  async searchByCNPJ(cnpjPartial: string) {
    const { data, error } = await supabase
      .from("branches")
      .select(`
        id,
        cnpj,
        name,
        address,
        networks (
          id,
          name,
          access_mode
        )
      `)
      .ilike("cnpj", `${cnpjPartial}%`)
      .limit(10);
    
    console.log("branchService.searchByCNPJ:", { data, error });
    if (error) throw error;
    return data || [];
  },
};