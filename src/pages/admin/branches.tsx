import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { branchService } from "@/services/branchService";
import { networkService } from "@/services/networkService";
import { Plus, Building2, Edit, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Branch = Tables<"branches"> & {
  networks?: {
    id: string;
    name: string;
    logo_url: string | null;
    brand_color: string | null;
  } | null;
};

type Network = Tables<"networks">;

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
    cnpj: "",
    name: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipcode: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    freight_options: [] as Array<{ name: string; cost: number }>,
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
      cnpj: "",
      name: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipcode: "",
      contact_name: "",
      contact_phone: "",
      contact_email: "",
      freight_options: [],
    });
    setDialogOpen(true);
  }

  function openEditDialog(branch: Branch) {
    const address = branch.address as AddressData | null;
    setEditingBranch(branch);
    setFormData({
      network_id: branch.network_id,
      cnpj: branch.cnpj,
      name: branch.name,
      street: address?.street || "",
      number: address?.number || "",
      complement: address?.complement || "",
      neighborhood: address?.neighborhood || "",
      city: address?.city || "",
      state: address?.state || "",
      zipcode: address?.zipcode || "",
      contact_name: branch.contact_name || "",
      contact_phone: branch.contact_phone || "",
      contact_email: branch.contact_email || "",
      freight_options: (branch.freight_options as Array<{ name: string; cost: number }>) || [],
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const addressData: AddressData = {
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode.replace(/\D/g, ""),
      };

      const payload = {
        network_id: formData.network_id,
        cnpj: formData.cnpj.replace(/\D/g, ""),
        name: formData.name,
        address: addressData,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        freight_options: formData.freight_options,
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
            {branches.map((branch) => (
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
                  <div>
                    <p className="text-muted-foreground">Contato</p>
                    <p>{branch.contact_name || "—"}</p>
                    <p>{branch.contact_phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Opções de Frete</p>
                    {Array.isArray(branch.freight_options) && branch.freight_options.length > 0 ? (
                      <ul>
                        {(branch.freight_options as Array<{ name: string; cost: number }>).map((opt, i) => (
                          <li key={i}>{opt.name}: R$ {opt.cost.toFixed(2)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-xs">Nenhuma configurada</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    value={formData.zipcode}
                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Endereço</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Rua, Avenida..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    placeholder="Apto, sala..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Centro, Jardins..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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