import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { StudentsTable } from "@/components/students-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  // Dados mockados para demonstração
  const totalEstudantes = 1247
  const totalInstrutores = 89
  const taxaConversao = 78.5
  const lucroEstimado = 45600

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Cards de Métricas */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Estudantes</CardTitle>
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEstudantes.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Instrutores</CardTitle>
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInstrutores}</div>
              <p className="text-xs text-muted-foreground">
                +5 novos este mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taxaConversao}%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Estimado</CardTitle>
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {lucroEstimado.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground">
                +8.2% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <div className="px-4 lg:px-6">
        <StudentsTable />
      </div>
    </div>
  );
}
