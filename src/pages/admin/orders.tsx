import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import { networkService } from "@/services/networkService";
import { branchService } from "@/services/branchService";
import { Eye, Download, Filter, Package } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders"> & {
  branches?: {
    id: string;
    name: string;
    cnpj: string;
    networks?: {
      id: string;
      name: string;
      logo_url: string | null;
    };
  };
};

type Network = Tables<"networks">;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filters
  const [filterNetwork, setFilterNetwork] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersData, networksData] = await Promise.all([
        orderService.list(),
        networkService.list(),
      ]);
      setOrders(ordersData);
      setNetworks(networksData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast({ title: "Status atualizado com sucesso!" });
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      new: { variant: "default", label: "Novo" },
      confirmed: { variant: "secondary", label: "Confirmado" },
      separating: { variant: "outline", label: "Em Separação" },
      shipped: { variant: "outline", label: "Enviado" },
      delivered: { variant: "secondary", label: "Entregue" },
    };
    const config = variants[status] || variants.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  const filteredOrders = orders.filter((order) => {
    if (filterNetwork !== "all" && order.branches?.networks?.id !== filterNetwork) return false;
    if (filterStatus !== "all" && order.status !== filterStatus) return false;
    return true;
  });

  return (
    <AdminLayout>
      <SEO title="Pedidos - Osher Restock" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Pedidos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os pedidos das filiais
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rede</label>
                <Select value={filterNetwork} onValueChange={setFilterNetwork}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as redes</SelectItem>
                    {networks.map((network) => (
                      <SelectItem key={network.id} value={network.id}>
                        {network.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="separating">Em Separação</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {orders.length === 0 ? "Nenhum pedido ainda." : "Nenhum pedido encontrado com os filtros aplicados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        Pedido #{order.order_number}
                      </CardTitle>
                      <CardDescription>
                        {order.branches?.networks?.name} - {order.branches?.name}
                        <br />
                        CNPJ: {order.branches?.cnpj}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-semibold text-lg">
                        R$ {order.total.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frete:</span>
                      <p className="font-semibold">
                        {order.freight_cost > 0 ? `R$ ${order.freight_cost.toFixed(2)}` : "Grátis"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Previsão:</span>
                      <p className="font-semibold">
                        {order.estimated_delivery
                          ? new Date(order.estimated_delivery).toLocaleDateString("pt-BR")
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {order.urgent_fee > 0 && (
                    <Badge variant="destructive">
                      Urgente (+R$ {order.urgent_fee.toFixed(2)})
                    </Badge>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalhes
                    </Button>

                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Novo</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="separating">Em Separação</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Criado em: {new Date(order.created_at).toLocaleString("pt-BR")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
              <DialogDescription>
                Pedido #{selectedOrder?.order_number}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Branch Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Filial</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Rede:</strong> {selectedOrder.branches?.networks?.name}</p>
                    <p><strong>Filial:</strong> {selectedOrder.branches?.name}</p>
                    <p><strong>CNPJ:</strong> {selectedOrder.branches?.cnpj}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Itens do Pedido</h3>
                  <div className="border rounded-lg divide-y">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          R$ {(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Costs */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Resumo Financeiro</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {(selectedOrder.total - selectedOrder.freight_cost - selectedOrder.urgent_fee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frete ({selectedOrder.freight_option || "Padrão"}):</span>
                      <span>
                        {selectedOrder.freight_cost > 0
                          ? `R$ ${selectedOrder.freight_cost.toFixed(2)}`
                          : "Grátis"}
                      </span>
                    </div>
                    {selectedOrder.urgent_fee > 0 && (
                      <div className="flex justify-between text-destructive">
                        <span>Taxa de urgência:</span>
                        <span>R$ {selectedOrder.urgent_fee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>R$ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Observações</h3>
                    <p className="text-sm p-3 bg-muted rounded">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Attachment */}
                {selectedOrder.attachment_url && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Anexo (Pedido de Compra)</h3>
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedOrder.attachment_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Anexo
                      </a>
                    </Button>
                  </div>
                )}

                {/* Delivery Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Entrega</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Previsão:</strong>{" "}
                      {selectedOrder.estimated_delivery
                        ? new Date(selectedOrder.estimated_delivery).toLocaleDateString("pt-BR")
                        : "A definir"}
                    </p>
                    <p>
                      <strong>Status:</strong> {getStatusBadge(selectedOrder.status)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}