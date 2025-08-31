import { DollarSign } from "lucide-react";
import { Button } from "./Button";
import { useState } from "react";
import { useAccount } from "wagmi";

import { WalletOptions } from "./WalletOptions";
import { Account } from "./Account";

function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}

export const Navbar = () => {
  const [activeTab, setActiveTab] = useState("marketplace");
  const navItems = [
    { key: "marketplace", label: "Marketplace", path: "/marketplace" },
    { key: "explorer", label: "Project Explorer", path: "/explorer" },
    { key: "dashboard", label: "Dashboard", path: "/dashboard" },
    { key: "organizer", label: "Organizer", path: "/organizer" },
  ];
  return (
    <div>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center"></div>
                <DollarSign className="w-5 h-5 text-accent-foreground" />
                <h1 className="text-xl font-bold text-foreground cursor-crosshair">
                  CrowdLend
                </h1>
              </div>
              <nav className="hidden md:flex items-center justify-center flex-1">
                <div className="flex w-full justify-center gap-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.key}
                      variant={activeTab === item.key ? "default" : "ghost"}
                      onClick={() => {
                        setActiveTab(item.key);
                        //navigate(item.path);
                      }}
                      className="transition-all hover:font-bold hover:text-lg cursor-pointer"
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </nav>
            </div>
            <div className="flex items-center space-x-4">{ConnectWallet()}</div>
          </div>
        </div>
      </header>
    </div>
  );
};
