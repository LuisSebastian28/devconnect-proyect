import {
  ArrowUpRight,
  Badge,
  BarChart3,
  Filter,
  MapPin,
  Search,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Cards";
import { featuredProjects, getRiskColor } from "../lib/data";
import { useState } from "react";
import { Progress } from "../components/Progress";

function Catalog() {
  const [activeTab, setActiveTab] = useState("marketplace");

  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            {/* Searchbar Hero */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-screen mx-auto">
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
            {/* Content Hero */}
            <h2 className="text-4xl font-bold text-foreground text-balance">
              Invest in the Future with Blockchain-Powered Crowdlending
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover vetted projects, diversify your portfolio, and earn
              competitive returns through our secure Ethereum L2 platform.
            </p>
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

          {/* Featured Projects */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">
                Featured Projects
              </h3>
              <Button
                variant="outline"
                onClick={() => setActiveTab("explorer")}
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.slice(0, 3).map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video relative">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-3 right-3 ${getRiskColor(project.risk)}`}
                    >
                      {project.risk} Risk
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {project.title}
                        </CardTitle>
                        <CardDescription>{project.category}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {project.rating}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Expected ROI</p>
                        <p className="font-semibold text-green-600">
                          {project.roi}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-semibold">{project.duration}</p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">{project.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.funded}%</span>
                      </div>
                      <Progress value={project.funded} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          $
                          {(
                            (project.target * project.funded) /
                            100
                          ).toLocaleString()}{" "}
                          raised
                        </span>
                        <span>{project.backers} backers</span>
                      </div>
                    </div>

                    <Button className="w-full">Invest Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Catalog;
