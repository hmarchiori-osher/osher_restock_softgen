import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MontarPedidoPage() {
  const router = useRouter();
  const { branchId } = router.query;

  return (
    <>
      <SEO title="Montar Pedido - Osher Restock" />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="container max-w-4xl mx-auto py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h1 className="text-2xl font-heading font-bold mb-4">
                Montagem de Pedido
              </h1>
              <p className="text-muted-foreground mb-6">
                Esta etapa será implementada em breve.
              </p>
              <p className="text-sm text-muted-foreground">
                Branch ID: {branchId}
              </p>
              <Button 
                onClick={() => router.push("/pedido")}
                variant="outline"
                className="mt-6"
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}