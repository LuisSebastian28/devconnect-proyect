import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Cards"
import { Button } from "../components/Button"
import { Input } from "../components/ui/Input"
import Separator from "../components/ui/separator"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/Progress"
import { Slider } from "../components/ui/slider"
import Select, { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import Footer from "../components/Footer"

import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  TrendingUp,
  BarChart3,
  ArrowLeft,
  Calendar,
  DollarSign,
  Target,
  Building2,
  Zap,
  Leaf,
  Briefcase,
  Heart,
  GraduationCap,
} from "lucide-react"
import { Navbar } from "../components/Navbar"


interface Project {
  id: string
  title: string
  description: string
  category: string
  roi: string
  duration: string
  minInvestment: number
  funded: number
  target: number
  backers: number
  location: string
  historicalPerformance: string
  rating: number
  risk: "Low" | "Medium" | "High"
  image?: string
  fullDescription?: string
  keyMetrics?: {
    totalRaised: number
    averageInvestment: number
    completionRate: number
  }
  timeline?: {
    phase: string
    description: string
    completed: boolean
  }[]
}

interface Category {
  name: string
  icon: any
  count: number
}

const categories: Category[] = [
  { name: "Real Estate", icon: Building2, count: 24 },
  { name: "Technology", icon: Zap, count: 18 },
  { name: "Green Energy", icon: Leaf, count: 12 },
  { name: "Healthcare", icon: Heart, count: 8 },
  { name: "Education", icon: GraduationCap, count: 6 },
]

const featuredProjects: Project[] = [
  {
    id: "1",
    title: "Downtown Mixed-Use Development",
    description: "Premium residential and commercial complex in prime downtown location",
    category: "Real Estate",
    roi: "18.5%",
    duration: "24 months",
    minInvestment: 5000,
    funded: 78,
    target: 2500000,
    backers: 156,
    location: "Austin, TX",
    historicalPerformance: "+22.3%",
    rating: 4.8,
    risk: "Medium",
    image: "/modern-downtown-building-development.png",
    fullDescription:
      "This premium mixed-use development project represents a unique opportunity to invest in Austin's rapidly growing downtown core. The project includes 120 luxury residential units and 15,000 sq ft of premium retail space.",
    keyMetrics: {
      totalRaised: 1950000,
      averageInvestment: 12500,
      completionRate: 95,
    },
    timeline: [
      { phase: "Planning & Permits", description: "Secured all necessary permits and approvals", completed: true },
      { phase: "Foundation & Structure", description: "Complete foundation and structural framework", completed: true },
      { phase: "Interior & Finishing", description: "Interior build-out and finishing work", completed: false },
      { phase: "Final Inspection", description: "Final inspections and occupancy permits", completed: false },
    ],
  },
  {
    id: "2",
    title: "AI-Powered Healthcare Platform",
    description: "Revolutionary diagnostic platform using machine learning for early disease detection",
    category: "Technology",
    roi: "25.2%",
    duration: "18 months",
    minInvestment: 2500,
    funded: 92,
    target: 1800000,
    backers: 203,
    location: "San Francisco, CA",
    historicalPerformance: "+31.7%",
    rating: 4.9,
    risk: "High",
    image: "/ai-healthcare-technology-platform.png",
    fullDescription:
      "Our AI-powered healthcare platform leverages advanced machine learning algorithms to provide early disease detection and personalized treatment recommendations, revolutionizing preventive healthcare.",
    keyMetrics: {
      totalRaised: 1656000,
      averageInvestment: 8157,
      completionRate: 88,
    },
  },
]

const getCategoryIcon = (category: string) => {
  const categoryMap: { [key: string]: any } = {
    "Real Estate": Building2,
    Technology: Zap,
    "Green Energy": Leaf,
    Healthcare: Heart,
    Education: GraduationCap,
  }
  return categoryMap[category] || Briefcase
}

const getRiskColor = (risk: string) => {
  const riskColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  }
  return riskColors[risk as keyof typeof riskColors] || "bg-gray-100 text-gray-800"
}

