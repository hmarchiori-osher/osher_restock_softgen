import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { networkService } from "@/services/networkService";
import { Plus, Building2, Edit, Trash2, Upload } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Network = Tables<"networks">;

export default function NetworksPage() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    brand_color: "#1E40AF",
    access_mode: "cnpj_only" as "cnpj_only" | "login_required",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadNetworks();
  }, []);

  async function loadNetworks() {
    try {
      const data = await networkService.list();
      setNetworks(data);
    } catch (error) {
      console.error("Error loading networks:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as redes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingNetwork(null);
    setFormData({
      name: "",
      cnpj: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      brand_color: "#1E40AF",
      access_mode: "cnpj_only",
    });
    setLogoFile(null);
    setDialogOpen(true);
  }

  function openEditDialog(network: Network) {
    setEditingNetwork(network);
    setFormData({
      name: network.name,
      cnpj: network.cnpj_matriz,
      contact_name: network.contact_name || "",
      contact_email: network.contact_email || "",
      contact_phone: network.contact_phone || "",
      brand_color: network.brand_color || "#1E40AF",
      access_mode: network.access_mode as "cnpj_only" | "login_required",
    });
    setLogoFile(null);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);

    try {
      let logoUrl = editingNetwork?.logo_url;

      // Upload logo if file selected
      if (logoFile) {
        logoUrl = await networkService.uploadLogo(logoFile);
      }

      const payload = {
        name: formData.name,
        cnpj_matriz: formData.cnpj,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        brand_color: formData.brand_color,
        access_mode: formData.access_mode,
        logo_url: logoUrl,
      };

      if (editingNetwork) {
        await networkService.update(editingNetwork.id, payload);
        toast({ title: "Rede atualizada com sucesso!" });
      } else {
        await networkService.create(payload);
        toast({ title: "Rede criada com sucesso!" });
      }

      setDialogOpen(false);
      loadNetworks();
    } catch (error) {
      console.error("Error saving network:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a rede",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta rede?")) return;

    try {
      await networkService.delete(id);
      toast({ title: "Rede excluída com sucesso!" });
      loadNetworks();
    } catch (error) {
      console.error("Error deleting network:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a rede",
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

  return (
    <AdminLayout>
      <SEO title="Redes - Osher Restock" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Redes</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as redes de lojas cadastradas
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Rede
          </Button>
        </div>

        {/* Networks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : networks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma rede cadastrada ainda.
              </p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira rede
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {networks.map((network) => (
              <Card key={network.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {network.logo_url && (
                        <img
                          src={network.logo_url}
                          alt={network.name}
                          className="h-10 object-contain mb-3"
                        />
                      )}
                      <CardTitle className="text-xl">{network.name}</CardTitle>
                      <CardDescription className="mt-1">
                        CNPJ: {formatCNPJ(network.cnpj_matriz)}
                      </CardDescription>
                    </div>
                    {network.brand_color && (
                      <div
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: network.brand_color }}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {network.contact_name && (
                      <p>
                        <span className="text-muted-foreground">Contato:</span>{" "}
                        {network.contact_name}
                      </p>
                    )}
                    {network.contact_email && (
                      <p>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        {network.contact_email}
                      </p>
                    )}
                    {network.contact_phone && (
                      <p>
                        <span className="text-muted-foreground">Telefone:</span>{" "}
                        {network.contact_phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Badge variant={network.access_mode === "cnpj_only" ? "secondary" : "default"}>
                      {network.access_mode === "cnpj_only"
                        ? "Acesso por CNPJ"
                        : "Login obrigatório"}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(network)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(network.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNetwork ? "Editar Rede" : "Nova Rede"}
              </DialogTitle>
              <DialogDescription>
                {editingNetwork
                  ? "Atualize as informações da rede"
                  : "Cadastre uma nova rede de lojas"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Rede *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Lojas Americanas"
                  required
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ da Matriz *</Label>
                <Input
                  id="cnpj"
                  value={formatCNPJ(formData.cnpj)}
                  onChange={(e) =>
                    setFormData({ ...formData, cnpj: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nome do Contato</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_name: e.target.value })
                    }
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_phone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email do Contato</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  placeholder="contato@rede.com.br"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo da Rede</Label>
                <div className="flex items-center gap-4">
                  {(editingNetwork?.logo_url || logoFile) && (
                    <div className="flex-shrink-0">
                      {logoFile ? (
                        <div className="w-20 h-20 border rounded flex items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">Preview</span>
                        </div>
                      ) : (
                        <img
                          src={editingNetwork?.logo_url}
                          alt="Logo atual"
                          className="w-20 h-20 object-contain border rounded p-2"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou SVG até 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand Color */}
              <div className="space-y-2">
                <Label htmlFor="brand_color">Cor da Marca</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="brand_color"
                    type="color"
                    value={formData.brand_color}
                    onChange={(e) =>
                      setFormData({ ...formData, brand_color: e.target.value })
                    }
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    value={formData.brand_color}
                    onChange={(e) =>
                      setFormData({ ...formData, brand_color: e.target.value })
                    }
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta cor será usada como destaque no portal da filial (white-label)
                </p>
              </div>

              {/* Access Mode */}
              <div className="space-y-3">
                <Label>Modo de Acesso das Filiais</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <p className="font-medium">
                      {formData.access_mode === "cnpj_only"
                        ? "Acesso por CNPJ (sem senha)"
                        : "Login obrigatório"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.access_mode === "cnpj_only"
                        ? "Filiais acessam apenas com CNPJ, sem necessidade de login"
                        : "Filiais precisam de email e senha para acessar"}
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

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? "Salvando..." : editingNetwork ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}