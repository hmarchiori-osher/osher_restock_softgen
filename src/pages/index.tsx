
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Truck, Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <SEO 
        title="Osher Restock - Portal B2B de Pedidos"
        description="Plataforma B2B para gestão de pedidos de insumos entre fornecedores e redes de varejo. Simples, rápido e profissional."
      />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-primary">
              Osher Restock
            </h1>
            <nav className="flex gap-4">
              <Link href="/admin/login">
                <Button variant="outline">Área Admin</Button>
              </Link>
              <Link href="/pedido">
                <Button className="bg-accent hover:bg-accent/90">
                  Fazer Pedido
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-foreground leading-tight">
              Pedidos B2B <span className="text-primary">Simplificados</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Portal profissional para fornecedores gerenciarem pedidos de redes de varejo. 
              White-label, mobile-first, e pronto em 2 minutos.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/pedido">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
                  Acessar como Filial
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Login Admin
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-semibold">
                Gestão de Produtos
              </h3>
              <p className="text-sm text-muted-foreground">
                Controle de estoque, preços e visibilidade por rede
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-heading font-semibold">
                Frete Inteligente
              </h3>
              <p className="text-sm text-muted-foreground">
                Cálculo automático, frete grátis e opção urgente
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-semibold">
                Multi-Redes
              </h3>
              <p className="text-sm text-muted-foreground">
                Gerencie múltiplas redes e filiais em um só lugar
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-heading font-semibold">
                White-Label
              </h3>
              <p className="text-sm text-muted-foreground">
                Logo e cores da marca do cliente em cada pedido
              </p>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-card/50 mt-20">
          <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Osher Restock. Portal B2B de Pedidos.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
