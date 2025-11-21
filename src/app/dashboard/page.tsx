"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis, Cell } from "recharts";
import { CircleDot, TrendingUp, TrendingDown, PlayCircle } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { generateBusinessHealthScore } from "@/ai/flows/generate-business-health-score";
import { mockFinancialData, mockOperationalData, mockMarketData } from "@/lib/mock-data";


const revenueData = [
  { month: "Jan", revenue: 4000 }, { month: "Feb", revenue: 3000 }, { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 }, { month: "May", revenue: 6000 }, { month: "Jun", revenue: 5500 },
];
const topProductsData = [
  { product: "Gadget Pro", sales: 120 }, { product: "Widget Max", sales: 98 }, { product: "Flexi-Thing", sales: 75 },
  { product: "Data-Sphere", sales: 60 }, { product: "Connect-It", sales: 45 },
];
const expenseData = [
  { name: "Salaries", value: 400 }, { name: "Marketing", value: 300 },
  { name: "Rent", value: 200 }, { name: "Utilities", value: 100 },
];

const revenueChartConfig = { revenue: { label: "Revenue", color: "hsl(var(--primary))" } } satisfies ChartConfig;
const productsChartConfig = { sales: { label: "Sales", color: "hsl(var(--accent))" } } satisfies ChartConfig;
const expenseChartConfig = {
  Salaries: { label: "Salaries", color: "hsl(var(--chart-1))" },
  Marketing: { label: "Marketing", color: "hsl(var(--chart-2))" },
  Rent: { label: "Rent", color: "hsl(var(--chart-3))" },
  Utilities: { label: "Utilities", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

type BusinessHealth = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations?: string[];
};

export default function DashboardPage() {
  const [businessHealth, setBusinessHealth] = useState<BusinessHealth | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        setIsLoadingHealth(true);
        const result = await generateBusinessHealthScore({
          financialData: mockFinancialData,
          operationalData: mockOperationalData,
          marketData: mockMarketData,
        });
        setBusinessHealth(result);
      } catch (error) {
        console.error("Error generating business health score:", error);
        setBusinessHealth({ score: 0, strengths: ["Error fetching data"], weaknesses: ["Could not connect to AI service"], recommendations: [] });
      } finally {
        setIsLoadingHealth(false);
      }
    };
  
    fetchHealthScore();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleDot className="text-primary [text-shadow:0_0_8px_hsl(var(--primary))]" />
            Business Health Score
          </CardTitle>
          <CardDescription>Instant AI-powered analysis of your business</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHealth || !businessHealth ? (
            <div className="flex flex-col items-center justify-center gap-4 pt-4">
              <Skeleton className="h-40 w-40 rounded-full" />
              <div className="grid w-full grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 pt-4">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-muted/50">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path className="stroke-current text-border" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4"></path>
                    <path className="stroke-current text-primary transition-all duration-1000 ease-in-out [filter:drop-shadow(0_0_3px_hsl(var(--primary)))]" strokeDasharray={`${businessHealth.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4" strokeLinecap="round"></path>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-headline text-5xl font-bold">{businessHealth.score}</span>
                  <span className="text-sm text-muted-foreground">out of 100</span>
                </div>
              </div>
              <div className="grid w-full grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold"><TrendingUp className="text-green-400" /> Strengths</h4>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    {businessHealth.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold"><TrendingDown className="text-red-400" /> Weaknesses</h4>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    {businessHealth.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="text-accent [text-shadow:0_0_8px_hsl(var(--accent))]"/>
            Welcome Back!
          </CardTitle>
          <CardDescription>Here's a quick update from your AI Analyst</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
             <div className="text-center text-muted-foreground">
              <PlayCircle className="mx-auto h-12 w-12" />
              <p>Video player placeholder</p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
            <LineChart accessibilityLayer data={revenueData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={true} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>By units sold</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={productsChartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={topProductsData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid horizontal={false} />
              <YAxis dataKey="product" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
              <XAxis dataKey="sales" type="number" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="sales" layout="vertical" fill="var(--color-sales)" radius={5} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Monthly breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={expenseChartConfig} className="mx-auto aspect-square h-[250px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie data={expenseData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={2}>
                 {expenseData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={`var(--color-${(Object.keys(expenseChartConfig)[index] as string).replace(/\s/g, '-')})`} />
                  ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
