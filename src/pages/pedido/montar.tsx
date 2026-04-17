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
import { Package, ShoppingCart, Plus, Minus, Upload, ArrowRight, AlertCircle } from "lucide-react";

export default function MontarPedidoPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [branch, setBranch] = useState<any>(null);
  const [network, setNetwork] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<Array<{ product_id: string; quantity: number }>>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("MontarPedidoPage mounted");
    loadBranchData();
  }, []);

  async function loadBranchData() {
    try {
      console.log("Loading branch data from sessionStorage");
      
      // Recuperar dados da filial do sessionStorage
      const branchData = sessionStorage.getItem("pedido_branch");
      console.log("Branch data from sessionStorage:", branchData);
      
      if (!branchData) {
        console.warn("No branch data found - redirecting to /pedido");
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nenhuma filial selecionada. Por favor, selecione uma filial.",
        });
        router.push("/pedido");
        return;
      }

      const parsedBranch = JSON.parse(branchData);
      console.log("Parsed branch:", parsedBranch);
      
      setBranch(parsedBranch);
      setNetwork(parsedBranch.networks);

      // Carregar produtos da rede
      if (parsedBranch.network_id) {
        console.log("Loading products for network:", parsedBranch.network_id);
        await loadProducts(parsedBranch.network_id);
      }

      // Tentar carregar último pedido para pré-preencher
      if (parsedBranch.id) {
        console.log("Loading last order for branch:", parsedBranch.id);
        await loadLastOrder(parsedBranch.id);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading branch data:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
      });
      router.push("/pedido");
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
        const lastOrder = orders[0];
        const items = lastOrder.items as any[];
        
        if (items && items.length > 0) {
          // Pré-preencher carrinho com quantidades do último pedido
          const cartItems = items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }));
          
          setCart(cartItems);
          
          toast({
            title: "Último pedido carregado",
            description: "As quantidades foram pré-preenchidas com base no seu último pedido.",
          });
        }
      }
    } catch (error) {
      console.error("Error loading last order:", error);
      // Não mostrar erro - é opcional
    }
  }

  function getCartQuantity(productId: string): number {
    const item = cart.find(i => i.product_id === productId);
    return item?.quantity || 0;
  }

  function updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product_id !== productId));
    } else {
      setCart(prev => {
        const existing = prev.find(item => item.product_id === productId);
        if (existing) {
          return prev.map(item =>
            item.product_id === productId ? { ...item, quantity } : item
          );
        } else {
          return [...prev, { product_id: productId, quantity }];
        }
      });
    }
  }

  function getCartTotal(): number {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) return total;
      return total + (product.price * item.quantity);
    }, 0);
  }

  function handleContinue() {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione pelo menos um produto antes de continuar.",
      });
      return;
    }

    console.log("=== SAVING CART TO SESSION STORAGE ===");
    console.log("Cart data:", cart);
    console.log("Products data:", products);
    
    // Verificar os dados antes de salvar
    const cartWithDetails = cart.map(item => {
      const product = products.find(p => p.id === item.product_id);
      console.log(`Product ${item.product_id}:`, {
        found: !!product,
        name: product?.name,
        price: product?.price,
        priceType: typeof product?.price,
      });
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: product?.name,
        product_price: product?.price,
      };
    });
    
    console.log("Cart with details:", cartWithDetails);

    // Salvar carrinho no sessionStorage
    sessionStorage.setItem("pedido_cart", JSON.stringify(cart));
    sessionStorage.setItem("pedido_urgent", isUrgent.toString());
    
    console.log("Saved to sessionStorage:");
    console.log("pedido_cart:", sessionStorage.getItem("pedido_cart"));
    console.log("pedido_urgent:", sessionStorage.getItem("pedido_urgent"));

    // Redirecionar para página de resumo
    router.push("/pedido/resumo");
  }

  if (loading) {
    return (
      <>
        <SEO title="Carregando..." />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </>
    );
  }

  if (!branch || !network) {
    return null;
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const brandColor = network.brand_color || "#1E40AF";

  return (
    <>
      <SEO title={`Montar Pedido - ${network.name}`} />
      
      {/* White-label Header */}
      <div className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {network.logo_url && (
                <img
                  src={network.logo_url}
                  alt={network.name}
                  className="h-10 object-contain"
                />
              )}
              <div>
                <h1 className="text-xl font-heading font-bold">{network.name}</h1>
                <p className="text-sm text-muted-foreground">{branch.name}</p>
              </div>
            </div>
            
            {cart.length > 0 && (
              <Badge 
                className="h-10 px-4 text-base"
                style={{ backgroundColor: brandColor }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {cartItemCount} {cartItemCount === 1 ? "item" : "itens"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Progress Indicator */}
          <div className="mb-8 flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Etapa 2 de 4:</span>
            <span className="font-semibold">Montar Pedido</span>
          </div>

          {/* Options */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Urgency Toggle */}
                <div className="flex-1 flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">Entrega Urgente</Label>
                    <p className="text-sm text-muted-foreground">
                      +15% no valor total • Prazo reduzido
                    </p>
                  </div>
                  <Switch
                    checked={isUrgent}
                    onCheckedChange={setIsUrgent}
                  />
                </div>

                {/* File Upload */}
                <div className="flex-1">
                  <Label htmlFor="file-upload" className="text-base font-semibold mb-2 block">
                    Anexar Pedido de Compra (opcional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {attachedFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ✓ {attachedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading font-bold">Produtos Disponíveis</h2>
              <p className="text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? "produto" : "produtos"}
              </p>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum produto disponível para esta rede no momento.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const quantity = getCartQuantity(product.id);
                  const inStock = product.stock && product.stock > 0;
                  const canBeUrgent = inStock && isUrgent;

                  return (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="p-4">
                        {product.photo_url && (
                          <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={product.photo_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <CardTitle className="text-lg leading-tight">
                            {product.name}
                          </CardTitle>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <p className="text-2xl font-bold" style={{ color: brandColor }}>
                              R$ {product.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              por {product.unit}
                            </p>
                          </div>
                          {product.sku && (
                            <Badge variant="outline" className="text-xs">
                              {product.sku}
                            </Badge>
                          )}
                        </div>

                        {/* Stock Indicator */}
                        <div className="mt-2">
                          {inStock ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                              Em estoque • 2 dias
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" />
                              Sob encomenda • 5-7 dias
                            </Badge>
                          )}
                        </div>

                        {/* Urgency Warning */}
                        {!inStock && isUrgent && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800 flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>Este produto não está disponível para entrega urgente</span>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="p-4 pt-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            disabled={quantity === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          
                          <Input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              updateCartQuantity(product.id, val);
                            }}
                            className="text-center h-9 w-20"
                          />

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {quantity > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Subtotal: <span className="font-semibold">R$ {(product.price * quantity).toFixed(2)}</span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Summary & Continue */}
          <Card className="mt-8 sticky bottom-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total do Pedido</p>
                  <p className="text-3xl font-bold" style={{ color: brandColor }}>
                    R$ {getCartTotal().toFixed(2)}
                  </p>
                  {cart.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {cartItemCount} {cartItemCount === 1 ? "item" : "itens"} no carrinho
                    </p>
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={handleContinue}
                  disabled={cart.length === 0}
                  style={{ backgroundColor: cart.length > 0 ? brandColor : undefined }}
                  className="text-lg px-8"
                >
                  Continuar para Resumo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}