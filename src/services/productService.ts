import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const productService = {
  async list() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    console.log("productService.list:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async create(product: Partial<Tables<"products">>) {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    
    console.log("productService.create:", { data, error });
    if (error) throw error;
    return data;
  },

  async update(id: string, product: Partial<Tables<"products">>) {
    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .select()
      .single();
    
    console.log("productService.update:", { data, error });
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    
    console.log("productService.delete:", { error });
    if (error) throw error;
  },

  async uploadPhoto(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("product-photos")
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async getByNetwork(networkId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`visible_to_networks.cs.{${networkId}},visible_to_networks.is.null`)
      .order("name");
    
    console.log("productService.getByNetwork:", { data, error });
    if (error) throw error;
    return data || [];
  },
};