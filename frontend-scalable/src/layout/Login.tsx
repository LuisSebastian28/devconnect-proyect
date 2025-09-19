// src/layout/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Cards";
import { Button } from "../components/Button";
import { Input } from "../components/ui/Input";
import Separator from "../components/ui/separator";
import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { Phone, ArrowLeft, Eye, EyeOff, Mail, User, Building } from "lucide-react";

// Datos de códigos de país
const countryCodes = [
  { code: "+1", country: "Estados Unidos", flag: "🇺🇸" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+34", country: "España", flag: "🇪🇸" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
];

export default function Login() {
  const navigate = useNavigate();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[7]); // Bolivia por defecto
  const [userType, setUserType] = useState<"investor" | "entrepreneur">("investor");
  const [loginData, setLoginData] = useState({
    phone: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo números
    const value = e.target.value.replace(/\D/g, '');
    setLoginData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de inicio de sesión aquí
    const fullPhone = `${selectedCountry.code}${loginData.phone}`;
    console.log("Iniciando sesión:", { 
      userType, 
      phone: fullPhone,
      password: loginData.password
    });
    // Redirigir al dashboard después del login exitoso
    navigate("/dashboard");
  };

  const selectCountry = (country: any) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-md">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-gray-600">
                Accede a tu cuenta de CrowdLend
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Selector de tipo de usuario */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-blue-100 rounded-lg mb-6">
                <Button
                  type="button"
                  variant={userType === "investor" ? "default" : "ghost"}
                  className={`rounded-md transition-all ${
                    userType === "investor" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-blue-700 hover:bg-blue-200"
                  }`}
                  onClick={() => setUserType("investor")}
                >
                  Inversionista
                </Button>
                <Button
                  type="button"
                  variant={userType === "entrepreneur" ? "default" : "ghost"}
                  className={`rounded-md transition-all ${
                    userType === "entrepreneur" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-blue-700 hover:bg-blue-200"
                  }`}
                  onClick={() => setUserType("entrepreneur")}
                >
                  Emprendedor
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Teléfono con selector de país */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Número de Celular
                  </label>
                  <div className="flex gap-2">
                    {/* Selector de código de país */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center gap-2 px-3 py-2 h-10 border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none min-w-[80px]"
                      >
                        <span>{selectedCountry.flag}</span>
                        <span className="text-sm">{selectedCountry.code}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          {countryCodes.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => selectCountry(country)}
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
                            >
                              <span className="text-lg">{country.flag}</span>
                              <span className="flex-1 text-left">{country.country}</span>
                              <span className="text-blue-600">{country.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Número de teléfono */}
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="71234567"
                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={loginData.phone}
                        onChange={handlePhoneChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  size="lg"
                >
                  Iniciar Sesión
                </Button>
              </form>

              <Separator className="my-6 bg-gray-200" />

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  ¿No tienes una cuenta?{" "}
                  <Link to="/register" className="text-blue-600 font-medium hover:text-blue-800">
                    Regístrate ahora
                  </Link>
                </p>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Componente ChevronDown para el selector
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// Componente Check
function Check({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}