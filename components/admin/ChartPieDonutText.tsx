"use client"

import * as React from "react"
import { TrendingUp, Package } from "lucide-react" // Cambié el ícono a 'Package' que representa mejor productos
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Configuración: Cambiamos la etiqueta de "Ventas" a "Unidades"
const chartConfig = {
  visitors: {
    label: "Unidades",
  },
} satisfies ChartConfig

interface ChartPieDonutTextProps {
  data: {
    browser: string;
    visitors: number;
    fill: string;
  }[]
}

export function ChartPieDonutText({ data = [] }: ChartPieDonutTextProps) {
  
  const totalUnits = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [data])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        {/* Título más claro */}
        <CardTitle>Productos Vendidos</CardTitle>
        <CardDescription>Distribución por Categoría</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalUnits.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {/* Etiqueta central cambiada */}
                          Unidades
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {/* Mostramos la categoría más popular */}
          Más vendido: {data.length > 0 ? data.sort((a,b) => b.visitors - a.visitors)[0].browser : "N/A"} 
          <Package className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total de prendas/productos despachados
        </div>
      </CardFooter>
    </Card>
  )
}