const SingleProjectView = ({ project, onBack }: { project: Project; onBack: () => void }) => {
  if (!project) {
    return (
      <div className="flex justify-center items-center h-96">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const IconComponent = getCategoryIcon(project.category)

  return (
   <div>
     <Navbar/>
    <div className="space-y-6">
     
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <div className="flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{project.category}</span>
        </div>
      </div>

      {/* Project Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img src={project.image || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover" />
            <Badge className={`absolute top-4 right-4 ${getRiskColor(project.risk)}`}>{project.risk} Risk</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <p className="text-lg text-muted-foreground mt-2">{project.description}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-medium">{project.rating}</span>
              </div>
            </div>

            {project.fullDescription && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground">{project.fullDescription}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          {project.timeline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.timeline.map((phase, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`w-3 h-3 rounded-full mt-2 ${phase.completed ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${phase.completed ? "text-green-700" : "text-muted-foreground"}`}>
                          {phase.phase}
                        </h4>
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Investment Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Expected ROI</p>
                  <p className="text-2xl font-bold text-green-600">{project.roi}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{project.duration}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Minimum Investment</p>
                <p className="text-2xl font-bold">${project.minInvestment.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Funding Progress</span>
                  <span className="font-medium">{project.funded}%</span>
                </div>
                <Progress value={project.funded} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${((project.target * project.funded) / 100).toLocaleString()} raised</span>
                  <span>{project.backers} backers</span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <DollarSign className="w-4 h-4 mr-2" />
                Invest Now
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Star className="w-4 h-4 mr-2" />
                  Favorite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          {project.keyMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Raised</span>
                  <span className="font-medium">${project.keyMetrics.totalRaised.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Investment</span>
                  <span className="font-medium">${project.keyMetrics.averageInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">{project.keyMetrics.completionRate}%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location & Performance */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{project.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Historical Performance</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">{project.historicalPerformance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
   <Footer />
   </div>
  )
}

export default function InvestmentProjects() {
  const [roiRange, setRoiRange] = useState([10, 25])
  const [durationRange, setDurationRange] = useState([12, 36])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  if (selectedProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SingleProjectView project={selectedProject} onBack={() => setSelectedProject(null)} />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Smart Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon
                      return (
                        <div
                          key={category.name}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* ROI Range */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Expected ROI Range</h4>
                  <div className="px-2">
                    <Slider value={roiRange} onValueChange={setRoiRange} max={30} min={5} step={0.5} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{roiRange[0]}%</span>
                      <span>{roiRange[1]}%</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Duration Range */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Duration (Months)</h4>
                  <div className="px-2">
                    <Slider
                      value={durationRange}
                      onValueChange={setDurationRange}
                      max={60}
                      min={6}
                      step={6}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{durationRange[0]}m</span>
                      <span>{durationRange[1]}m</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Risk Level */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Risk Level</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Location</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">Apply Filters</Button>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search projects by name, category, or location..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roi-desc">Highest ROI</SelectItem>
                    <SelectItem value="roi-asc">Lowest ROI</SelectItem>
                    <SelectItem value="funded-desc">Most Funded</SelectItem>
                    <SelectItem value="rating-desc">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Projects List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProjects.map((project) => {
                  const IconComponent = getCategoryIcon(project.category)
                  return (
                    <Card
                      key={project.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="aspect-video relative">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className={`absolute top-3 right-3 ${getRiskColor(project.risk)}`}>
                          {project.risk} Risk
                        </Badge>
                        <div className="absolute top-3 left-3">
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <CardDescription className="text-sm">{project.description}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{project.rating}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">ROI</p>
                            <p className="font-semibold text-green-600">{project.roi}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-semibold">{project.duration}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min. Investment</p>
                            <p className="font-semibold">${project.minInvestment.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.funded}%</span>
                          </div>
                          <Progress value={project.funded} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>${((project.target * project.funded) / 100).toLocaleString()} raised</span>
                            <span>{project.backers} backers</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{project.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-green-600 font-medium">{project.historicalPerformance}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle direct investment
                            }}
                          >
                            Invest Now
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Star className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Load More */}
              <div className="text-center pt-6">
                <Button variant="outline" size="lg">
                  Load More Projects
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}