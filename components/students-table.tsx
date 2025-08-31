"use client"

import { useState } from "react"
import { IconEdit, IconEye, IconTrash, IconUser, IconMail, IconPhone, IconCalendar, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStudents, StudentWithProfile } from "@/hooks/useStudents"
import { useToast } from "@/hooks/useToast"

export function StudentsTable() {
  const { students, loading, error, refreshStudents } = useStudents()
  const { success, error: showError, loading: showLoading } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Filtrar alunos baseado na busca e status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.profile.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      enrolled: { label: "Matriculado", variant: "default" as const, color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" },
      in_progress: { label: "Em Andamento", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800" },
      approved: { label: "Aprovado", variant: "default" as const, color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" },
      failed: { label: "Reprovado", variant: "destructive" as const, color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800" },
      suspended: { label: "Suspenso", variant: "secondary" as const, color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700" }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.enrolled
    
    return (
      <Badge className={`${config.color} text-xs font-medium px-2 py-1`}>
        {config.label}
      </Badge>
    )
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600 dark:text-green-400"
    if (progress >= 60) return "text-yellow-600 dark:text-yellow-400"
    if (progress >= 40) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando alunos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <IconUser className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Erro ao carregar alunos: {error}</p>
            <Button onClick={refreshStudents} className="mt-2">Tentar Novamente</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Alunos Matriculados</CardTitle>
            <CardDescription>
              {filteredStudents.length} aluno{filteredStudents.length !== 1 ? 's' : ''} encontrado{filteredStudents.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="enrolled">Matriculado</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="failed">Reprovado</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-12">Avatar</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Aulas</TableHead>
                <TableHead>Data de Matrícula</TableHead>
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="text-center">
                      <IconUser className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all" 
                          ? "Nenhum aluno encontrado com os filtros aplicados"
                          : "Nenhum aluno matriculado encontrado"
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-semibold text-sm">
                        {student.profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.profile.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {student.id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconMail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{student.profile.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(student.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconTrendingUp className={`w-4 h-4 ${getProgressColor(student.progress)}`} />
                        <span className={`font-medium ${getProgressColor(student.progress)}`}>
                          {student.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{student.lessons_completed}/{student.total_lessons}</div>
                        <div className="text-muted-foreground">aulas concluídas</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconCalendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(student.enrollment_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <IconEdit className="w-4 h-4" />
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem>
                            <IconEye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <IconEdit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <IconTrash className="w-4 h-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 