import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { Plus, Minus, ShoppingCart, Upload, Package, Zap, ArrowRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Branch = Tables<"branches"> & {
  networks?: {
    id: string;
    name: string;
    logo_url: string | null;
    brand_color: string | null;
  };
};

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MontarPedidoPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [branch, setBranch] = useState<Branch | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  // White-label colors
  const brandColor = branch?.networks?.brand_color || "#10B981";

  useEffect(() => {
    loadBranchData();
  }, []);

  async function loadBranchData() {
    try {
      // Recuperar dados da filial do sessionStorage
      const branchData = sessionStorage.getItem("pedido_branch");
      if (!branchData) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, identifique-se novamente",
          variant: "destructive",
        });
        router.push("/pedido");
        return;
      }

      const parsedBranch = JSON.parse(branchData);
      setBranch(parsedBranch);

      // Carregar produtos disponíveis para esta rede
      await loadProducts(parsedBranch.network_id);

      // Tentar carregar último pedido para pré-preencher
      await loadLastOrder(parsedBranch.id);
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

  async function loadProducts(networkId: string) {
    try {
      const allProducts = await productService.list();
      
      // Filtrar produtos visíveis para esta rede
      const visibleProducts = allProducts.filter((product) => {
        const visibility = product.visible_to_networks as string[] | null;
        // Se visibility é null ou vazio, produto é visível para todas as redes
        if (!visibility || visibility.length === 0) return true;
        // Senão, verificar se a rede está na lista
        return visibility.includes(networkId);
      });

      setProducts(visibleProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    }
  }

  async function loadLastOrder(branchId: string) {
    try {
      const orders = await orderService.getByBranch(branchId);
      if (orders.length > 0) {
        const lastOrder = orders[0]; // Já vem ordenado por created_at DESC
        const items = lastOrder.items as any[];
        
        if (items && items.length > 0) {
          // Pré-preencher carrinho com itens do último pedido
          const cartItems: CartItem[] = [];
          
          for (const item of items) {
            const product = products.find((p) => p.id === item.product_id);
            if (product) {
              cartItems.push({
                product,
                quantity: item.quantity,
              });
            }
          }
          
          if (cartItems.length > 0) {
            setCart(cartItems);
            toast({
              title: "Último pedido carregado",
              description: "Ajuste as quantidades conforme necessário",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading last order:", error);
      // Não mostrar erro - é opcional
    }
  }

  function updateQuantity(product: Product, delta: number) {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      
      if (existingIndex >= 0) {
        const newCart = [...prev];
        const newQuantity = newCart[existingIndex].quantity + delta;
        
        if (newQuantity <= 0) {
          // Remover do carrinho
          newCart.splice(existingIndex, 1);
        } else {
          // Atualizar quantidade
          newCart[existingIndex].quantity = newQuantity;
        }
        
        return newCart;
      } else if (delta > 0) {
        // Adicionar ao carrinho
        return [...prev, { product, quantity: delta }];
      }
      
      return prev;
    });
  }

  function getCartQuantity(productId: string) {
    const item = cart.find((i) => i.product.id === productId);
    return item?.quantity || 0;
  }

  function handleContinue() {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione pelo menos um produto",
        variant: "destructive",
      });
      return;
    }

    // Salvar dados do pedido no sessionStorage
    sessionStorage.setItem("pedido_cart", JSON.stringify(cart));
    sessionStorage.setItem("pedido_urgent", JSON.stringify(isUrgent));
    
    // Attachment será tratado na próxima etapa (upload durante confirmação)
    if (attachmentFile) {
      sessionStorage.setItem("pedido_attachment_name", attachmentFile.name);
    }

    router.push("/pedido/resumo");
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Montar Pedido - Osher Restock" />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Header com White-label */}
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {branch?.networks?.logo_url && (
                  <img
                    src={branch.networks.logo_url}
                    alt={branch.networks.name}
                    className="h-10 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-lg font-heading font-semibold">
                    {branch?.name}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {branch?.networks?.name}
                  </p>
                </div>
              </div>
              
              {/* Indicador de carrinho */}
              {totalItems > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5" style={{ color: brandColor }} />
                  <span className="font-medium">{totalItems} {totalItems === 1 ? "item" : "itens"}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold mb-2">Monte seu Pedido</h2>
            <p className="text-muted-foreground">
              Selecione os produtos e quantidades desejadas
            </p>
          </div>

          {/* Opções de Entrega */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Opções de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5" style={{ color: brandColor }} />
                  <div>
                    <p className="font-medium">Entrega Urgente (mesmo dia)</p>
                    <p className="text-sm text-muted-foreground">
                      Disponível apenas para produtos em estoque
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isUrgent}
                  onCheckedChange={setIsUrgent}
                />
              </div>
            </CardContent>
          </Card>

          {/* Catálogo de Produtos */}
          <div className="grid gap-4 mb-6">
            {products.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum produto disponível para sua rede
                  </p>
                </CardContent>
              </Card>
            ) : (
              products.map((product) => {
                const quantity = getCartQuantity(product.id);
                const inStock = product.stock && product.stock > 0;
                const canBeUrgent = inStock && isUrgent;

                return (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        {product.photo_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={product.photo_url}
                              alt={product.name}
                              className="w-24 h-24 object-cover rounded border"
                            />
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <h3 className="font-heading font-semibold text-lg">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {product.description}
                                </p>
                              )}
                              {product.sku && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  SKU: {product.sku}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl font-bold" style={{ color: brandColor }}>
                                R$ {(product.price || 0).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                por {product.unit || "unidade"}
                              </p>
                            </div>
                          </div>

                          {/* Stock Status */}
                          <div className="flex items-center gap-2 mb-4">
                            {inStock ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                🟢 Em estoque — entrega em 2 dias úteis
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                🟡 Sob encomenda — entrega em 5 a 7 dias úteis
                              </Badge>
                            )}
                            
                            {canBeUrgent && (
                              <Badge style={{ backgroundColor: brandColor, color: "white" }}>
                                ⚡ Disponível para entrega urgente
                              </Badge>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(product, -1)}
                              disabled={quantity === 0}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            
                            <Input
                              type="number"
                              value={quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 0;
                                updateQuantity(product, newQty - quantity);
                              }}
                              className="w-20 text-center"
                              min="0"
                            />
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(product, 1)}
                              style={quantity > 0 ? { borderColor: brandColor, color: brandColor } : {}}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>

                            {quantity > 0 && (
                              <span className="text-sm font-medium ml-2">
                                Subtotal: R$ {((product.price || 0) * quantity).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Anexar Pedido de Compra */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Anexar Pedido de Compra (Opcional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button variant="outline" asChild className="cursor-pointer">
                  <label>
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar arquivo
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </Button>
                
                {attachmentFile && (
                  <p className="text-sm text-muted-foreground">
                    {attachmentFile.name} ({(attachmentFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, PNG ou JPG até 5MB
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/pedido")}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              onClick={handleContinue}
              disabled={cart.length === 0}
              className="flex-1"
              style={{ backgroundColor: brandColor }}
            >
              Continuar para Resumo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}