import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BranchInsert = Database["public"]["Tables"]["branches"]["Insert"];
type BranchUpdate = Database["public"]["Tables"]["branches"]["Update"];

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

  async create(branch: BranchInsert) {
    const { data, error } = await supabase
      .from("branches")
      .insert(branch)
      .select()
      .single();
    
    console.log("branchService.create:", { data, error });
    if (error) throw error;
    return data;
  },

  async update(id: string, branch: BranchUpdate) {
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

  async searchByCNPJ(cnpj: string) {
    const { data, error } = await supabase
      .from("branches")
      .select(`
        id,
        cnpj,
        name,
        contact_name,
        contact_email,
        contact_phone,
        address,
        access_mode,
        network_id,
        networks (
          id,
          name,
          logo_url,
          brand_color,
          access_mode
        )
      `)
      .ilike("cnpj", `%${cnpj}%`)
      .limit(10);
    
    console.log("branchService.searchByCNPJ:", { data, error });
    if (error) throw error;
    return data || [];
  },
};