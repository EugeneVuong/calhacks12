"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartData = [
  { date: "2024-04-01", emotionalIntelligence: 65, skillMastery: 45 },
  { date: "2024-04-02", emotionalIntelligence: 67, skillMastery: 47 },
  { date: "2024-04-03", emotionalIntelligence: 69, skillMastery: 50 },
  { date: "2024-04-04", emotionalIntelligence: 71, skillMastery: 52 },
  { date: "2024-04-05", emotionalIntelligence: 73, skillMastery: 55 },
  { date: "2024-04-06", emotionalIntelligence: 75, skillMastery: 58 },
  { date: "2024-04-07", emotionalIntelligence: 77, skillMastery: 60 },
  { date: "2024-04-08", emotionalIntelligence: 79, skillMastery: 63 },
  { date: "2024-04-09", emotionalIntelligence: 81, skillMastery: 65 },
  { date: "2024-04-10", emotionalIntelligence: 83, skillMastery: 68 },
  { date: "2024-04-11", emotionalIntelligence: 85, skillMastery: 70 },
  { date: "2024-04-12", emotionalIntelligence: 87, skillMastery: 73 },
  { date: "2024-04-13", emotionalIntelligence: 89, skillMastery: 75 },
  { date: "2024-04-14", emotionalIntelligence: 91, skillMastery: 78 },
  { date: "2024-04-15", emotionalIntelligence: 93, skillMastery: 80 },
  { date: "2024-04-16", emotionalIntelligence: 95, skillMastery: 83 },
  { date: "2024-04-17", emotionalIntelligence: 97, skillMastery: 85 },
  { date: "2024-04-18", emotionalIntelligence: 99, skillMastery: 88 },
  { date: "2024-04-19", emotionalIntelligence: 101, skillMastery: 90 },
  { date: "2024-04-20", emotionalIntelligence: 103, skillMastery: 93 },
  { date: "2024-04-21", emotionalIntelligence: 105, skillMastery: 95 },
  { date: "2024-04-22", emotionalIntelligence: 107, skillMastery: 98 },
  { date: "2024-04-23", emotionalIntelligence: 109, skillMastery: 100 },
  { date: "2024-04-24", emotionalIntelligence: 111, skillMastery: 103 },
  { date: "2024-04-25", emotionalIntelligence: 113, skillMastery: 105 },
  { date: "2024-04-26", emotionalIntelligence: 115, skillMastery: 108 },
  { date: "2024-04-27", emotionalIntelligence: 117, skillMastery: 110 },
  { date: "2024-04-28", emotionalIntelligence: 119, skillMastery: 113 },
  { date: "2024-04-29", emotionalIntelligence: 121, skillMastery: 115 },
  { date: "2024-04-30", emotionalIntelligence: 123, skillMastery: 118 },
  { date: "2024-05-01", emotionalIntelligence: 125, skillMastery: 120 },
  { date: "2024-05-02", emotionalIntelligence: 127, skillMastery: 123 },
  { date: "2024-05-03", emotionalIntelligence: 129, skillMastery: 125 },
  { date: "2024-05-04", emotionalIntelligence: 131, skillMastery: 128 },
  { date: "2024-05-05", emotionalIntelligence: 133, skillMastery: 130 },
  { date: "2024-05-06", emotionalIntelligence: 135, skillMastery: 133 },
  { date: "2024-05-07", emotionalIntelligence: 137, skillMastery: 135 },
  { date: "2024-05-08", emotionalIntelligence: 139, skillMastery: 138 },
  { date: "2024-05-09", emotionalIntelligence: 141, skillMastery: 140 },
  { date: "2024-05-10", emotionalIntelligence: 143, skillMastery: 143 },
  { date: "2024-05-11", emotionalIntelligence: 145, skillMastery: 145 },
  { date: "2024-05-12", emotionalIntelligence: 147, skillMastery: 148 },
  { date: "2024-05-13", emotionalIntelligence: 149, skillMastery: 150 },
  { date: "2024-05-14", emotionalIntelligence: 151, skillMastery: 153 },
  { date: "2024-05-15", emotionalIntelligence: 153, skillMastery: 155 },
  { date: "2024-05-16", emotionalIntelligence: 155, skillMastery: 158 },
  { date: "2024-05-17", emotionalIntelligence: 157, skillMastery: 160 },
  { date: "2024-05-18", emotionalIntelligence: 159, skillMastery: 163 },
  { date: "2024-05-19", emotionalIntelligence: 161, skillMastery: 165 },
  { date: "2024-05-20", emotionalIntelligence: 163, skillMastery: 168 },
  { date: "2024-05-21", emotionalIntelligence: 165, skillMastery: 170 },
  { date: "2024-05-22", emotionalIntelligence: 167, skillMastery: 173 },
  { date: "2024-05-23", emotionalIntelligence: 169, skillMastery: 175 },
  { date: "2024-05-24", emotionalIntelligence: 171, skillMastery: 178 },
  { date: "2024-05-25", emotionalIntelligence: 173, skillMastery: 180 },
  { date: "2024-05-26", emotionalIntelligence: 175, skillMastery: 183 },
  { date: "2024-05-27", emotionalIntelligence: 177, skillMastery: 185 },
  { date: "2024-05-28", emotionalIntelligence: 179, skillMastery: 188 },
  { date: "2024-05-29", emotionalIntelligence: 181, skillMastery: 190 },
  { date: "2024-05-30", emotionalIntelligence: 183, skillMastery: 193 },
  { date: "2024-05-31", emotionalIntelligence: 185, skillMastery: 195 },
  { date: "2024-06-01", emotionalIntelligence: 187, skillMastery: 198 },
  { date: "2024-06-02", emotionalIntelligence: 189, skillMastery: 200 },
  { date: "2024-06-03", emotionalIntelligence: 191, skillMastery: 203 },
  { date: "2024-06-04", emotionalIntelligence: 193, skillMastery: 205 },
  { date: "2024-06-05", emotionalIntelligence: 195, skillMastery: 208 },
  { date: "2024-06-06", emotionalIntelligence: 197, skillMastery: 210 },
  { date: "2024-06-07", emotionalIntelligence: 199, skillMastery: 213 },
  { date: "2024-06-08", emotionalIntelligence: 201, skillMastery: 215 },
  { date: "2024-06-09", emotionalIntelligence: 203, skillMastery: 218 },
  { date: "2024-06-10", emotionalIntelligence: 205, skillMastery: 220 },
  { date: "2024-06-11", emotionalIntelligence: 207, skillMastery: 223 },
  { date: "2024-06-12", emotionalIntelligence: 209, skillMastery: 225 },
  { date: "2024-06-13", emotionalIntelligence: 211, skillMastery: 228 },
  { date: "2024-06-14", emotionalIntelligence: 213, skillMastery: 230 },
  { date: "2024-06-15", emotionalIntelligence: 215, skillMastery: 233 },
  { date: "2024-06-16", emotionalIntelligence: 217, skillMastery: 235 },
  { date: "2024-06-17", emotionalIntelligence: 219, skillMastery: 238 },
  { date: "2024-06-18", emotionalIntelligence: 221, skillMastery: 240 },
  { date: "2024-06-19", emotionalIntelligence: 223, skillMastery: 243 },
  { date: "2024-06-20", emotionalIntelligence: 225, skillMastery: 245 },
  { date: "2024-06-21", emotionalIntelligence: 227, skillMastery: 248 },
  { date: "2024-06-22", emotionalIntelligence: 229, skillMastery: 250 },
  { date: "2024-06-23", emotionalIntelligence: 231, skillMastery: 253 },
  { date: "2024-06-24", emotionalIntelligence: 233, skillMastery: 255 },
  { date: "2024-06-25", emotionalIntelligence: 235, skillMastery: 258 },
  { date: "2024-06-26", emotionalIntelligence: 237, skillMastery: 260 },
  { date: "2024-06-27", emotionalIntelligence: 239, skillMastery: 263 },
  { date: "2024-06-28", emotionalIntelligence: 241, skillMastery: 265 },
  { date: "2024-06-29", emotionalIntelligence: 243, skillMastery: 268 },
  { date: "2024-06-30", emotionalIntelligence: 245, skillMastery: 270 },
];

const chartConfig = {
  skillProgress: {
    label: "Skill Progress",
  },
  emotionalIntelligence: {
    label: "Emotional Intelligence",
    color: "var(--primary)",
  },
  skillMastery: {
    label: "Skill Mastery",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Skill Development Progress</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Personal growth tracking for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-emotionalIntelligence)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-emotionalIntelligence)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-skillMastery)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-skillMastery)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="skillMastery"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-skillMastery)"
              stackId="a"
            />
            <Area
              dataKey="emotionalIntelligence"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-emotionalIntelligence)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
