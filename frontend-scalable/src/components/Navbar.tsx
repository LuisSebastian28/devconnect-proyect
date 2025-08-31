import { DollarSign, Wallet } from "lucide-react";
import { Button } from "./Button";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [activeTab, setActiveTab] = useState("marketplace");
  //const navigate = useNavigate();
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
            <div className="flex items-center space-x-4 cursor-crosshair">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center bg-purple-500">
                  <DollarSign className="w-5 h-5 text-accent-foreground" />
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
                      //navigate(item.path);
                    }}
                    className=" border full-rounded transition-all hover:font-bold hover:text-lg hover:bg-purple-100 cursor-pointer"
                    >
                    {item.label}
                    </Button>
                  ))}
                  </div>
                </nav>
                </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Wallet className="w-4 h-4 mr-2 hover:" />
                Connect Wallet
              </Button>
              <Avatar className="w-8 h-8 border items-center justify-center rounded-full">
                <AvatarImage src="/diverse-user-avatars.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
