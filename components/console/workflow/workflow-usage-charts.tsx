"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { WorkflowRunStat } from "@/lib/utils/analytics";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";

const chartConfig = {
  desktop: {
    label: "Tokens",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type BarChartProps = any;
const TypedBarChart = BarChart as React.ComponentType<BarChartProps>;

export function WorkflowUsageCharts({
  usageData,
}: {
  usageData: WorkflowRunStat[];
}) {
  const localisedData = usageData.map((data) => ({
    ...data,
    date: new Date(data.date).toDateString(),
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
      <TypedBarChart data={localisedData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine tickMargin={10} axisLine />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="tokens" fill="var(--color-desktop)" stackId="a" />
      </TypedBarChart>
    </ChartContainer>
  );
}
