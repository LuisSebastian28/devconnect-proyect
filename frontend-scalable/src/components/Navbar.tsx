import { DollarSign, Wallet } from "lucide-react";
import { Button } from "./Button";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export const Navbar = () => {
  const [activeTab, setActiveTab] = useState("marketplace");
  return (
    <div>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">CrowdLend</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Button
                  variant={activeTab === "marketplace" ? "default" : "ghost"}
                  onClick={() => setActiveTab("marketplace")}
                >
                  Marketplace
                </Button>
                <Button
                  variant={activeTab === "explorer" ? "default" : "ghost"}
                  onClick={() => setActiveTab("explorer")}
                >
                  Project Explorer
                </Button>
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  onClick={() => setActiveTab("dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === "organizer" ? "default" : "ghost"}
                  onClick={() => setActiveTab("organizer")}
                >
                  Organizer
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
              <Avatar>
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
