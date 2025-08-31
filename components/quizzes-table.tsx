import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Quiz {
  id: string
  title: string
  category: string
  difficulty: string
  timeLimit: number
  passingScore: number
  isActive: boolean
  testNumber: number
}

interface QuizzesTableProps {
  data: Quiz[]
}

export function QuizzesTable({ data }: QuizzesTableProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante'
      case 'intermediate':
        return 'Intermediário'
      case 'advanced':
        return 'Avançado'
      default:
        return difficulty
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teste</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Dificuldade</TableHead>
            <TableHead>Tempo Limite</TableHead>
            <TableHead>Nota Mínima</TableHead>
            <TableHead>Número do Teste</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell className="font-medium">{quiz.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">{quiz.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getDifficultyColor(quiz.difficulty)}>
                  {getDifficultyLabel(quiz.difficulty)}
                </Badge>
              </TableCell>
              <TableCell>{quiz.timeLimit} min</TableCell>
              <TableCell>{quiz.passingScore}%</TableCell>
              <TableCell className="text-center font-mono">
                {quiz.testNumber}
              </TableCell>
              <TableCell>
                <Badge className={quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {quiz.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 