"use client";

import { useEffect, useState } from "react";
import {
  IconUser, IconMail, IconCreditCard, IconShield, IconFileText, IconReceipt
} from "@tabler/icons-react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from "@/components/ui/card";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell
} from "@/components/ui/table";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Policy = {
  id: number;
  policy_number: string;
  type: string;
  coverage_amount: number;
  premium: number;
  status: string;
};

type Claim = {
  id: number;
  claim_number: string;
  amount: number;
  description: string;
  status: string;
  filed_date: string;
  resolved_date?: string | null;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  creditScore?: number | null;
  riskLevel?: string | null;
  policies: Policy[];
  claims: Claim[];
};

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((data: User[]) => setUsers(data))
      .catch((err) => console.error("Users load error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Credit Score</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getRiskBadge = (riskLevel: string | null | undefined) => {
    if (!riskLevel) return <Badge variant="outline">N/A</Badge>
    const level = riskLevel.toLowerCase()
    if (level === 'low') {
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Low Risk</Badge>
    } else if (level === 'medium') {
      return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">Medium Risk</Badge>
    } else {
      return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">High Risk</Badge>
    }
  }

  const getCreditScoreColor = (score: number | null | undefined) => {
    if (!score) return "text-muted-foreground"
    if (score >= 750) return "text-green-600 font-semibold"
    if (score >= 650) return "text-amber-600 font-semibold"
    return "text-red-600 font-semibold"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all users, their credit profiles, policies, and claims
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconUser className="h-4 w-4" />
              Total Users
            </CardDescription>
            <CardTitle className="text-3xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconCreditCard className="h-4 w-4" />
              Total Policies
            </CardDescription>
            <CardTitle className="text-3xl">
              {users.reduce((sum, u) => sum + (u.policies?.length || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconReceipt className="h-4 w-4" />
              Total Claims
            </CardDescription>
            <CardTitle className="text-3xl">
              {users.reduce((sum, u) => sum + (u.claims?.length || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconShield className="h-4 w-4" />
              Avg Credit Score
            </CardDescription>
            <CardTitle className="text-3xl">
              {users.length > 0 && users.some(u => u.creditScore)
                ? Math.round(
                    users
                      .filter(u => u.creditScore)
                      .reduce((sum, u) => sum + (u.creditScore || 0), 0) /
                    users.filter(u => u.creditScore).length
                  )
                : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Complete list of registered users and their credit information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Credit Score</TableHead>
                <TableHead className="text-center">Risk Level</TableHead>
                <TableHead className="text-center">Policies</TableHead>
                <TableHead className="text-center">Claims</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <IconUser className="h-4 w-4 text-primary" />
                        </div>
                        {u.firstName} {u.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IconMail className="h-4 w-4" />
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {u.creditScore ? (
                        <span className={getCreditScoreColor(u.creditScore)}>
                          {u.creditScore}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getRiskBadge(u.riskLevel)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{u.policies?.length || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{u.claims?.length || 0}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Expand to view detailed information about each user's policies and claims
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {users.map((u) => (
              <AccordionItem key={u.id} value={`user-${u.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconUser className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{u.firstName} {u.lastName}</div>
                      <div className="text-sm text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="space-y-4 pt-4">
                  {/* Credit Profile Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconCreditCard className="h-5 w-5" />
                        Credit Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Credit Score</p>
                          <p className={`text-2xl font-bold ${getCreditScoreColor(u.creditScore)}`}>
                            {u.creditScore ?? "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                          <div className="mt-1">
                            {getRiskBadge(u.riskLevel)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Policies Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconFileText className="h-5 w-5" />
                        Policies ({u.policies?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!u.policies || u.policies.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No policies found</p>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                          {u.policies.map((p) => (
                            <Card key={p.id} className="border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Policy #</span>
                                    <span className="font-mono font-semibold">{p.policy_number}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                                    <Badge variant="outline" className="capitalize">{p.type}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Coverage</span>
                                    <span className="font-semibold">{formatCurrency(p.coverage_amount)}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Premium</span>
                                    <span className="font-semibold">{formatCurrency(p.premium)}</span>
                                  </div>
                                  <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                                    <Badge 
                                      className={
                                        p.status === 'active' 
                                          ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                                          : 'bg-muted text-muted-foreground'
                                      }
                                    >
                                      {p.status}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Claims Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconReceipt className="h-5 w-5" />
                        Claims ({u.claims?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!u.claims || u.claims.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No claims found</p>
                      ) : (
                        <div className="space-y-3">
                          {u.claims.map((c) => (
                            <Card key={c.id} className="border-l-4 border-l-amber-500">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Claim #</span>
                                    <span className="font-mono font-semibold">{c.claim_number}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Amount</span>
                                    <span className="font-semibold text-lg">{formatCurrency(c.amount)}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-muted-foreground">Description</span>
                                    <p className="text-sm mt-1">{c.description}</p>
                                  </div>
                                  <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                                    <Badge 
                                      className={
                                        c.status === 'approved'
                                          ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                                          : c.status === 'rejected'
                                          ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                      }
                                    >
                                      {c.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Filed: {new Date(c.filed_date).toLocaleDateString()}</span>
                                    {c.resolved_date && (
                                      <span>Resolved: {new Date(c.resolved_date).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
