import { DollarSign } from "lucide-react";
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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("marketplace");
  const navItems = [
    // { key: "marketplace", label: "Marketplace", path: "/marketplace" },
    { key: "explorer", label: "Project Explorer", path: "/explorer" },
    { key: "entrepreneur", label: "Entrepreneurs", path: "/Entrepreneurs" },
  ];
  return (
    <div>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 cursor-crosshair">
              <div className="flex items-center space-x-2 mr-10">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center bg-indigo-600">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">CrowdLend</h1>
              </div>
              <div className="flex flex-1 justify-end">
                <nav className="hidden md:flex items-center">
                  <div className="flex gap-8">
                    {navItems.map((item) => (
                      <Button
                        key={item.key}
                        variant={activeTab === item.key ? "default" : "ghost"}
                        onClick={() => {
                          setActiveTab(item.key);
                          navigate(item.path);
                        }}
                        className=" border full-rounded transition-all hover:font-bold hover:text-lg hover:bg-purple-100 cursor-crosshair"
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-4">{ConnectWallet()}</div>
          </div>
        </div>
      </header>
    </div>
  );
};
