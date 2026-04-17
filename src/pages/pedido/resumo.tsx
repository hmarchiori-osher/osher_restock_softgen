import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { ArrowLeft, Package, Truck, Clock, FileText, CheckCircle2 } from "lucide-react";

export default function ResumoPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [branch, setBranch] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedFreight, setSelectedFreight] = useState("");
  const [observations, setObservations] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSessionData();
  }, []);

  function loadSessionData() {
    try {
      const branchData = sessionStorage.getItem("pedido_branch");
      const cartData = sessionStorage.getItem("pedido_cart");
      const urgentData = sessionStorage.getItem("pedido_urgent");
      const fileData = sessionStorage.getItem("pedido_file");

      if (!branchData || !cartData) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, inicie o pedido novamente",
        });
        router.push("/pedido");
        return;
      }

      setBranch(JSON.parse(branchData));
      setCart(JSON.parse(cartData));
      setIsUrgent(urgentData === "true");

      if (fileData) {
        const fileInfo = JSON.parse(fileData);
        // Reconstituir File object (apenas nome, não o conteúdo binário)
        setFile(new File([], fileInfo.name, { type: fileInfo.type }));
      }
    } catch (error) {
      console.error("Error loading session data:", error);
      router.push("/pedido");
    }
  }

  const freightOptions = Array.isArray(branch?.freight_options)
    ? branch.freight_options as Array<{ name: string; price: number }>
    : [];

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const urgencyFee = isUrgent ? subtotal * 0.15 : 0; // 15% de taxa de urgência
  
  const freeShippingMinimum = 500; // TODO: buscar de configurações
  const selectedFreightOption = freightOptions.find((f) => f.name === selectedFreight);
  const freightCost = subtotal >= freeShippingMinimum ? 0 : selectedFreightOption?.price || 0;
  const isFreeShipping = subtotal >= freeShippingMinimum;
  
  const total = subtotal + urgencyFee + freightCost;

  const estimatedDays = isUrgent ? 0 : cart.some((item) => !item.inStock) ? 7 : 2;

  async function handleSubmit() {
    if (!selectedFreight) {
      toast({
        variant: "destructive",
        title: "Selecione o frete",
        description: "Escolha uma opção de entrega",
      });
      return;
    }

    setSubmitting(true);

    try {
      const order = await orderService.create({
        branch_id: branch.id,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        subtotal,
        freight_cost: freightCost,
        urgency_fee: urgencyFee,
        total,
        is_urgent: isUrgent,
        freight_option: selectedFreight,
        observations: observations || null,
        status: "new",
        estimated_delivery_days: estimatedDays,
      });

      // Limpar sessionStorage
      sessionStorage.removeItem("pedido_branch");
      sessionStorage.removeItem("pedido_cart");
      sessionStorage.removeItem("pedido_urgent");
      sessionStorage.removeItem("pedido_file");

      // Redirecionar para tela de sucesso
      router.push(`/pedido/sucesso?order=${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Erro ao confirmar pedido",
        description: "Tente novamente em alguns instantes",
      });
      setSubmitting(false);
    }
  }

  if (!branch || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const brandColor = branch.networks?.brand_color || "#1E40AF";

  return (
    <>
      <SEO title={`Resumo do Pedido - ${branch.networks?.name || "Osher Restock"}`} />
      
      <div className="min-h-screen bg-background">
        {/* Header White-label */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {branch.networks?.logo_url ? (
              <img
                src={branch.networks.logo_url}
                alt={branch.networks.name}
                className="h-10 object-contain"
              />
            ) : (
              <h1 className="text-xl font-heading font-bold">
                {branch.networks?.name || "Osher Restock"}
              </h1>
            )}
            <Badge variant="outline">Etapa 3 de 4</Badge>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <h1 className="text-3xl font-heading font-bold mb-2">
            Resumo do Pedido
          </h1>
          <p className="text-muted-foreground mb-8">
            Confira os detalhes e finalize seu pedido
          </p>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Itens do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Carregando itens...</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item, index) => {
                        const itemPrice = Number(item.price) || 0;
                        const itemSubtotal = Number(item.subtotal) || 0;
                        
                        return (
                          <div key={index} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                            <div className="flex-1">
                              <p className="font-medium">{item.name || "Produto"}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity || 0}x R$ {itemPrice.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium">
                              R$ {itemSubtotal.toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Freight Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Opção de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="freight">Selecione o frete *</Label>
                    <Select value={selectedFreight} onValueChange={setSelectedFreight}>
                      <SelectTrigger id="freight">
                        <SelectValue placeholder="Escolha uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        {freightOptions.map((option) => (
                          <SelectItem key={option.name} value={option.name}>
                            {option.name} -{" "}
                            {isFreeShipping ? (
                              <span className="text-accent font-medium">GRÁTIS</span>
                            ) : (
                              `R$ ${option.price.toFixed(2)}`
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isFreeShipping && (
                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent inline mr-2" />
                      <span className="font-medium text-accent">Frete grátis!</span>{" "}
                      Seu pedido atingiu o valor mínimo.
                    </div>
                  )}

                  {isUrgent && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                      <Clock className="w-4 h-4 text-orange-600 inline mr-2" />
                      <span className="font-medium">Entrega urgente (mesmo dia)</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        Taxa adicional de 15% sobre o valor dos produtos
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Prazo estimado:{" "}
                    <span className="font-medium">
                      {isUrgent
                        ? "Entrega no mesmo dia"
                        : estimatedDays === 2
                        ? "2 dias úteis"
                        : "5 a 7 dias úteis"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Observations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Alguma informação adicional sobre o pedido? (opcional)"
                    rows={4}
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Arquivo anexado: {file.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span>
                        {isFreeShipping ? (
                          <span className="text-accent font-medium">Grátis</span>
                        ) : selectedFreightOption ? (
                          `R$ ${freightCost.toFixed(2)}`
                        ) : (
                          "Selecione"
                        )}
                      </span>
                    </div>

                    {isUrgent && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxa urgência</span>
                        <span>R$ {urgencyFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span style={{ color: brandColor }}>
                      R$ {total.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedFreight || submitting}
                    className="w-full h-12 text-base"
                    style={{
                      backgroundColor: brandColor,
                      color: "#fff",
                    }}
                  >
                    {submitting ? "Confirmando..." : "Confirmar Pedido"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ao confirmar, você concorda com os termos de entrega e pagamento
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}