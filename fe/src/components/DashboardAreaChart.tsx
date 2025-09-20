"use client";

import { MoveUpRight, MoveDown, ArrowRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  //   CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatToK } from "@/lib/formatToK";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface DashboardProps {
  data: Array<{
    month: string;
    amount: number;
    // [K in string]: string | number;
  }>;
  title: string;
  number: number;
  percentageIncrease: number;
}

const formatSEK = new Intl.NumberFormat("sv-SE", {
  style: "decimal",
  //   currency: "SEK",
});

export function DasboardAreaChart({
  data,
  title,
  number,
  percentageIncrease,
}: DashboardProps) {
  // Get current month name
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });

  // Find matching value from chart data
  const currentMonthValue =
    data.find((item) => item.month.toLowerCase() === currentMonth.toLowerCase())
      ?.amount ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="mb-4 flex justify-between">
          {title}
          <div className="font-normal">Monthly</div>
        </CardTitle>
        <CardDescription className="flex flex-col">
          <div className="flex gap-x-8 items-start">
            <div className="font-bold text-[32px] text-black dark:text-white">
              {formatSEK.format(number)} SEK
            </div>
            <div
              className={`p-[2px] flex border rounded-md items-center gap-x-1 ${
                percentageIncrease > 0
                  ? "border-green-500 text-green-500" // Positive increase
                  : percentageIncrease < 0
                  ? "border-red-500 text-red-500" // Negative increase
                  : "border-gray-500 text-gray-500" // No increase
              }`}
            >
              {percentageIncrease > 0 ? (
                <MoveUpRight size={16} /> // Arrow pointing up for positive increase
              ) : percentageIncrease < 0 ? (
                <MoveDown size={16} /> // Arrow pointing down for negative increase
              ) : (
                <ArrowRight size={16} /> // Arrow pointing right for no increase
              )}
              {percentageIncrease > 0
                ? `+${percentageIncrease}%`
                : `${percentageIncrease}%`}
            </div>
          </div>
          <div className="mt-1">Gained {currentMonthValue} this month</div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={formatToK}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="amount"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  );
}
