import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";
import { networkService } from "@/services/networkService";
import { Plus, Package, Edit, Trash2, AlertCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Network = Tables<"networks">;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    unit: "rolo",
    stock_quantity: "",
    photo_url: "",
    visible_to_networks: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsData, networksData] = await Promise.all([
        productService.list(),
        networkService.list(),
      ]);
      setProducts(productsData);
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
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      sku: "",
      price: "",
      unit: "rolo",
      stock_quantity: "",
      photo_url: "",
      visible_to_networks: [],
    });
    setDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      sku: product.sku,
      price: product.price.toString(),
      unit: product.unit,
      stock_quantity: product.stock_quantity.toString(),
      photo_url: product.photo_url || "",
      visible_to_networks: Array.isArray(product.visible_to_networks) ? product.visible_to_networks : [],
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        sku: formData.sku,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock_quantity: parseInt(formData.stock_quantity),
        photo_url: formData.photo_url || null,
        visible_to_networks: formData.visible_to_networks.length > 0 ? formData.visible_to_networks : null,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        await productService.create(payload);
        toast({ title: "Produto criado com sucesso!" });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await productService.delete(id);
      toast({ title: "Produto excluído com sucesso!" });
      loadData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
    }
  }

  return (
    <AdminLayout>
      <SEO title="Produtos - Osher Restock" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Produtos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie o catálogo de produtos disponíveis
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum produto cadastrado ainda.
              </p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro produto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-3">
                  {product.photo_url && (
                    <img
                      src={product.photo_url}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                  <div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription className="mt-1">
                      SKU: {product.sku}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Preço:</span>
                      <p className="font-semibold">
                        R$ {product.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unidade:</span>
                      <p className="font-semibold capitalize">{product.unit}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Estoque:</span>
                      <p className="font-semibold">
                        {product.stock_quantity} {product.unit}
                        {product.stock_quantity > 0 ? "s" : ""}
                      </p>
                      {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                        <Badge variant="destructive" className="mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Estoque baixo
                        </Badge>
                      )}
                      {product.stock_quantity === 0 && (
                        <Badge variant="secondary" className="mt-1">
                          Sob encomenda
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    {product.visible_to_networks === null || (Array.isArray(product.visible_to_networks) && product.visible_to_networks.length === 0) ? (
                      <Badge variant="secondary">Visível para todas as redes</Badge>
                    ) : (
                      <Badge>
                        {Array.isArray(product.visible_to_networks) ? product.visible_to_networks.length : 0} rede(s) específica(s)
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Atualize as informações do produto"
                  : "Cadastre um novo produto no catálogo"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Etiqueta Térmica 100x50mm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU/Código *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Ex: ETQ-100-50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rolo">Rolo</SelectItem>
                      <SelectItem value="caixa">Caixa</SelectItem>
                      <SelectItem value="unidade">Unidade</SelectItem>
                      <SelectItem value="metro">Metro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço Unitário (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque Atual *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição detalhada do produto..."
                    rows={3}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="photo">URL da Foto</Label>
                  <Input
                    id="photo"
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole a URL de uma imagem hospedada
                  </p>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Visibilidade (Redes)</Label>
                  <div className="border rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
                    <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        id="all-networks"
                        checked={formData.visible_to_networks.length === 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, visible_to_networks: [] });
                          }
                        }}
                        className="cursor-pointer"
                      />
                      <Label htmlFor="all-networks" className="cursor-pointer flex-1">
                        Todas as redes (padrão)
                      </Label>
                    </div>
                    {networks.map((network) => (
                      <div key={network.id} className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          id={network.id}
                          checked={formData.visible_to_networks.includes(network.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                visible_to_networks: [...formData.visible_to_networks, network.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                visible_to_networks: formData.visible_to_networks.filter(
                                  (id) => id !== network.id
                                ),
                              });
                            }
                          }}
                          className="cursor-pointer"
                        />
                        <Label htmlFor={network.id} className="cursor-pointer flex-1">
                          {network.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deixe desmarcado para disponibilizar para todas as redes
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}