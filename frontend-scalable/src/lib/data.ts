import {
  Globe,
  Building,
  Leaf,
  Cpu,
  Heart,
  Home,
  Car,
  Briefcase,
} from "lucide-react";

export const featuredProjects = [
  {
    id: 1,
    title: "Solar Energy Farm Expansion",
    category: "Renewable Energy",
    description:
      "Large-scale solar installation to power 10,000 homes with clean energy",
    roi: "12.5%",
    duration: "24 months",
    risk: "Low",
    rating: 4.8,
    location: "California, USA",
    funded: 75,
    target: 500000,
    backers: 234,
    image: "/expansive-solar-farm.png",
    minInvestment: 1000,
    historicalPerformance: "+15.2%",
  },
  {
    id: 2,
    title: "Urban Vertical Farm",
    category: "Agriculture",
    description:
      "Innovative vertical farming solution for sustainable urban food production",
    roi: "15.2%",
    duration: "18 months",
    risk: "Medium",
    rating: 4.6,
    location: "New York, USA",
    funded: 60,
    target: 300000,
    backers: 156,
    image: "/vertical-farm.png",
    minInvestment: 500,
    historicalPerformance: "+18.7%",
  },
  {
    id: 3,
    title: "Tech Startup Expansion",
    category: "Technology",
    description: "AI-powered logistics platform expanding to European markets",
    roi: "18.7%",
    duration: "36 months",
    risk: "High",
    rating: 4.4,
    location: "London, UK",
    funded: 45,
    target: 750000,
    backers: 89,
    image: "/tech-startup-office.png",
    minInvestment: 2500,
    historicalPerformance: "+22.1%",
  },
  {
    id: 4,
    title: "Affordable Housing Project",
    category: "Real Estate",
    description: "Sustainable housing development for middle-income families",
    roi: "11.8%",
    duration: "30 months",
    risk: "Low",
    rating: 4.7,
    location: "Austin, USA",
    funded: 85,
    target: 1200000,
    backers: 312,
    image: "/affordable-housing.png",
    minInvestment: 5000,
    historicalPerformance: "+13.4%",
  },
  {
    id: 5,
    title: "Electric Vehicle Fleet",
    category: "Transportation",
    description: "Commercial EV fleet for sustainable urban delivery services",
    roi: "14.3%",
    duration: "24 months",
    risk: "Medium",
    rating: 4.5,
    location: "Berlin, Germany",
    funded: 70,
    target: 400000,
    backers: 198,
    image: "/electric-vehicle-fleet.png",
    minInvestment: 1500,
    historicalPerformance: "+16.8%",
  },
  {
    id: 6,
    title: "Healthcare Innovation Lab",
    category: "Healthcare",
    description: "Medical device development for early disease detection",
    roi: "20.1%",
    duration: "42 months",
    risk: "High",
    rating: 4.3,
    location: "Boston, USA",
    funded: 35,
    target: 900000,
    backers: 67,
    image: "/healthcare-lab.png",
    minInvestment: 10000,
    historicalPerformance: "+25.3%",
  },
];

export const categories = [
  { name: "All Categories", count: 156, icon: Globe },
  { name: "Renewable Energy", count: 42, icon: Leaf },
  { name: "Technology", count: 38, icon: Cpu },
  { name: "Real Estate", count: 29, icon: Building },
  { name: "Healthcare", count: 24, icon: Heart },
  { name: "Agriculture", count: 18, icon: Home },
  { name: "Transportation", count: 15, icon: Car },
  { name: "Other", count: 12, icon: Briefcase },
];

export function getRiskColor(risk: string) {
  switch (risk) {
    case "Low":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "High":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
}

export function getCategoryIcon(category: string) {
  switch (category) {
    case "Renewable Energy":
      return Leaf;
    case "Technology":
      return Cpu;
    case "Real Estate":
      return Building;
    case "Healthcare":
      return Heart;
    case "Agriculture":
      return Home;
    case "Transportation":
      return Car;
    default:
      return Briefcase;
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Completed":
      return "bg-blue-100 text-blue-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
