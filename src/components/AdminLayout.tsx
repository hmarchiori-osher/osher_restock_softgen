import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Package, 
  ShoppingCart, 
  Settings,
  LogOut
} from "lucide-react";
import { authService } from "@/services/authService";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { profile, loading } = useAuth(true);
  const router = useRouter();

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/networks", icon: Building2, label: "Redes" },
    { href: "/admin/branches", icon: MapPin, label: "Filiais" },
    { href: "/admin/products", icon: Package, label: "Produtos" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Pedidos" },
    { href: "/admin/settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <Link href="/admin">
            <h1 className="text-2xl font-heading font-bold text-primary">
              Osher Restock
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">Painel Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium">{profile?.email}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
