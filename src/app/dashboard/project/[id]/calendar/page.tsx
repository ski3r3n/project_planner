"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, /*Legend*/ } from "recharts";
import { Chart, useChart } from "@chakra-ui/charts";
// import { Box } from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
export default function Demo() { {/* replace with project specific tasks */}
  const chart = useChart({
    // how to use
    // length = 365 total
    // days_before and days_after mark the start and end
    // days is the actual length
    data: [
      { days_before: 0, days: 80, month: "Ideation" },
      { days_before: 80, days: 95, month: "Survey" },
      { days_before: 70, days: 105, month: "UI" },
      { days_before: 175, days: 86, month: "Backend" },
      { days_before: 185, days: 91, month: "Report" },
      { days_before: 300, days: 65, days_after: 0, month: "Publish" },
    ],
    series: [
      { name: "days_before", color: "transparent", stackId: "a" },
      { name: "days", color: "purple.solid", stackId: "a" },
      { name: "days_after", color: "transparent", stackId: "a" },
    ],
  })

  return (
    <Sidebar selected={3}>
      <Chart.Root maxH="md" chart={chart}>
      <BarChart layout="vertical" data={chart.data}>
        <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
        <XAxis type="number" axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey={chart.key("month")}
          orientation="left"
          stroke={chart.color("border")}
          tickFormatter={(value) => value}
        />
        <Tooltip
          cursor={{ fill: chart.color("bg.muted") }}
          animationDuration={100}
          content={<Chart.Tooltip />}
        />
        {/* <Legend content={<Chart.Legend />} /> */}
        {chart.series.map((item) => (
          <Bar
            barSize={30}
            isAnimationActive={false}
            key={item.name}
            dataKey={chart.key(item.name)}
            fill={chart.color(item.color)}
            stroke={chart.color(item.color)}
            stackId={item.stackId}
          />
        ))}
      </BarChart>
    </Chart.Root>
    </Sidebar>
  );
}
