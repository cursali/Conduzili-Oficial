import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  type: string
  points: number
  rarity: string
}

interface AchievementsGridProps {
  data: Achievement[]
}

export function AchievementsGrid({ data }: AchievementsGridProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800'
      case 'rare':
        return 'bg-blue-100 text-blue-800'
      case 'epic':
        return 'bg-purple-100 text-purple-800'
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Comum'
      case 'rare':
        return 'Raro'
      case 'epic':
        return 'Épico'
      case 'legendary':
        return 'Lendário'
      default:
        return rarity
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((achievement) => (
        <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="text-3xl">{achievement.icon}</div>
              <Badge className={getRarityColor(achievement.rarity)}>
                {getRarityLabel(achievement.rarity)}
              </Badge>
            </div>
            <CardTitle className="text-lg">{achievement.title}</CardTitle>
            <CardDescription>{achievement.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{achievement.type}</Badge>
              <div className="text-sm text-muted-foreground">
                {achievement.points} pontos
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 