"use client";

import { Box, Text} from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Chart, useChart } from "@chakra-ui/charts";
import Sidebar from "@/components/sidebar";
import type { TooltipProps } from "recharts";

export default function Calendar() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const daysBetween = (start: Date, end: Date) => {
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const startDate = new Date("2025-01-01");
  const today = new Date();

  const projectPhases = [
    { phase: "Ideation", start: new Date("2025-01-01"), end: new Date("2025-03-22") },
    { phase: "Survey", start: new Date("2025-03-22"), end: new Date("2025-06-25") },
    { phase: "UI", start: new Date("2025-03-12"), end: new Date("2025-06-25") },
    { phase: "Backend", start: new Date("2025-06-25"), end: new Date("2025-09-19") },
    { phase: "Report", start: new Date("2025-07-05"), end: new Date("2025-10-04") },
    { phase: "Publish", start: new Date("2025-10-28"), end: new Date("2026-01-01") },
  ];

  const endDate = new Date("2026-01-01");
  const projectDuration = daysBetween(startDate, endDate);

  const chartData = projectPhases.map((phase) => {
    const daysBeforeStart = daysBetween(startDate, phase.start);
    const phaseDuration = daysBetween(phase.start, phase.end);

    let done = 0;
    let ongoing = 0;
    let upcoming = 0;

    if (today < phase.start) {
      upcoming = phaseDuration;
    } else if (today > phase.end) {
      done = phaseDuration;
    } else {
      ongoing = phaseDuration;
    }

    return {
      phase: phase.phase,
      days_before: daysBeforeStart,
      done,
      ongoing,
      upcoming,
      days_after: projectDuration - daysBeforeStart - phaseDuration,
      startDate: formatDate(phase.start),
      endDate: formatDate(phase.end),
      dateRange: `${formatDate(phase.start)} → ${formatDate(phase.end)}`,
    };
  });

  const chart = useChart({
    data: chartData,
    series: [
      { name: "days_before", color: "transparent", stackId: "a" },
      { name: "done", color: "#38A169", stackId: "a" },     // green
      { name: "ongoing", color: "#DD6B20", stackId: "a" },  // orange
      { name: "upcoming", color: "#A0AEC0", stackId: "a" }, // grey
      { name: "days_after", color: "transparent", stackId: "a" },
    ],
  });

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <Box
          bg="white"
          p={4}
          border="1px solid #CBD5E0"
          borderRadius="md"
          shadow="md"
        >
          <Text fontWeight="bold" fontSize="md" mb={1}>{data.phase}</Text>
          <Text fontSize="sm" color="gray.600">{data.dateRange}</Text>
          <Text fontSize="sm">✅ Done: {data.done} days</Text>
          <Text fontSize="sm">⏳ Ongoing: {data.ongoing} days</Text>
          <Text fontSize="sm">📅 Upcoming: {data.upcoming} days</Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Sidebar selected={3}>
      <Box p={10}>
        <Chart.Root maxH="xl" chart={chart}>
          <BarChart layout="vertical" data={chart.data}>
            <CartesianGrid stroke="#E2E8F0" vertical={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              domain={[0, projectDuration]}
              tickFormatter={(value) => {
                const date = new Date(startDate);
                date.setDate(date.getDate() + value);
                return formatDate(date);
              }}
              stroke="#4A5568"
            />
            <YAxis
              type="category"
              dataKey={chart.key("phase")}
              axisLine={false}
              tickLine={false}
              stroke="#4A5568"
            />
            <Tooltip
              cursor={{ fill: "#EDF2F7" }}
              animationDuration={100}
              content={<CustomTooltip />}
            />
            {chart.series.map((item) => (
              <Bar
                key={item.name}
                barSize={28}
                isAnimationActive={false}
                dataKey={chart.key(item.name)}
                fill={item.color}
                stackId={item.stackId}
                radius={[0, 4, 4, 0]}
              />
            ))}
            <ReferenceLine
              x={daysBetween(startDate, today)}
              stroke="red"
              strokeDasharray="4 2"
              label={{
                position: "insideTopRight",
                value: "Today",
                fill: "red",
                fontSize: 12,
              }}
            />
          </BarChart>
        </Chart.Root>
      </Box>
    </Sidebar>
  );
}
