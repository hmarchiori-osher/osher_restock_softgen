import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { branchService } from "@/services/branchService";
import { networkService } from "@/services/networkService";
import { Plus, Store, Edit, Trash2, MapPin, Truck, Building2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Network = Tables<"networks">;
type Branch = Tables<"branches"> & {
  networks?: Partial<Network>;
  access_mode?: "cnpj_only" | "login_required";
};

type AddressData = {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    network_id: "",
    name: "",
    cnpj: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
    freight_options: [] as Array<{ name: string; price: number }>,
    access_mode: "cnpj_only" as "cnpj_only" | "login_required",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [branchesData, networksData] = await Promise.all([
        branchService.list(),
        networkService.list(),
      ]);
      setBranches(branchesData);
      setNetworks(networksData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingBranch(null);
    setFormData({
      network_id: "",
      name: "",
      cnpj: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      address: {
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      freight_options: [],
      access_mode: "cnpj_only",
    });
    setDialogOpen(true);
  }

  function openEditDialog(branch: Branch) {
    setEditingBranch(branch);
    const addr = branch.address as any || {};
    const freight = Array.isArray(branch.freight_options) 
      ? (branch.freight_options as Array<{ name: string; price: number }>)
      : [];

    setFormData({
      network_id: branch.network_id,
      name: branch.name,
      cnpj: branch.cnpj,
      contact_name: branch.contact_name || "",
      contact_email: branch.contact_email || "",
      contact_phone: branch.contact_phone || "",
      address: {
        cep: addr.cep || "",
        street: addr.street || "",
        number: addr.number || "",
        complement: addr.complement || "",
        neighborhood: addr.neighborhood || "",
        city: addr.city || "",
        state: addr.state || "",
      },
      freight_options: freight,
      access_mode: (branch.access_mode || "cnpj_only") as "cnpj_only" | "login_required",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const payload = {
        network_id: formData.network_id,
        name: formData.name,
        cnpj: formData.cnpj,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        address: formData.address,
        freight_options: formData.freight_options.length > 0 ? formData.freight_options : null,
        access_mode: formData.access_mode,
      };

      if (editingBranch) {
        await branchService.update(editingBranch.id, payload);
        toast({ title: "Filial atualizada com sucesso!" });
      } else {
        await branchService.create(payload);
        toast({ title: "Filial criada com sucesso!" });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving branch:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a filial",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta filial?")) return;

    try {
      await branchService.delete(id);
      toast({ title: "Filial excluída com sucesso!" });
      loadData();
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a filial",
        variant: "destructive",
      });
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

  function getAddressDisplay(branch: Branch): string {
    const address = branch.address as AddressData | null;
    if (!address) return "Endereço não cadastrado";
    return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""} - ${address.city}/${address.state}`;
  }

  return (
    <AdminLayout>
      <SEO title="Filiais - Osher Restock" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Filiais</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as filiais cadastradas
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Filial
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : branches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma filial cadastrada ainda.</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira filial
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {branches.map((branch) => {
              const addr = branch.address as AddressData | null;
              const freight = Array.isArray(branch.freight_options) ? branch.freight_options : [];
              return (
                <Card key={branch.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{branch.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {branch.networks?.name} • CNPJ: {formatCNPJ(branch.cnpj)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(branch)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(branch.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Endereço</p>
                      <p>{getAddressDisplay(branch)}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      {branch.contact_name && (
                        <p>
                          <span className="text-muted-foreground">Contato:</span>{" "}
                          {branch.contact_name}
                        </p>
                      )}
                      {branch.contact_email && (
                        <p className="truncate">
                          <span className="text-muted-foreground">Email:</span>{" "}
                          {branch.contact_email}
                        </p>
                      )}
                      {branch.contact_phone && (
                        <p>
                          <span className="text-muted-foreground">Telefone:</span>{" "}
                          {branch.contact_phone}
                        </p>
                      )}
                      {addr?.city && addr?.state && (
                        <p>
                          <span className="text-muted-foreground">Localização:</span>{" "}
                          {addr.city} - {addr.state}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={(branch.access_mode || "cnpj_only") === "cnpj_only" ? "secondary" : "default"}>
                        {(branch.access_mode || "cnpj_only") === "cnpj_only"
                          ? "Acesso por CNPJ"
                          : "Login obrigatório"}
                      </Badge>
                      {freight && freight.length > 0 && (
                        <Badge variant="outline">
                          <Truck className="w-3 h-3 mr-1" />
                          {freight.length} opção{freight.length > 1 ? "ões" : ""} de frete
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? "Editar Filial" : "Nova Filial"}
              </DialogTitle>
              <DialogDescription>
                {editingBranch ? "Atualize as informações da filial" : "Cadastre uma nova filial"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="network_id">Rede *</Label>
                  <Select
                    value={formData.network_id}
                    onValueChange={(value) => setFormData({ ...formData, network_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a rede" />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          {network.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formatCNPJ(formData.cnpj)}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value.replace(/\D/g, "") })}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name">Nome da Filial *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Filial Shopping Morumbi"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipcode">CEP</Label>
                  <Input
                    id="zipcode"
                    value={formData.address.cep}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, cep: e.target.value } })}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Endereço</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                    placeholder="Rua, Avenida..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, number: e.target.value } })}
                    placeholder="123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address.complement}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, complement: e.target.value } })}
                    placeholder="Apto, sala..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, neighborhood: e.target.value } })}
                    placeholder="Centro, Jardins..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                    placeholder="São Paulo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contato</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="(11) 98888-8888"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="contato@filial.com"
                  />
                </div>
              </div>

              {/* Access Mode */}
              <div className="space-y-3">
                <Label>Modo de Acesso desta Filial</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <p className="font-medium">
                      {formData.access_mode === "cnpj_only"
                        ? "Acesso por CNPJ (sem senha)"
                        : "Login obrigatório"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.access_mode === "cnpj_only"
                        ? "Esta filial acessa apenas com CNPJ, sem login"
                        : "Esta filial precisa de email e senha para acessar"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.access_mode === "login_required"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        access_mode: checked ? "login_required" : "cnpj_only",
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBranch ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}