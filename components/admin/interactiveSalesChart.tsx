"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 1. Definimos qué forma tienen los datos que vienen de Stripe
interface InteractiveSalesChartProps {
  data: {
    date: string;   // "YYYY-MM-DD"
    ingresos: number;
  }[];
}

const chartConfig = {
  ingresos: {
    label: "Ingresos",
    color: "hsl(var(--chart-2))", // Color verde por defecto (o el que tengas en tu tema)
  },
} satisfies ChartConfig

export function InteractiveSalesChart({ data = [] }: InteractiveSalesChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d")

  // 2. Filtramos los datos reales basándonos en la fecha de HOY
  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const now = new Date() // Usamos la fecha actual como referencia
    let daysToSubtract = 90
    
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - daysToSubtract)
    return date >= startDate
  })

  // Calculamos el total de lo que se ve en pantalla para mostrarlo en el título
  const totalRevenue = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.ingresos, 0)
  }, [filteredData])

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Ingresos Totales</CardTitle>
          <CardDescription>
            {/* Muestra el total formateado como dinero */}
            Total en este periodo: <span className="font-bold text-foreground">
              {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(totalRevenue)}
            </span>
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Selecciona un periodo"
          >
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 días
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 días
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-ingresos)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-ingresos)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("es-ES", {
                      month: "long",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                  // Formateador para que el tooltip muestre signo $
                  formatter={(value: any) => 
                     new Intl.NumberFormat("es-AR", { 
                       style: "currency", 
                       currency: "ARS" 
                     }).format(value)
                  }
                />
              }
            />
            <Area
              dataKey="ingresos"
              type="natural"
              fill="url(#fillIngresos)"
              stroke="var(--color-ingresos)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}