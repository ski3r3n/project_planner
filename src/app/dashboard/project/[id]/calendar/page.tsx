"use client";

import { Box } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  ReferenceLine,
} from "recharts";
import { Chart, useChart } from "@chakra-ui/charts";
import Sidebar from "@/components/sidebar";

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
    {
      phase: "Ideation",
      start: new Date("2025-01-01"),
      end: new Date("2025-03-22"),
    },
    {
      phase: "Survey",
      start: new Date("2025-03-22"),
      end: new Date("2025-06-25"),
    },
    {
      phase: "UI",
      start: new Date("2025-03-12"),
      end: new Date("2025-06-25"),
    },
    {
      phase: "Backend",
      start: new Date("2025-06-25"),
      end: new Date("2025-09-19"),
    },
    {
      phase: "Report",
      start: new Date("2025-07-05"),
      end: new Date("2025-10-04"),
    },
    {
      phase: "Publish",
      start: new Date("2025-10-28"),
      end: new Date("2026-01-01"),
    },
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
      // Entire phase upcoming
      upcoming = phaseDuration;
    } else if (today > phase.end) {
      // Entire phase done
      done = phaseDuration;
    } else {
      // Entire phase ongoing
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
      dateRange: `${formatDate(phase.start)} - ${formatDate(phase.end)}`,
    };
  });

  const chart = useChart({
    data: chartData,
    series: [
      { name: "days_before", color: "transparent", stackId: "a" },
      { name: "done", color: "green", stackId: "a" },
      { name: "ongoing", color: "orange", stackId: "a" },
      { name: "upcoming", color: "grey", stackId: "a" },
      { name: "days_after", color: "transparent", stackId: "a" },
    ],
  });

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          bg="white"
          p="10px"
          border="1px solid #ccc"
          borderRadius="4px"
          boxShadow="0 2px 5px rgba(0,0,0,0.1)">
          <Box fontWeight="bold">{data.phase}</Box>
          <Box>{data.dateRange}</Box>
          <Box>Done: {data.done} days</Box>
          <Box>Ongoing: {data.ongoing} days</Box>
          <Box>Upcoming: {data.upcoming} days</Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <Sidebar selected={3}>
      <Chart.Root maxH="md" chart={chart}>
        <BarChart layout="vertical" data={chart.data}>
          <CartesianGrid
            stroke={chart.color("border.muted")}
            vertical={false}
          />
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
          />
          <YAxis
            type="category"
            dataKey={chart.key("phase")}
            orientation="left"
            stroke={chart.color("border")}
          />
          <Tooltip
            cursor={{ fill: chart.color("bg.muted") }}
            animationDuration={100}
            content={<CustomTooltip />}
          />
          {chart.series.map((item) => (
            <Bar
              key={item.name}
              barSize={30}
              isAnimationActive={false}
              dataKey={chart.key(item.name)}
              fill={item.color}
              stackId={item.stackId}
            />
          ))}
          <ReferenceLine
            x={daysBetween(startDate, today)}
            stroke="red"
            strokeDasharray="4"
            label={{
              position: "insideTop",
              value: "Today",
              fill: "red",
              fontSize: 12,
            }}
          />
        </BarChart>
      </Chart.Root>
    </Sidebar>
  );
}
