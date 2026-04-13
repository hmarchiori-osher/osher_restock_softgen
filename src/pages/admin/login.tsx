import { useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, error: signInError } = await authService.signIn(email, password);
      
      if (signInError || !user) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: signInError?.message || "Email ou senha incorretos.",
        });
        return;
      }

      console.log("Login successful, user:", user);

      const { data: profile, error: profileError } = await authService.getProfile(user.id);
      
      console.log("Profile fetch result:", { profile, profileError });

      if (profileError) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar perfil",
          description: profileError.message,
        });
        await authService.signOut();
        return;
      }

      if (!profile) {
        toast({
          variant: "destructive",
          title: "Perfil não encontrado",
          description: "Seu perfil de usuário não foi encontrado no sistema.",
        });
        await authService.signOut();
        return;
      }
      
      if (profile.role !== "admin") {
        await authService.signOut();
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
        return;
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao painel admin.",
      });
      
      router.push("/admin");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message || "Erro inesperado. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Login Admin - Osher Restock" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4">
              <h1 className="text-3xl font-heading font-bold text-primary">
                Osher Restock
              </h1>
            </div>
            <CardTitle>Login Administrativo</CardTitle>
            <CardDescription>
              Acesse o painel de controle do fornecedor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
