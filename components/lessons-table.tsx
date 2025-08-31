import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Lesson {
  id: string
  student: string
  instructor: string
  type: string
  scheduledDate: string
  duration: number
  status: string
  notes: string
}

interface LessonsTableProps {
  data: Lesson[]
}

export function LessonsTable({ data }: LessonsTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'theoretical':
        return 'bg-blue-100 text-blue-800'
      case 'practical':
        return 'bg-green-100 text-green-800'
      case 'simulation':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'theoretical':
        return 'Teórica'
      case 'practical':
        return 'Prática'
      case 'simulation':
        return 'Simulação'
      default:
        return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada'
      case 'in_progress':
        return 'Em Andamento'
      case 'completed':
        return 'Concluída'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudante</TableHead>
            <TableHead>Instrutor</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data Agendada</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((lesson) => (
            <TableRow key={lesson.id}>
              <TableCell className="font-medium">{lesson.student}</TableCell>
              <TableCell>{lesson.instructor}</TableCell>
              <TableCell>
                <Badge className={getTypeColor(lesson.type)}>
                  {getTypeLabel(lesson.type)}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(lesson.scheduledDate).toLocaleDateString('pt-BR')}
                <div className="text-xs text-muted-foreground">
                  {new Date(lesson.scheduledDate).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </TableCell>
              <TableCell>{lesson.duration} min</TableCell>
              <TableCell>
                <Badge className={getStatusColor(lesson.status)}>
                  {getStatusLabel(lesson.status)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate" title={lesson.notes}>
                {lesson.notes}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 