import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Cards";
import { Progress } from "../components/Progress";
import { Button } from "../components/Button";
import {
  ArrowRight,
  Badge,
  Check,
  Filter,
  Globe2,
  Mail,
  Search,
  Users2,
  Zap,
} from "lucide-react";
import {
  TrendingUp,
  Users,
  Shield,
  BarChart3,
  Star,
  MapPin,
  ArrowUpRight,
  Lock,
} from "lucide-react";
import { Input } from "../components/ui/Input";
import Footer from "../components/Footer";
import LENDING_FACTORY_ABI from "../lib/ABI/FactoryABI.json";
import LENDING_PROJECT_ABI from "../lib/ABI/LendingABI.json";

const FACTORY_ADDRESS = "0x3C717aCB71C27Cd32A319197788310e095b02E74";

const entrepreneurBenefits = [
  "Financing without personal guarantees",
  "Access to capital within 72 hours",
  "International contact network",
  "Logistics and trade consulting",
];

const investorBenefits = [
  "Returns above 12% annually",
  "Portfolio diversification",
  "Investment from $1,000 USD",
  "Full operational transparency",
];

const steps = [
  {
    icon: Search,
    title: "Identify Opportunities",
    description:
      "Entrepreneurs present products with proven demand and detailed import plans",
    color: "text-blue-400",
  },
  {
    icon: Users,
    title: "Collective Investment",
    description:
      "Multiple investors fund the operation, diversifying risk and maximizing opportunities",
    color: "text-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Guaranteed Returns",
    description:
      "Product commercialization generates profits distributed proportionally among investors",
    color: "text-blue-600",
  },
];

const features = [
  {
    icon: Shield,
    title: "Secure Investments",
    description:
      "Smart contracts that guarantee transparency and security in every transaction",
  },
  {
    icon: Zap,
    title: "Agile Process",
    description: "From proposal to funding in less than 72 hours",
  },
  {
    icon: BarChart3,
    title: "Market Analysis",
    description: "Advanced tools to evaluate demand and project returns",
  },
  {
    icon: Lock,
    title: "Real Guarantees",
    description:
      "Backed by inventory and merchandise insurance to minimize risks",
  },
  {
    icon: Globe2,
    title: "Global Reach",
    description: "Access to international products and markets without borders",
  },
  {
    icon: Users2,
    title: "Active Community",
    description:
      "Network of verified and committed entrepreneurs and investors",
  },
];

