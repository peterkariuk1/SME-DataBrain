"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Bell, Users, Warehouse, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from '@/components/ui/skeleton';
import { generateMonthlyBusinessSummary } from '@/ai/flows/generate-monthly-business-summary';
import { fullBusinessDataString } from '@/lib/mock-data';

type MonthlySummary = {
  title: string;
  content: string;
};

const otherReports = [
    { title: "Weekly Anomaly Alerts", icon: Bell, description: "Real-time alerts on unusual business activity.", status: "Active" },
    { title: "Branch Performance Comparison", icon: Users, description: "Side-by-side comparison of your branches.", status: "Not setup" },
    { title: "Inventory Flow Analysis", icon: Warehouse, description: "Track product movement and identify bottlenecks.", status: "Active" },
]

export default function ReportsPage() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const result = await generateMonthlyBusinessSummary({
          businessData: fullBusinessDataString,
        });
        
        const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();

        setSummary({
          title: `Monthly Performance Summary - ${currentMonthName} ${currentYear}`,
          content: result.summary,
        });

      } catch (error) {
        console.error("Error fetching monthly summary:", error);
        setSummary({ title: 'Error', content: 'Could not generate summary at this time. Please try again later.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Automated Reports</h1>
          <p className="text-muted-foreground">Proactive insights and summaries powered by AI.</p>
        </div>
      </div>
      
      <Card className="shadow-lg shadow-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <FileText className="text-primary"/>}
            {isLoading || !summary ? <Skeleton className="h-7 w-3/4" /> : summary.title}
          </CardTitle>
          <CardDescription>Generated automatically based on this month's data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading || !summary ? (
            <div className='space-y-2'>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          ) : (
            <p className="text-foreground/90 leading-relaxed">{summary.content}</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Other Available Reports</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherReports.map((report) => (
                <Card key={report.title} className="hover:border-accent transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">{report.title}</CardTitle>
                        <report.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                        <Badge variant={report.status === 'Active' ? 'default' : 'outline'} className={report.status === 'Active' ? 'bg-green-600/20 text-green-300 border-green-600/50' : ''}>
                            {report.status}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

    </div>
  );
}
