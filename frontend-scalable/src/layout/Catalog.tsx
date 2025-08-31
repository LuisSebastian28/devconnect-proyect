import {
  BarChart3,
  Filter,
  Search,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Cards";

function Catalog() {
  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground text-balance">
              Invest in the Future with Blockchain-Powered Crowdlending
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover vetted projects, diversify your portfolio, and earn
              competitive returns through our secure Ethereum L2 platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search projects..." className="pl-10" />
              </div>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-black text-white"
              >
                <Filter className="w-4 h-4 mr-2 text-white" />
                Filters
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Funded
                    </p>
                    <p className="text-2xl font-bold">$12.5M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Investors
                    </p>
                    <p className="text-2xl font-bold">2,847</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold">94.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. ROI</p>
                    <p className="text-2xl font-bold">14.8%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Marketplace</h3>
              <p className="text-sm text-muted-foreground">
                Browse and discover new opportunities
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Project Explorer</h3>
              <p className="text-sm text-muted-foreground">
                Search and explore projects
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                View your personal dashboard
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Organizer</h3>
              <p className="text-sm text-muted-foreground">
                Organize and manage your content
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Catalog;
