import { DollarSign, User, LogIn } from "lucide-react";
import { Button } from "./Button";
import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletOptions } from "./WalletOptions";
import { Account } from "./Account";
import { useNavigate } from "react-router-dom";

function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}

export const Navbar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explorer");
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  
  const navItems = [
    { key: "explorer", label: "Buscar Inversiones", path: "/explorer" },
    { key: "entrepreneur", label: "Emprendedores", path: "/entrepreneurs" },
  ];

  const handleAuthAction = (action: string) => {
    setShowAuthDropdown(false);
    if (action === "login") {
      navigate("/login");
    } else if (action === "register") {
      navigate("/register");
    }
  };

  return (
    <div>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y nombre */}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">CrowdLend</h1>
            </div>

            {/* Navegación */}
            <div className="flex-1 mx-6">
              <nav className="hidden md:flex items-center justify-center">
                <div className="flex gap-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.key}
                      variant={activeTab === item.key ? "default" : "ghost"}
                      onClick={() => {
                        setActiveTab(item.key);
                        navigate(item.path);
                      }}
                      className="border full-rounded transition-all hover:font-bold hover:text-lg hover:bg-purple-100 cursor-pointer"
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Acciones de usuario */}
            <div className="flex items-center space-x-4">
              {/* Conectar billetera */}
              <ConnectWallet />
              
              {/* Dropdown de autenticación */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-gray-200 hover:bg-gray-50"
                  onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                >
                  <User className="w-5 h-5" />
                </Button>
                
                {showAuthDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => handleAuthAction("login")}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Iniciar Sesión
                      </button>
                      <button
                        onClick={() => handleAuthAction("register")}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Registrarse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};