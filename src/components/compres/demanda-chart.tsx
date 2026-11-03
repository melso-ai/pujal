"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "color-mix(in oklab, var(--chart-1) 45%, var(--chart-4))",
];
const TENTATIVA = "color-mix(in oklab, var(--muted-foreground) 18%, transparent)";

// Ticks and tooltip avoid Intl so server and client renders match.
function compacte(v: number) {
  if (v >= 10_000) return `${Math.round(v / 1000)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(".", ",")}k`;
  return String(Math.round(v));
}

const milers = (v: number) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function DemandaChart({
  rows,
  series,
  unitat,
}: {
  rows: Record<string, string | number | null>[];
  series: { key: string; nom: string; siAdjudica: boolean }[];
  unitat: string;
}) {
  let c = 0;
  const config: ChartConfig = Object.fromEntries(
    series.map((s) => [
      s.key,
      { label: s.siAdjudica ? `${s.nom} · si s'adjudica` : s.nom, color: s.siAdjudica ? TENTATIVA : COLORS[c++ % COLORS.length] },
    ])
  );

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full" initialDimension={{ width: 640, height: 288 }}>
      <BarChart data={rows} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={compacte} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => (
                <div className="flex w-full items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{config[String(name)]?.label}</span>
                  <span className="ml-auto font-mono tabular-nums">
                    {milers(Number(value))} {unitat}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent className="flex-wrap gap-y-1" />} />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            stackId="demanda"
            fill={`var(--color-${s.key})`}
            stroke={s.siAdjudica ? "var(--muted-foreground)" : undefined}
            strokeDasharray={s.siAdjudica ? "3 3" : undefined}
            maxBarSize={56}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
