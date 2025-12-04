"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  IconUsers,
  IconShield,
  IconReceipt,
  IconCurrencyDollar,
  IconChartPie,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type AnalyticsData = {
  claimsByStatus: { status: string; count: number; totalAmount: number }[];
  claimsByPolicyType: { policyType: string; count: number; totalAmount: number }[];
  policiesByType: { type: string; count: number; totalPremium: number; totalCoverage: number }[];
  policiesByStatus: { status: string; count: number }[];
  creditScoreDistribution: { range: string; count: number }[];
  riskLevelDistribution: { level: string; count: number }[];
  summary: {
    totalUsers: number;
    totalPolicies: number;
    activePolicies: number;
    totalClaims: number;
    pendingClaims: number;
    approvedClaims: number;
    rejectedClaims: number;
    totalClaimAmount: number;
    approvedClaimAmount: number;
    totalPremiumRevenue: number;
    avgCreditScore: number | null;
  };
};

type CreditProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  credit_score: number;
  risk_level: string;
  concerning_claims?: { claim_number: string; status: string; amount: number }[] | null;
  concerning_policies?: { policy_number: string; status: string }[] | null;
};

const COLORS = {
  approved: "hsl(142, 76%, 36%)",
  pending: "hsl(45, 93%, 47%)",
  rejected: "hsl(0, 84%, 60%)",
  under_review: "hsl(221, 83%, 53%)",
  active: "hsl(142, 76%, 36%)",
  cancelled: "hsl(0, 84%, 60%)",
  expired: "hsl(240, 5%, 64%)",
  auto: "hsl(221, 83%, 53%)",
  home: "hsl(142, 76%, 36%)",
  life: "hsl(280, 65%, 60%)",
  health: "hsl(45, 93%, 47%)",
  low: "hsl(142, 76%, 36%)",
  medium: "hsl(45, 93%, 47%)",
  high: "hsl(0, 84%, 60%)",
};

const CREDIT_SCORE_COLORS: Record<string, string> = {
  "Excellent (750+)": "hsl(142, 76%, 36%)",      // Green - excellent
  "Good (700-749)": "hsl(142, 60%, 50%)",        // Light green - good
  "Fair (650-699)": "hsl(45, 93%, 47%)",         // Yellow/amber - fair
  "Poor (600-649)": "hsl(25, 95%, 53%)",         // Orange - poor
  "Very Poor (<600)": "hsl(0, 84%, 60%)",        // Red - very poor
};

const chartConfigClaims: ChartConfig = {
  approved: { label: "Approved", color: COLORS.approved },
  pending: { label: "Pending", color: COLORS.pending },
  rejected: { label: "Rejected", color: COLORS.rejected },
  under_review: { label: "Under Review", color: COLORS.under_review },
};

const chartConfigRisk: ChartConfig = {
  low: { label: "Low Risk", color: COLORS.low },
  medium: { label: "Medium Risk", color: COLORS.medium },
  high: { label: "High Risk", color: COLORS.high },
};

