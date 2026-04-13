import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { orderService } from "@/services/orderService";
import { CheckCircle2, Package, Mail, Home } from "lucide-react";
import Link from "next/link";

export default function SucessoPage() {
  const router = useRouter();
  const { order: orderId } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && typeof orderId === "string") {
      loadOrder(orderId);
    }
  }, [orderId]);

  async function loadOrder(id: string) {
    try {
      const data = await orderService.getById(id);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Pedido não encontrado</p>
            <Link href="/pedido">
              <Button>Fazer novo pedido</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <>
      <SEO title="Pedido Confirmado - Osher Restock" />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-accent" />
            </div>
            <h1 className="text-3xl font-heading font-bold mb-2">
              Pedido Confirmado!
            </h1>
            <p className="text-muted-foreground">
              Seu pedido foi recebido com sucesso
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Number */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Número do Pedido</p>
              <p className="text-2xl font-heading font-bold">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                <span>
                  {items.length} {items.length === 1 ? "item" : "itens"} no pedido
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {order.subtotal?.toFixed(2) || "0.00"}</span>
                </div>

                {order.freight_cost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span>R$ {order.freight_cost.toFixed(2)}</span>
                  </div>
                )}

                {order.freight_cost === 0 && order.subtotal >= 500 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-accent font-medium">Grátis</span>
                  </div>
                )}

                {order.urgency_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa urgência</span>
                    <span>R$ {order.urgency_fee.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-accent">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>

              {order.is_urgent && (
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                  Entrega Urgente
                </Badge>
              )}

              <div className="text-sm text-muted-foreground">
                Prazo estimado:{" "}
                <span className="font-medium">
                  {order.is_urgent
                    ? "Entrega no mesmo dia"
                    : order.estimated_delivery_days === 2
                    ? "2 dias úteis"
                    : "5 a 7 dias úteis"}
                </span>
              </div>
            </div>

            {/* Email Notice */}
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Confirmação por email</p>
                  <p className="text-muted-foreground">
                    Você receberá um email com os detalhes do pedido e atualizações sobre o
                    status da entrega.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/pedido" className="flex-1">
                <Button variant="outline" className="w-full">
                  Fazer Novo Pedido
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-accent hover:bg-accent/90">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}