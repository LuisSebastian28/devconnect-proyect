import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Button } from "../components/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Cards";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { ArrowLeft, DollarSign, FileText, Building2, Zap, Leaf, Heart, GraduationCap, Loader2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import LENDING_FACTORY_ABI from "../lib/ABI/FactoryABI.json";

const FACTORY_ADDRESS = "0x3C717aCB71C27Cd32A319197788310e095b02E74";

// Mapeo de categorías del frontend a categorías del contrato
const CATEGORY_MAPPING = {
  "real-estate": "Real Estate",
  "technology": "Technology", 
  "green-energy": "Green Energy",
  "healthcare": "Healthcare",
  "education": "Education"
};

const categories = [
  { value: "real-estate", label: "Real Estate", icon: Building2 },
  { value: "technology", label: "Technology", icon: Zap },
  { value: "green-energy", label: "Green Energy", icon: Leaf },
  { value: "healthcare", label: "Healthcare", icon: Heart },
  { value: "education", label: "Education", icon: GraduationCap },
];

export const CreateLoanRequest = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    category: "",
    loanAmount: "",
    duration: "",
    expectedROI: "",
    businessPlan: "",
    originCountry: "",
    estimatedCost: "",
    expectedSalePrice: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validaciones básicas
      if (!window.ethereum) {
        throw new Error("MetaMask no está instalado");
      }

      if (!isConnected || !address) {
        throw new Error("Wallet no conectada");
      }

      // Convertir valores a formatos adecuados para blockchain
      const loanAmountInWei = ethers.parseEther(formData.loanAmount);
      const estimatedCostInWei = ethers.parseEther(formData.estimatedCost);
      const expectedSalePriceInWei = ethers.parseEther(formData.expectedSalePrice);
      const expectedROIInBasisPoints = Math.floor(parseFloat(formData.expectedROI) * 100); // Convertir a basis points

      // Crear objeto ProductInfo para el contrato
      const productInfo = {
        productName: formData.projectName,
        description: formData.description,
        category: CATEGORY_MAPPING[formData.category] || "Other",
        originCountry: formData.originCountry || "Unknown",
        estimatedCost: estimatedCostInWei,
        expectedSalePrice: expectedSalePriceInWei,
        expectedROI: expectedROIInBasisPoints,
        businessPlan: formData.businessPlan
      };

      // Conectar con el contrato Factory
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factoryContract = new ethers.Contract(
        FACTORY_ADDRESS,
        LENDING_FACTORY_ABI,
        signer
      );

      // Calcular el stake requerido (10% del monto del préstamo)
      const requiredStake = (loanAmountInWei * 10n) / 100n;

      // Llamar a la función createLoan del contrato
      const transaction = await factoryContract.createLoan(
        loanAmountInWei,
        parseInt(formData.duration),
        productInfo,
        { value: requiredStake }
      );

      // Esperar a que la transacción se mine
      await transaction.wait();

      // Navegar a página de éxito
      navigate("/request-success", { 
        state: { 
          message: "Solicitud de préstamo creada exitosamente",
          transactionHash: transaction.hash
        }
      });

    } catch (err: any) {
      console.error("Error creating loan request:", err);
      setError(err.message || "Error al crear la solicitud de préstamo");
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Conecta tu Wallet</CardTitle>
              <CardDescription>Necesitas conectar tu wallet para crear una solicitud de préstamo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} className="w-full">
                Conectar Wallet
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
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                Crear Solicitud de Financiamiento
              </CardTitle>
              <CardDescription>
                Completa la información de tu proyecto para solicitar financiamiento. 
                Deberás depositar un stake del 10% del monto solicitado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="projectName" className="block text-sm font-medium mb-2">
                      Nombre del Proyecto *
                    </label>
                    <Input
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      placeholder="Ej: Desarrollo de Software para Gestión Agrícola"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      Descripción del Proyecto *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe en detalle tu proyecto, objetivos y cómo planeas utilizar los fondos..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-2">
                        Categoría *
                      </label>
                      <Select onValueChange={(value) => handleSelectChange("category", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => {
                            const IconComponent = category.icon;
                            return (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center">
                                  <IconComponent className="w-4 h-4 mr-2" />
                                  {category.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="originCountry" className="block text-sm font-medium mb-2">
                        País de Origen *
                      </label>
                      <Input
                        id="originCountry"
                        name="originCountry"
                        value={formData.originCountry}
                        onChange={handleChange}
                        placeholder="Ej: Estados Unidos"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="loanAmount" className="block text-sm font-medium mb-2">
                        Monto Solicitado (ETH) *
                      </label>
                      <Input
                        id="loanAmount"
                        name="loanAmount"
                        type="number"
                        value={formData.loanAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0.1"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium mb-2">
                        Duración (días) *
                      </label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="30"
                        min="7"
                        max="365"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="expectedROI" className="block text-sm font-medium mb-2">
                        ROI Esperado (%) *
                      </label>
                      <Input
                        id="expectedROI"
                        name="expectedROI"
                        type="number"
                        value={formData.expectedROI}
                        onChange={handleChange}
                        placeholder="15.5"
                        min="5"
                        max="50"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="estimatedCost" className="block text-sm font-medium mb-2">
                        Costo Estimado (ETH) *
                      </label>
                      <Input
                        id="estimatedCost"
                        name="estimatedCost"
                        type="number"
                        value={formData.estimatedCost}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0.1"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="expectedSalePrice" className="block text-sm font-medium mb-2">
                        Precio de Venta Esperado (ETH) *
                      </label>
                      <Input
                        id="expectedSalePrice"
                        name="expectedSalePrice"
                        type="number"
                        value={formData.expectedSalePrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0.1"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="businessPlan" className="block text-sm font-medium mb-2">
                      Plan de Negocio *
                    </label>
                    <textarea
                      id="businessPlan"
                      name="businessPlan"
                      value={formData.businessPlan}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Detalla tu plan de negocio, modelo de ingresos, proyecciones financieras, etc."
                      required
                    />
                  </div>

                  {formData.loanAmount && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Stake requerido:</strong> {parseFloat(formData.loanAmount) * 0.1} ETH
                        <br />
                        <span className="text-xs">
                          (10% del monto solicitado que se depositará como garantía)
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Crear Solicitud
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};