export function CreditRiskTab() {
  const { theme, resolvedTheme } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [profiles, setProfiles] = useState<CreditProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine theme mode - fallback to checking document class if theme is not available
  const isDarkMode = mounted && (
    resolvedTheme === "dark" || 
    (typeof window !== "undefined" && document.documentElement.classList.contains("dark"))
  );

  // Helper function to get CSS variable value
  const getCSSVariable = (varName: string): string => {
    if (typeof window === "undefined") return "";
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [analyticsRes, profilesRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/credit-risk"),
        ]);
        const analyticsData = await analyticsRes.json();
        const profilesData = await profilesRes.json();
        
        // Only set analytics if it has the expected structure
        if (analyticsData && !analyticsData.error && analyticsData.summary) {
          setAnalytics(analyticsData);
        }
        setProfiles(Array.isArray(profilesData) ? profilesData : []);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-3 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64 px-4 lg:px-6">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  const { summary } = analytics;

  // Prepare chart data
  const claimsStatusData = analytics.claimsByStatus.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace("_", " "),
    value: item.count,
    amount: item.totalAmount,
    fill: COLORS[item.status as keyof typeof COLORS] || "hsl(240, 5%, 64%)",
  }));

  const riskLevelData = analytics.riskLevelDistribution.map((item) => ({
    name: item.level.charAt(0).toUpperCase() + item.level.slice(1) + " Risk",
    value: item.count,
    fill: COLORS[item.level as keyof typeof COLORS] || "hsl(240, 5%, 64%)",
  }));

  const policyTypeData = analytics.policiesByType.map((item) => ({
    type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    count: item.count,
    premium: item.totalPremium,
    fill: COLORS[item.type as keyof typeof COLORS] || "hsl(221, 83%, 53%)",
  }));

  const creditScoreData = analytics.creditScoreDistribution.map((item) => ({
    range: item.range,
    count: item.count,
    fill: CREDIT_SCORE_COLORS[item.range] || "hsl(221, 83%, 53%)",
  }));

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Risk Assessment & Credit Management</h1>
        <p className="text-muted-foreground mt-2">
          View customer credit scores and risk ratings to inform policy decisions
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-card dark:from-blue-950/20 dark:to-card border-blue-100 dark:border-blue-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconUsers className="size-4 text-blue-600" />
              Total Users
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums text-blue-700 dark:text-blue-400">
              {summary.totalUsers}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <span className="text-xs text-muted-foreground">Registered customers</span>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-card dark:from-emerald-950/20 dark:to-card border-emerald-100 dark:border-emerald-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconShield className="size-4 text-emerald-600" />
              Active Policies
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums text-emerald-700 dark:text-emerald-400">
              {summary.activePolicies}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <span className="text-xs text-muted-foreground">
              of {summary.totalPolicies} total
            </span>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-card dark:from-amber-950/20 dark:to-card border-amber-100 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconReceipt className="size-4 text-amber-600" />
              Total Claims
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums text-amber-700 dark:text-amber-400">
              {summary.totalClaims}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <span className="text-xs text-muted-foreground">
              {summary.pendingClaims} pending review
            </span>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-card dark:from-primary/10 dark:to-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconCurrencyDollar className="size-4" />
              Claim Value
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {formatCurrency(summary.totalClaimAmount)}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(summary.approvedClaimAmount)} approved
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Claims by Status - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartPie className="size-5" />
              Claims by Status
            </CardTitle>
            <CardDescription>Distribution of claims across different statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {claimsStatusData.length > 0 && mounted ? (
              <div className="mx-auto aspect-square max-h-[280px]">
                <Chart
                  options={{
                    chart: {
                      type: "donut",
                      fontFamily: "inherit",
                    },
                    labels: claimsStatusData.map((item) => item.name),
                    colors: claimsStatusData.map((item) => item.fill),
                    dataLabels: {
                      enabled: false,
                    },
                    legend: {
                      position: "bottom",
                      fontSize: "12px",
                      fontFamily: "inherit",
                      labels: {
                        colors: isDarkMode ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
                      },
                    },
                    tooltip: {
                      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                        const data = claimsStatusData[seriesIndex];
                        return `
                          <div class="flex flex-col gap-0.5 p-2">
                            <span class="font-semibold">${data.name}: ${series[seriesIndex]} claims</span>
                            <span class="text-muted-foreground">${formatCurrency(data.amount)}</span>
                          </div>
                        `;
                      },
                      theme: isDarkMode ? "dark" : "light",
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          size: "60%",
                        },
                      },
                    },
                    theme: {
                      mode: isDarkMode ? "dark" : "light",
                    },
                  }}
                  series={claimsStatusData.map((item) => item.value)}
                  type="donut"
                  height={280}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                No claims data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Level Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="size-5" />
              Risk Level Distribution
            </CardTitle>
            <CardDescription>Customer risk profiles based on credit assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {riskLevelData.length > 0 && mounted ? (
              <div className="mx-auto aspect-square max-h-[280px]">
                <Chart
                  options={{
                    chart: {
                      type: "donut",
                      fontFamily: "inherit",
                    },
                    labels: riskLevelData.map((item) => item.name),
                    colors: riskLevelData.map((item) => {
                      // Use the fill color directly if it's a valid color string
                      if (item.fill && !item.fill.includes("var(")) {
                        return item.fill;
                      }
                      // Fallback to COLORS mapping
                      return COLORS[item.name.toLowerCase().replace(" risk", "") as keyof typeof COLORS] || item.fill;
                    }),
                    dataLabels: {
                      enabled: false,
                    },
                    legend: {
                      position: "bottom",
                      fontSize: "12px",
                      fontFamily: "inherit",
                      labels: {
                        colors: isDarkMode ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
                      },
                    },
                    tooltip: {
                      custom: function ({ series, seriesIndex, w }) {
                        const data = riskLevelData[seriesIndex];
                        return `
                          <div class="flex flex-col gap-0.5 p-2">
                            <span class="font-semibold">${data.name}: ${series[seriesIndex]} customers</span>
                          </div>
                        `;
                      },
                      theme: isDarkMode ? "dark" : "light",
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          size: "60%",
                        },
                      },
                    },
                    theme: {
                      mode: isDarkMode ? "dark" : "light",
                    },
                  }}
                  series={riskLevelData.map((item) => item.value)}
                  type="donut"
                  height={280}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                No risk data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Policies by Type - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Policies by Type</CardTitle>
            <CardDescription>Number of policies for each insurance type</CardDescription>
          </CardHeader>
          <CardContent>
            {policyTypeData.length > 0 ? (
              <ChartContainer
                config={{
                  count: { label: "Policies", color: "hsl(var(--chart-1))" },
                }}
                className="h-[280px]"
              >
                <BarChart data={policyTypeData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="type"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => (
                          <div className="flex flex-col gap-0.5">
                            <span>{value} policies</span>
                            <span className="text-muted-foreground">
                              Premium: {formatCurrency(props.payload.premium)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {policyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                No policy data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Score Distribution - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Score Distribution</CardTitle>
            <CardDescription>
              Customer credit scores grouped by range
              {summary.avgCreditScore && (
                <Badge variant="outline" className="ml-2">
                  Avg: {summary.avgCreditScore}
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {creditScoreData.length > 0 ? (
              <ChartContainer
                config={{
                  count: { label: "Customers", color: "hsl(var(--chart-2))" },
                }}
                className="h-[280px]"
              >
                <BarChart data={creditScoreData} margin={{ left: 0, right: 20, bottom: 40 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="range"
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {creditScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                No credit score data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credit Profiles Section */}
      {profiles.length > 0 && (
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-xl font-semibold">Credit Risk Profiles</h2>
            <p className="text-sm text-muted-foreground">
              Detailed view of customers with concerning claims or policies
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {profiles.map((p, idx) => {
              const hasConcerns =
                (p.concerning_claims && p.concerning_claims.length > 0) ||
                (p.concerning_policies && p.concerning_policies.length > 0);

              return (
                <Card
                  key={`${p.id}-${idx}`}
                  className={`shadow-sm transition-all hover:shadow-md ${
                    hasConcerns
                      ? "border-amber-200 dark:border-amber-800 border-l-4 border-l-amber-500"
                      : "border-l-4 border-l-green-500"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {p.first_name} {p.last_name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          p.risk_level === "low"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                            : p.risk_level === "medium"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800"
                        }
                      >
                        {p.risk_level.charAt(0).toUpperCase() + p.risk_level.slice(1)} Risk
                      </Badge>
                    </div>
                    <CardDescription>{p.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Credit Score</span>
                      <span className="font-semibold tabular-nums">{p.credit_score}</span>
                    </div>

                    {p.concerning_claims && p.concerning_claims.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Concerning Claims:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {p.concerning_claims.map((c, i) => (
                            <li key={i} className="flex justify-between">
                              <span>#{c.claim_number} — {c.status}</span>
                              <span className="tabular-nums">{formatCurrency(c.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {p.concerning_policies && p.concerning_policies.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Concerning Policies:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {p.concerning_policies.map((pol, i) => (
                            <li key={i}>
                              {pol.policy_number} — {pol.status}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!hasConcerns && (
                      <p className="text-sm text-muted-foreground">
                        No concerning claims or policies
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
