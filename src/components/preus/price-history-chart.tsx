"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { eur, eurPrecise } from "@/lib/format";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

// Axis ticks render on the server too, so they avoid Intl.
function tick(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(".", ",")}k`;
  if (v < 5) return v.toFixed(2).replace(".", ",");
  return String(Math.round(v));
}

export function PriceHistoryChart({
  rows,
  industrials,
  referencia,
}: {
  rows: Record<string, string | number | null>[];
  industrials: { key: string; nom: string }[];
  referencia: number;
}) {
  const config: ChartConfig = Object.fromEntries(
    industrials.map((ind, i) => [ind.key, { label: ind.nom, color: COLORS[i % COLORS.length] }])
  );
  const fmt = (n: number) => (n < 1000 ? eurPrecise(n) : eur(n));

  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-72 w-full"
      initialDimension={{ width: 640, height: 288 }}
    >
      <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          domain={["auto", "auto"]}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={tick}
        />
        <ReferenceLine
          y={referencia}
          stroke="var(--muted-foreground)"
          strokeDasharray="4 4"
          label={{ value: "Referència", position: "insideTopRight", fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => (
                <div className="flex w-full items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{config[String(name)]?.label}</span>
                  <span className="ml-auto font-mono tabular-nums">{fmt(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-3 gap-y-1 text-caption" />} />
        {industrials.map((ind, i) => (
          <Line
            key={ind.key}
            dataKey={ind.key}
            type="monotone"
            stroke={`var(--color-${ind.key})`}
            strokeWidth={i === 0 ? 2.5 : 1.5}
            dot={{ r: 2.5, fill: `var(--color-${ind.key})`, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
