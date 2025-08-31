import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Instructor {
  id: string
  name: string
  email: string
  license: string
  specialties: string[]
  studentsCount: number
  rating: number
  status: string
  hiredDate: string
  avatar: string
}

interface InstructorsTableProps {
  data: Instructor[]
}

export function InstructorsTable({ data }: InstructorsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'invited':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instrutor</TableHead>
            <TableHead>Licença</TableHead>
            <TableHead>Especialidades</TableHead>
            <TableHead>Estudantes</TableHead>
            <TableHead>Avaliação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de Contratação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((instructor) => (
            <TableRow key={instructor.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={instructor.avatar} alt={instructor.name} />
                    <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{instructor.name}</div>
                    <div className="text-sm text-muted-foreground">{instructor.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm font-mono">{instructor.license}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {instructor.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="font-medium">{instructor.studentsCount}</div>
                <div className="text-xs text-muted-foreground">estudantes</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{instructor.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(instructor.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(instructor.status)}>
                  {instructor.status === 'active' ? 'Ativo' :
                   instructor.status === 'invited' ? 'Convidado' :
                   instructor.status === 'inactive' ? 'Inativo' : instructor.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {new Date(instructor.hiredDate).toLocaleDateString('pt-BR')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 