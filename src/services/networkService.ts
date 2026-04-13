import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Network = Tables<"networks">;

export interface NetworkFormData {
  name: string;
  cnpj_matriz: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  brand_color?: string;
  access_mode: "cnpj_only" | "login_required";
}

export const networkService = {
  async list() {
    const { data, error } = await supabase
      .from("networks")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("networkService.list:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("networks")
      .select("*")
      .eq("id", id)
      .single();

    console.log("networkService.getById:", { data, error });
    if (error) throw error;
    return data;
  },

  async create(formData: NetworkFormData) {
    const { data, error } = await supabase
      .from("networks")
      .insert(formData)
      .select()
      .single();

    console.log("networkService.create:", { data, error });
    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<NetworkFormData>) {
    const { data, error } = await supabase
      .from("networks")
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    console.log("networkService.update:", { data, error });
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("networks")
      .delete()
      .eq("id", id);

    console.log("networkService.delete:", { error });
    if (error) throw error;
  },

  async uploadLogo(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `network-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("network-logos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("network-logos")
      .getPublicUrl(filePath);

    return publicUrl;
  },
};