export default function Catalog() {
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalFunded: 0,
    activeInvestors: 0,
    successRate: 0,
    avgROI: 0,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const factory = new ethers.Contract(
      FACTORY_ADDRESS,
      LENDING_FACTORY_ABI,
      provider
    );

    const loanAddresses: string[] = await factory.getAllLoans();

    let totalFunded = 0;
    let totalROI = 0;
    let totalLoans = loanAddresses.length;
    let successful = 0;
    let investorsSet = new Set<string>();

    const projectData = await Promise.all(
      loanAddresses.map(async (addr) => {
        const loan = new ethers.Contract(addr, LENDING_PROJECT_ABI, provider);

        const [info, loanAmount, duration, interestRate, progress] =
          await Promise.all([
            loan.getProductInfo(),
            loan.loanAmount(),
            loan.duration(),
            loan.interestRate(),
            loan.getProjectProgress(),
          ]);

        const fundedPercent =
          (Number(progress.completed) / Number(progress.total)) * 100;

        totalFunded += Number(progress.completed);
        totalROI += Number(info.expectedROI);
        if (progress.completed === progress.total) successful++;

        // 🔹 Mock de backers (puedes reemplazar con lenders.length)
        const backers = Math.floor(Math.random() * 50) + 1;
        Array.from({ length: backers }).forEach((_, i) =>
          investorsSet.add(`${addr}-${i}`)
        );

        return {
          id: addr,
          title: info.productName,
          description: info.description,
          category: info.category,
          location: info.originCountry,
          roi: `${info.expectedROI.toString()}%`,
          duration: `${duration.toString()} days`,
          funded: fundedPercent,
          target: Number(ethers.formatEther(loanAmount)),
          rating: 4.5, // mock
          backers,
          image: "/placeholder.svg",
          risk: "Medium",
        };
      })
    );

    setProjects(projectData);

    setStats({
      totalFunded,
      activeInvestors: investorsSet.size,
      successRate: totalLoans > 0 ? (successful / totalLoans) * 100 : 0,
      avgROI: totalLoans > 0 ? totalROI / totalLoans : 0,
    });
  }

  return (
    <div>
      <main className="container mx-auto px-4 py-8 space-y-12">
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
            <p className="text-xl text-muted-foreground  text-indigo-600 max-w-2xl mx-auto text-pretty">
              Discover vetted projects, diversify your portfolio, and earn
              competitive returns through our secure Ethereum L2 platform.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-accent text-green-700" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Funded</p>
                  <p className="text-2xl font-bold">
                    ${stats.totalFunded.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center space-x-2">
                <Users className="w-5 h-5 text-accent text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Investors
                  </p>
                  <p className="text-2xl font-bold">{stats.activeInvestors}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-accent text-blue-800" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.successRate.toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. ROI</p>
                  <p className="text-2xl font-bold">
                    {stats.avgROI.toFixed(1)}%
                  </p>
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
              <Button variant="outline">
                View All
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video relative">
                    <Badge className="absolute top-3 right-3">
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
                      <div className="col-span-2 flex items-center space-x-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{project.location}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {project.funded.toFixed(1)}%
                        </span>
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

          {/* How It Works Section */}
          <section className="py-16 bg-slate-50 -mx-4 px-4">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                  How It Works
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  A simple and transparent process to finance successful imports
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative group">
                    {/* Animated connection line */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-[60%] w-full">
                        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent relative overflow-hidden">
                          {/* Animated glow effect */}
                          <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
                        </div>
                        {/* Animated dots */}
                        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
                          <div
                            className="w-2 h-2 rounded-full bg-indigo-500 opacity-75"
                            style={{ animation: "flowDot 3s infinite" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-indigo-400 opacity-75"
                            style={{ animation: "flowDot 3s infinite 1s" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-indigo-400 opacity-75"
                            style={{ animation: "flowDot 3s infinite 2s" }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
                      {/* Step number */}
                      <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center mb-6`}
                      >
                        <step.icon className={`w-8 h-8 ${step.color}`} />
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold mb-3 text-slate-900">
                        {step.title}
                      </h3>
                      <p className="text-slate-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-24 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 -mx-4 px-4">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                  Benefits for Everyone
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  A platform designed to create shared value
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Entrepreneurs Card */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-indigo-400/20">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-indigo-700 border text-sm font-medium mb-4">
                      For Entrepreneurs
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-slate-900">
                      Grow Your Business
                    </h3>
                    <p className="text-slate-600">
                      Get the capital needed to import profitable products
                      without compromising your personal assets
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {entrepreneurBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-indigo-600" />
                        </div>
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    className="w-full group bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Request Funding
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Investors Card */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-500/20">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500 text-white text-sm font-medium mb-4">
                      For Investors
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-slate-900">
                      Multiply Your Capital
                    </h3>
                    <p className="text-slate-600">
                      Invest in real operations with attractive returns and
                      controlled risk
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {investorBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    className="w-full group border-2 border-indigo-600 bg-transparent hover:bg-indigo-50 text-indigo-600"
                  >
                    Start Investing
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 -mx-4 px-4">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                  Why Choose FundMyImport
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  The most reliable platform for import financing
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-indigo-100"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-gradient-to-br from-indigo-600 to-indigo-800 relative overflow-hidden -mx-4">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Start Your Journey to Financial Success
                </h2>
                <p className="text-xl text-white/90 mb-10">
                  Join thousands of entrepreneurs and investors who are already
                  transforming international trade
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button
                    size="lg"
                    className="group bg-white text-indigo-600 hover:bg-white/90"
                  >
                    Register Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20"
                  >
                    <Mail className="mr-2 w-4 h-4" />
                    Contact Advisor
                  </Button>
                </div>

                <p className="text-sm text-white/70">
                  No commitment • Free registration • Personal advisory
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
