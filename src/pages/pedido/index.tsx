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

  async function handleCNPJChange(value: string) {
    const formatted = formatCNPJ(value);
    setCnpj(formatted);
    
    const numbers = value.replace(/\D/g, "");
    
    if (numbers.length >= 3) {
      try {
        console.log("Searching CNPJ:", numbers);
        const results = await branchService.searchByCNPJ(numbers);
        console.log("Search results:", results);
        setSearchResults(results);
      } catch (error: any) {
        console.error("Error searching CNPJ:", error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar",
          description: error.message || "Não foi possível buscar filiais",
        });
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
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

  // Funções de máscara para LGPD
  function maskEmail(email: string | null | undefined) {
    if (!email) return "Não informado";
    const [user, domain] = email.split("@");
    if (!domain) return "***@***";
    const maskedUser = user.slice(0, 2) + "***";
    return `${maskedUser}@${domain}`;
  }

  function maskPhone(phone: string | null | undefined) {
    if (!phone) return "Não informado";
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length < 8) return "***";
    return phone.slice(0, -4) + "****";
  }

  function maskAddress(address: any) {
    if (!address?.street) return "***";
    return `${address.street}, *** - ${address.neighborhood || "***"}`;
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

          <CardContent className="p-6 md:p-8">
            {!selectedBranch ? (
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="cnpj" className="text-base mb-2 block">
                    Digite o CNPJ da sua filial
                  </Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => handleCNPJChange(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    className="text-lg h-14"
                    disabled={selectedBranch !== null}
                    autoComplete="off"
                  />

                  {/* Search Results Dropdown - POSICIONADO PRÓXIMO AO INPUT */}
                  {searchResults.length > 0 && !selectedBranch && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {searchResults.map((branch) => {
                        const addr = branch.address as any;
                        return (
                          <button
                            key={branch.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelectBranch(branch);
                            }}
                            className="w-full p-4 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                          >
                            <div className="font-medium">{formatCNPJ(branch.cnpj)}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {branch.name}
                            </div>
                            {addr?.city && addr?.state && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {addr.city} - {addr.state}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* No Results Message */}
                  {cnpj.replace(/\D/g, "").length >= 3 && searchResults.length === 0 && !loading && !selectedBranch && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground z-50">
                      Nenhuma filial encontrada com este CNPJ
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 border-2 border-accent rounded-lg bg-accent/5">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg mb-3">
                      Confirme seus dados
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">CNPJ:</span>{" "}
                        <span className="font-medium">{formatCNPJ(selectedBranch.cnpj)}</span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Filial:</span>{" "}
                        <span className="font-medium">{selectedBranch.name}</span>
                      </div>

                      {selectedBranch.networks?.name && (
                        <div>
                          <span className="text-muted-foreground">Rede:</span>{" "}
                          <span className="font-medium">{selectedBranch.networks.name}</span>
                        </div>
                      )}

                      {selectedBranch.address && (
                        <div>
                          <span className="text-muted-foreground">Endereço:</span>{" "}
                          <span className="font-medium">{maskAddress(selectedBranch.address)}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-muted-foreground">Contato:</span>{" "}
                        <span className="font-medium">{selectedBranch.contact_name || "Não informado"}</span>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-medium">{maskEmail(selectedBranch.contact_email)}</span>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Telefone:</span>{" "}
                        <span className="font-medium">{maskPhone(selectedBranch.contact_phone)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 italic">
                      ℹ️ Alguns dados foram parcialmente ocultados por segurança
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedBranch(null);
                      setCnpj("");
                    }}
                    className="flex-1"
                  >
                    Não é esta filial
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleConfirm();
                    }}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    Confirmar e Continuar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}