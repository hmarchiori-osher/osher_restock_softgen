import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, Calendar, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { orderService } from "@/services/orderService";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

export default function SucessoPedidoPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [branch, setBranch] = useState<any>(null);
  const [network, setNetwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderData();
  }, []);

  async function loadOrderData() {
    try {
      const orderId = sessionStorage.getItem("pedido_success_id");
      const branchData = sessionStorage.getItem("pedido_branch");

      if (!orderId || !branchData) {
        router.push("/pedido");
        return;
      }

      const parsedBranch = JSON.parse(branchData);
      setBranch(parsedBranch);
      setNetwork(parsedBranch.networks);

      const orderData = await orderService.getById(orderId);
      setOrder(orderData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading order:", error);
      router.push("/pedido");
    }
  }

  function formatOrderNumber(orderId: string) {
    return `#${orderId.slice(0, 8).toUpperCase()}`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatEstimatedDelivery(dateString: string | null) {
    if (!dateString) return "A confirmar";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <>
      <SEO title="Pedido Confirmado - Osher Restock" />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Header com White-label */}
        {network && (
          <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              {network.logo_url && (
                <img
                  src={network.logo_url}
                  alt={network.name}
                  className="h-8 object-contain"
                />
              )}
              <h1 className="text-lg font-heading font-semibold" style={{ color: network.brand_color || undefined }}>
                {network.name}
              </h1>
            </div>
          </header>
        )}

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
              <CheckCircle2 className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">
              Pedido Confirmado!
            </h2>
            <p className="text-muted-foreground">
              Seu pedido foi enviado com sucesso
            </p>
          </div>

          {/* Order Number Card */}
          <Card className="mb-6 border-2 border-accent">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Número do Pedido
              </p>
              <p className="text-4xl font-heading font-bold text-accent mb-4">
                {formatOrderNumber(order.id)}
              </p>
              <Badge variant="secondary" className="text-sm">
                Status: Aguardando Confirmação
              </Badge>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Detalhes do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Data do Pedido</span>
                <span className="font-medium">{formatDate(order.created_at)}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Entrega Prevista</span>
                <div className="text-right">
                  <p className="font-medium">{formatEstimatedDelivery(order.estimated_delivery)}</p>
                  {order.is_urgent && (
                    <Badge variant="default" className="mt-1 bg-accent">
                      Entrega Urgente
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Forma de Envio</span>
                <span className="font-medium">{order.freight_option || "Não especificado"}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Itens</span>
                <span className="font-medium">
                  {Array.isArray(order.items) ? order.items.length : 0} produto(s)
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold">Valor Total</span>
                <span className="text-2xl font-heading font-bold text-accent">
                  R$ {Number(order.total).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                  1
                </div>
                <p className="text-muted-foreground">
                  Você receberá um email de confirmação com todos os detalhes do pedido
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                  2
                </div>
                <p className="text-muted-foreground">
                  Nossa equipe irá processar seu pedido em até 24 horas úteis
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                  3
                </div>
                <p className="text-muted-foreground">
                  Você será notificado quando o pedido for enviado
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href="/pedido">
              <Button 
                className="w-full" 
                size="lg"
                style={{ 
                  backgroundColor: network?.brand_color || undefined,
                  color: "white"
                }}
              >
                Fazer Novo Pedido
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}