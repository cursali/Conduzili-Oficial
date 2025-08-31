import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TrafficSign {
  id: string
  code: string
  name: string
  description?: string
  category: string
  isActive: boolean
}

interface TrafficSignsGridProps {
  data: TrafficSign[]
}

export function TrafficSignsGrid({ data }: TrafficSignsGridProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'regulamentacao':
        return 'bg-red-100 text-red-800'
      case 'advertencia':
        return 'bg-yellow-100 text-yellow-800'
      case 'indicacao':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'regulamentacao':
        return 'Regulamentação'
      case 'advertencia':
        return 'Advertência'
      case 'indicacao':
        return 'Indicação'
      default:
        return category
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((sign) => (
        <Card key={sign.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-mono font-bold text-blue-600">
                {sign.code}
              </div>
              <Badge className={sign.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {sign.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <CardTitle className="text-lg">{sign.name}</CardTitle>
            <CardDescription>{sign.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className={getCategoryColor(sign.category)}>
              {getCategoryLabel(sign.category)}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 