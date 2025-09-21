import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Cards"
import { Button } from "../components/Button"
import { Input } from "../components/ui/Input"
import { Progress } from "../components/Progress"
import Footer from "../components/Footer"
import {
  Search,
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
  risk: "Bajo" | "Medio" | "Alto"
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

const featuredProjects: Project[] = [
  {
    id: "1",
    title: "Desarrollo de Uso Mixto en el Centro",
    description: "Complejo residencial y comercial premium en ubicación céntrica privilegiada",
    category: "Bienes Raíces",
    roi: "18.5%",
    duration: "24 meses",
    minInvestment: 5000,
    funded: 78,
    target: 2500000,
    backers: 156,
    location: "Austin, TX",
    historicalPerformance: "+22.3%",
    rating: 4.8,
    risk: "Medio",
    image: "/modern-downtown-building-development.png",
    fullDescription:
      "Este proyecto de desarrollo de uso mixto premium representa una oportunidad única para invertir en el centro de Austin, que está experimentando un rápido crecimiento. El proyecto incluye 120 unidades residenciales de lujo y 15,000 pies cuadrados de espacio comercial premium.",
    keyMetrics: {
      totalRaised: 1950000,
      averageInvestment: 12500,
      completionRate: 95,
    },
    timeline: [
      { phase: "Planificación y Permisos", description: "Obtención de todos los permisos y aprobaciones necesarias", completed: true },
      { phase: "Cimentación y Estructura", description: "Completar cimentación y estructura", completed: true },
      { phase: "Interiores y Acabados", description: "Trabajos de interior y acabados", completed: false },
      { phase: "Inspección Final", description: "Inspecciones finales y permisos de ocupación", completed: false },
    ],
  },
  {
    id: "2",
    title: "Plataforma de Salud con Inteligencia Artificial",
    description: "Plataforma de diagnóstico revolucionaria que utiliza aprendizaje automático para la detección temprana de enfermedades",
    category: "Tecnología",
    roi: "25.2%",
    duration: "18 meses",
    minInvestment: 2500,
    funded: 92,
    target: 1800000,
    backers: 203,
    location: "San Francisco, CA",
    historicalPerformance: "+31.7%",
    rating: 4.9,
    risk: "Alto",
    image: "/ai-healthcare-technology-platform.png",
    fullDescription:
      "Nuestra plataforma de salud con IA aprovecha algoritmos avanzados de aprendizaje automático para proporcionar detección temprana de enfermedades y recomendaciones de tratamiento personalizadas, revolucionando la atención médica preventiva.",
    keyMetrics: {
      totalRaised: 1656000,
      averageInvestment: 8157,
      completionRate: 88,
    },
  },
]

const getCategoryIcon = (category: string) => {
  const categoryMap: { [key: string]: any } = {
    "Bienes Raíces": Building2,
    "Tecnología": Zap,
    "Energía Verde": Leaf,
    "Salud": Heart,
    "Educación": GraduationCap,
  }
  return categoryMap[category] || Briefcase
}

const SingleProjectView = ({ project, onBack }: { project: Project; onBack: () => void }) => {
  if (!project) {
    return (
      <div className="flex justify-center items-center h-96">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Proyectos
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
          Volver a Proyectos
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
                  Cronograma del Proyecto
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
              <CardTitle>Detalles de Inversión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ROI Esperado</p>
                  <p className="text-2xl font-bold text-green-600">{project.roi}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duración</p>
                  <p className="text-2xl font-bold">{project.duration}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Inversión Mínima</p>
                <p className="text-2xl font-bold">${project.minInvestment.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso de Financiación</span>
                  <span className="font-medium">{project.funded}%</span>
                </div>
                <Progress value={project.funded} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${((project.target * project.funded) / 100).toLocaleString()} recaudado</span>
                  <span>{project.backers} inversionistas</span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <DollarSign className="w-4 h-4 mr-2" />
                Invertir Ahora
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Análisis
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Star className="w-4 h-4 mr-2" />
                  Favorito
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
                  Métricas Clave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Recaudado</span>
                  <span className="font-medium">${project.keyMetrics.totalRaised.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Inversión Promedio</span>
                  <span className="font-medium">${project.keyMetrics.averageInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tasa de Finalización</span>
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
                    <span className="text-sm">Rendimiento Histórico</span>
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
        <div className="space-y-6">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Buscar proyectos por nombre, categoría o ubicación..." className="pl-10" />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <p className="text-muted-foreground">Duración</p>
                        <p className="font-semibold">{project.duration}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Inversión Mín.</p>
                        <p className="font-semibold">${project.minInvestment.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{project.funded}%</span>
                      </div>
                      <Progress value={project.funded} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${((project.target * project.funded) / 100).toLocaleString()} recaudado</span>
                        <span>{project.backers} inversionistas</span>
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
                        Invertir Ahora
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
              Cargar Más Proyectos
            </Button>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}