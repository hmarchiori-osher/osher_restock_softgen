import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
}

export function useAuth(requireAdmin: boolean = false) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          if (requireAdmin) {
            router.push("/admin/login");
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [requireAdmin, router]);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else if (requireAdmin) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      
      if (requireAdmin && data?.role !== "admin") {
        router.push("/");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  return { user, profile, loading, isAdmin: profile?.role === "admin" };
}
