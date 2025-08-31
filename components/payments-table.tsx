import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Payment {
  id: string
  student: string
  amount: number
  type: string
  status: string
  method: string
  dueDate: string
  paidDate?: string
}

interface PaymentsTableProps {
  data: Payment[]
}

export function PaymentsTable({ data }: PaymentsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      case 'trial':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'bg-blue-100 text-blue-800'
      case 'enrollment':
        return 'bg-purple-100 text-purple-800'
      case 'lesson':
        return 'bg-green-100 text-green-800'
      case 'test':
        return 'bg-orange-100 text-orange-800'
      case 'exam':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'vint24':
        return 'bg-green-100 text-green-800'
      case 'credit_card':
        return 'bg-blue-100 text-blue-800'
      case 'debit_card':
        return 'bg-purple-100 text-purple-800'
      case 'stripe':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado'
      case 'pending':
        return 'Pendente'
      case 'failed':
        return 'Falhou'
      case 'refunded':
        return 'Reembolsado'
      case 'trial':
        return 'Trial'
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'Assinatura'
      case 'enrollment':
        return 'Matrícula'
      case 'lesson':
        return 'Aula'
      case 'test':
        return 'Teste'
      case 'exam':
        return 'Exame'
      default:
        return type
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'vint24':
        return 'Vinti4'
      case 'credit_card':
        return 'Cartão de Crédito'
      case 'debit_card':
        return 'Cartão de Débito'
      case 'stripe':
        return 'Stripe'
      default:
        return method
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudante</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Data de Vencimento</TableHead>
            <TableHead>Data de Pagamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{payment.student}</TableCell>
              <TableCell className="font-mono">
                R$ {payment.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge className={getTypeColor(payment.type)}>
                  {getTypeLabel(payment.type)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(payment.status)}>
                  {getStatusLabel(payment.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getMethodColor(payment.method)}>
                  {getMethodLabel(payment.method)}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>
                {payment.paidDate ? (
                  new Date(payment.paidDate).toLocaleDateString('pt-BR')
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 