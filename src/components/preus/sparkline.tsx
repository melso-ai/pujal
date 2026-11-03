"use client";

import { Line, LineChart, YAxis } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const config = { v: { label: "Preu", color: "var(--chart-2)" } } satisfies ChartConfig;

export function Sparkline({ serie }: { serie: (number | null)[] }) {
  const data = serie.map((v, i) => ({ i, v }));
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-7 w-20"
      initialDimension={{ width: 80, height: 28 }}
    >
      <LineChart data={data} margin={{ top: 3, right: 3, bottom: 3, left: 3 }}>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Line
          dataKey="v"
          type="monotone"
          stroke="var(--color-v)"
          strokeWidth={1.5}
          dot={false}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
