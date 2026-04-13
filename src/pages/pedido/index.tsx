import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { branchService } from "@/services/branchService";
import { Search, CheckCircle2, ArrowRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Network = Tables<"networks">;
type Branch = Tables<"branches"> & {
  networks?: Partial<Network>;
  access_mode?: "cnpj_only" | "login_required";
};

export default function PedidoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cnpj, setCnpj] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Login mode (for networks with login_required)
  const [loginMode, setLoginMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Auto-search when user types CNPJ
    if (cnpj.length >= 8) {
      handleSearch();
    } else {
      setSearchResults([]);
      setSelectedBranch(null);
    }
  }, [cnpj]);

  async function handleSearch() {
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length < 8) return;

    try {
      const results = await branchService.searchByCNPJ(cleanCNPJ);
      setSearchResults(results);
      
      if (results.length === 1) {
        setSelectedBranch(results[0]);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  function handleSelectBranch(branch: Branch) {
    setSelectedBranch(branch);
    setCnpj(formatCNPJ(branch.cnpj));
    setSearchResults([]);
  }

  function handleConfirm() {
    if (!selectedBranch) return;

    // Check if branch requires login
    if (selectedBranch.access_mode === "login_required") {
      setLoginMode(true);
      return;
    }

    // If CNPJ-only access, proceed directly
    router.push({
      pathname: "/pedido/montar",
      query: { branchId: selectedBranch.id },
    });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement branch user authentication
      toast({
        title: "Login em desenvolvimento",
        description: "Autenticação de filiais será implementada em breve.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  function formatCNPJ(value: string) {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  }

  const addr = selectedBranch?.address as any;

  return (
    <>
      <SEO 
        title="Fazer Pedido - Osher Restock"
        description="Faça seu pedido de insumos de forma rápida e fácil."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">Fazer Pedido</CardTitle>
            <CardDescription>
              {loginMode 
                ? "Entre com suas credenciais"
                : "Identifique sua filial para começar"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!loginMode ? (
              // CNPJ Mode
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ da Filial</Label>
                  <div className="relative">
                    <Input
                      id="cnpj"
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Digite o CNPJ para buscar sua filial
                  </p>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 1 && !selectedBranch && (
                  <div className="border rounded-lg p-2 max-h-48 overflow-y-auto space-y-1">
                    {searchResults.map((branch) => {
                      const branchAddr = branch.address as any;
                      return (
                        <button
                          key={branch.id}
                          onClick={() => handleSelectBranch(branch)}
                          className="w-full text-left p-3 hover:bg-muted rounded-md transition-colors"
                        >
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCNPJ(branch.cnpj)}
                            {branchAddr?.city && ` • ${branchAddr.city}/${branchAddr.state}`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Branch Confirmation */}
                {selectedBranch && (
                  <div className="border border-accent/50 bg-accent/5 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Filial encontrada!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Confirme se são suas informações:
                        </p>
                      </div>
                    </div>

                    <div className="ml-8 space-y-1 text-sm">
                      <p><strong>Nome:</strong> {selectedBranch.name}</p>
                      <p><strong>CNPJ:</strong> {formatCNPJ(selectedBranch.cnpj)}</p>
                      {selectedBranch.networks?.name && (
                        <p><strong>Rede:</strong> {selectedBranch.networks.name}</p>
                      )}
                      {addr?.street && (
                        <p>
                          <strong>Endereço:</strong> {addr.street}, {addr.number}
                          {addr.complement && ` - ${addr.complement}`}
                          {addr.city && `, ${addr.city}/${addr.state}`}
                        </p>
                      )}
                    </div>

                    <Button 
                      onClick={handleConfirm}
                      className="w-full bg-accent hover:bg-accent/90 mt-4"
                    >
                      Confirmar e continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {searchResults.length === 0 && cnpj.replace(/\D/g, "").length >= 14 && (
                  <div className="text-center p-6 border rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      CNPJ não encontrado. Entre em contato com seu fornecedor.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Login Mode
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLoginMode(false);
                      setEmail("");
                      setPassword("");
                    }}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}