"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Chart, useChart } from "@chakra-ui/charts";
import Sidebar from "@/components/sidebar";

export default function Demo() {
  // Helper function to format dates
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper function to calculate days between two dates
  const daysBetween = (start, end) => {
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  // Create project timeline with actual dates
  const startDate = new Date('2025-01-01');
  
  // Define project phases with start and end dates
  const projectPhases = [
    { 
      phase: "Ideation", 
      start: new Date('2025-01-01'), 
      end: new Date('2025-03-22')  // 80 days
    },
    { 
      phase: "Survey", 
      start: new Date('2025-03-22'), 
      end: new Date('2025-06-25')  // 95 days
    },
    { 
      phase: "UI", 
      start: new Date('2025-03-12'),  // Starts 10 days before Survey (overlapping)
      end: new Date('2025-06-25')  // 105 days
    },
    { 
      phase: "Backend", 
      start: new Date('2025-06-25'), 
      end: new Date('2025-09-19')  // 86 days
    },
    { 
      phase: "Report", 
      start: new Date('2025-07-05'),  // Starts 10 days after Backend (overlapping)
      end: new Date('2025-10-04')  // 91 days
    },
    { 
      phase: "Publish", 
      start: new Date('2025-10-28'), 
      end: new Date('2026-01-01')  // 65 days
    }
  ];

  // Calculate the end date of the project
  const endDate = new Date('2026-01-01');
  const projectDuration = daysBetween(startDate, endDate);

  // Prepare data for the chart
  const chartData = projectPhases.map(phase => {
    const daysBeforeStart = daysBetween(startDate, phase.start);
    const phaseDuration = daysBetween(phase.start, phase.end);
    const daysAfterEnd = projectDuration - daysBeforeStart - phaseDuration;
    
    return {
      phase: phase.phase,
      days_before: daysBeforeStart,
      days: phaseDuration,
      days_after: daysAfterEnd,
      startDate: formatDate(phase.start),
      endDate: formatDate(phase.end),
      dateRange: `${formatDate(phase.start)} - ${formatDate(phase.end)}`
    };
  });

  const chart = useChart({
    data: chartData,
    series: [
      { name: "days_before", color: "transparent", stackId: "a" },
      { name: "days", color: "purple.solid", stackId: "a" },
      { name: "days_after", color: "transparent", stackId: "a" },
    ],
  });

  // Custom tooltip to show date information
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p><strong>{data.phase}</strong></p>
          <p>{data.dateRange}</p>
          <p>Duration: {data.days} days</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Sidebar selected={3}>
      <Chart.Root maxH="md" chart={chart}>
        <BarChart layout="vertical" data={chart.data}>
          <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
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
            ticks={[0, 60, 120, 180, 240, 300, 365]}
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