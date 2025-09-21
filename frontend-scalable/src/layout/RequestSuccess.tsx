import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Cards";
import { Button } from "../components/Button";
import { CheckCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";

export const RequestSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactionData, setTransactionData] = useState<{
    message: string;
    transactionHash: string;
  } | null>(null);

  useEffect(() => {
    if (location.state) {
      setTransactionData(location.state);
    }
  }, [location]);

  if (!transactionData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>No se encontraron datos de transacción.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} className="w-full">
                Volver al Inicio
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">¡Solicitud Creada Exitosamente!</CardTitle>
              <CardDescription>
                {transactionData.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactionData.transactionHash && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Hash de Transacción:</p>
                  <p className="text-xs font-mono break-words">
                    {transactionData.transactionHash}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      window.open(
                        `https://sepolia.etherscan.io/tx/${transactionData.transactionHash}`,
                        '_blank'
                      );
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver en Explorer
                  </Button>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate("/explorer")}>
                  Explorar Proyectos
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/create-request")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Crear Otra Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};