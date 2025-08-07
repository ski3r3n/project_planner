// app/dashboard/project/[projectId]/calendar/page.tsx

"use client";

import { Box, Text, Spinner, Center } from "@chakra-ui/react";
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
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Define a type for your fetched task data
interface Task {
  id: string;
  project_id: string;
  name: string; // Using 'name' for the phase title
  hierarchy_type: string; // The type of the task
  start_time: string; // Corrected to match the new query
  end_time: string; // Corrected to match the new query
}

export default function Calendar() {
  const params = useParams();
  const projectId = params.id as string;
  const [projectPhases, setProjectPhases] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projectStartDate, setProjectStartDate] = useState<Date | null>(null);
  const [projectEndDate, setProjectEndDate] = useState<Date | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const daysBetween = (start: Date, end: Date) => {
    if (!start || !end) return NaN;
    return Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const today = new Date();

  // --- Data Fetching Logic ---
  useEffect(() => {
    async function fetchProjectGoals() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId)
          .eq("hierarchy_type", "Goal")
          .order("start_time", { ascending: true });

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const overallStartDate = new Date(data[0].start_time);
          const overallEndDate = new Date(data[data.length - 1].end_time);

          setProjectStartDate(overallStartDate);
          setProjectEndDate(overallEndDate);
          setProjectPhases(data);
        } else {
          setProjectPhases([]);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Failed to fetch project goals.");
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchProjectGoals();
    }
  }, [projectId]);

  let chartData: Array<{
    phase: string;
    days_before: number;
    done: number;
    ongoing: number;
    upcoming: number;
    days_after: number;
    startDate: string;
    endDate: string;
    dateRange: string;
  }> = [];
  if (
    projectPhases &&
    projectPhases.length > 0 &&
    projectStartDate &&
    projectEndDate
  ) {
    chartData = projectPhases.map((phase) => {
      const phaseStart = new Date(phase.start_time);
      const phaseEnd = new Date(phase.end_time);

      const daysBeforeStart = daysBetween(projectStartDate, phaseStart);
      const phaseDuration = daysBetween(phaseStart, phaseEnd);

      let done = 0;
      let ongoing = 0;
      let upcoming = 0;

      if (today < phaseStart) {
        upcoming = phaseDuration;
      } else if (today > phaseEnd) {
        done = phaseDuration;
      } else {
        done = daysBetween(phaseStart, today);
        ongoing = daysBetween(today, phaseEnd);
      }

      return {
        phase: phase.name,
        days_before: daysBeforeStart,
        done,
        ongoing,
        upcoming,
        days_after: daysBetween(phaseEnd, projectEndDate),
        startDate: formatDate(phaseStart),
        endDate: formatDate(phaseEnd),
        dateRange: `${formatDate(phaseStart)} → ${formatDate(phaseEnd)}`,
      };
    });
  }

  const chart = useChart({
    data: chartData,
    series: [
      { name: "days_before", color: "transparent", stackId: "a" },
      { name: "done", color: "#38A169", stackId: "a" },
      { name: "ongoing", color: "#DD6B20", stackId: "a" },
      { name: "upcoming", color: "#A0AEC0", stackId: "a" },
      { name: "days_after", color: "transparent", stackId: "a" },
    ],
  });

  if (loading) {
    return (
      <Sidebar selected={3}>
        <Center height="xl">
          <Spinner size="xl" />
        </Center>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar selected={3}>
        <Center height="xl">
          <Text color="red.500">Error: {error}</Text>
        </Center>
      </Sidebar>
    );
  }

  if (!projectPhases || projectPhases.length === 0) {
    return (
      <Sidebar selected={3}>
        <Center height="xl">
          <Text color="gray.500">
            No goals found for this project. Please add some to see the
            timeline.
          </Text>
        </Center>
      </Sidebar>
    );
  }

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
  }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <Box
          bg="white"
          p={4}
          border="1px solid #CBD5E0"
          borderRadius="md"
          shadow="md">
          <Text fontWeight="bold" fontSize="md" mb={1}>
            {data.phase}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {data.dateRange}
          </Text>
          <Text fontSize="sm">✅ Done: {data.done} days</Text>
          <Text fontSize="sm">⏳ Ongoing: {data.ongoing} days</Text>
          <Text fontSize="sm">📅 Upcoming: {data.upcoming} days</Text>
        </Box>
      );
    }
    return null;
  };

  // Final check to ensure the chart only renders when all data is ready
  if (!projectStartDate || !projectEndDate) {
    return (
      <Sidebar selected={3}>
        <Center height="xl">
          <Text color="gray.500">Preparing chart data...</Text>
        </Center>
      </Sidebar>
    );
  }

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
              domain={[0, daysBetween(projectStartDate, projectEndDate)]}
              tickFormatter={(value) => {
                const date = new Date(projectStartDate);
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
                key={String(chart.key(item.name))}
                barSize={28}
                isAnimationActive={false}
                dataKey={String(chart.key(item.name))}
                fill={item.color}
                stackId={item.stackId}
                radius={[0, 4, 4, 0]}
              />
            ))}
            <ReferenceLine
              x={daysBetween(projectStartDate, today)}
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
