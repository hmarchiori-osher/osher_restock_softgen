import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, TrendingUp, ShoppingCart } from "lucide-react";
import { orderService, type OrderStats } from "@/services/orderService";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [statsData, ordersData] = await Promise.all([
        orderService.getMonthStats(),
        orderService.getRecent(5),
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-500",
    confirmed: "bg-green-500",
    separating: "bg-yellow-500",
    shipped: "bg-purple-500",
    delivered: "bg-gray-500",
  };

  const statusLabels: Record<string, string> = {
    new: "Novo",
    confirmed: "Confirmado",
    separating: "Em Separação",
    shipped: "Enviado",
    delivered: "Entregue",
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Dashboard - Osher Restock" />
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral das atividades do mês
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos do Mês
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold">
                {stats?.totalOrders || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos Pendentes
              </CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-yellow-600">
                {stats?.pendingOrders || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-accent">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats?.monthRevenue || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pedidos Recentes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Últimos 5 pedidos recebidos
              </p>
            </div>
            <Link href="/admin/orders">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pedido ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-heading font-semibold">
                          {order.order_number}
                        </span>
                        <Badge
                          className={statusColors[order.status]}
                          variant="secondary"
                        >
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.branches?.networks?.name} - {order.branches?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(order.total))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
