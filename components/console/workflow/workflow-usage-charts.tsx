"use client";

import type { WorkflowRunStat } from "@/lib/utils/analytics";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

// Create a type for the BarChart props, using 'any' to bypass strict type checking
type BarChartProps = any;

// Create a new component with the correct typing
const TypedBarChart = BarChart as React.ComponentType<BarChartProps>;

export function WorkflowUsageCharts({
  usageData,
}: {
  usageData: WorkflowRunStat[];
}) {
  const localisedData = usageData.map((data) => {
    return {
      ...data,
      date: new Date(data.date).toDateString(),
    };
  });

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[320px] w-full"
    >
      <TypedBarChart data={localisedData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine tickMargin={10} axisLine />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar
          dataKey="tokens"
          type="natural"
          fill="var(--color-desktop)"
          stroke="var(--color-tokens)"
          stackId="a"
        />
      </TypedBarChart>
    </ChartContainer>
  );
}



// "use client";

// import type { WorkflowRunStat } from "@/lib/utils/analytics";
// import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
// import {
//   type ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "../../ui/chart";

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "hsl(var(--chart-3))",
//   },
// } satisfies ChartConfig;

// export function WorkflowUsageCharts({
//   usageData,
// }: {
//   usageData: WorkflowRunStat[];
// }) {
//   const localisedData = usageData.map((data) => {
//     return {
//       ...data,
//       date: new Date(data.date).toDateString(),
//     };
//   });

//   return (
//     <ChartContainer
//       config={chartConfig}
//       className="aspect-auto h-[320px] w-full"
//     >
//       <BarChart data={localisedData}>
//         <CartesianGrid vertical={false} />
//         <XAxis dataKey="date" tickLine tickMargin={10} axisLine />
//         <ChartTooltip
//           cursor={false}
//           content={<ChartTooltipContent indicator="dot" />}
//         />
//         <Bar
//           dataKey="tokens"
//           type="natural"
//           fill="var(--color-desktop)"
//           stroke="var(--color-tokens)"
//           stackId="a"
//         />
//       </BarChart>
//     </ChartContainer>
//   );
// }
