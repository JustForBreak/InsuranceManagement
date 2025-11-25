// src/app/my-policies/page.tsx
"use client";
import Link from "next/link";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { IconFileText, IconCalendar, IconShieldCheck, IconCurrencyDollar, IconCar, IconHome, IconHeart } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Policy {
  id: number;
  type: string;
  coverage_amount: number;
  premium: number;
  start_date: string;
  end_date: string;
  status?: string;
  policy_number?: string;
}

export default function MyPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        if (!user) return (window.location.href = "/login");

        const res = await fetch("/api/policies");
        const data = await res.json();
        setPolicies(res.ok ? data.policies || [] : []);
      } catch (err) {
        alert("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "auto":   return <IconCar className="w-5 h-5 text-blue-600" />;
      case "home":   return <IconHome className="w-5 h-5 text-green-600" />;
      case "health": return <IconHeart className="w-5 h-5 text-red-600" />;
      default:       return <IconFileText className="w-5 h-5" />;
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">My Policies</h1>
        <p className="text-muted-foreground mb-8">
          You have <strong>{policies.length}</strong> active insurance {policies.length === 1 ? "policy" : "policies"}
        </p>

        {policies.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent>
              <IconShieldCheck className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <p className="text-xl mb-6">No policies yet</p>
              <Button asChild size="lg"><Link href="/quick-create">Create First Policy</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Policies</CardTitle>
              <CardDescription>Your complete insurance coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">
                        {policy.policy_number || `#${policy.id}`}
                      </TableCell>
                      <TableCell className="capitalize flex items-center gap-3">
                        {getTypeIcon(policy.type)}
                        <span>{policy.type}</span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-1">
                          <IconCurrencyDollar className="w-4 h-4" />
                          {Number(policy.coverage_amount).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IconCurrencyDollar className="w-4 h-4" />
                          {Number(policy.premium).toFixed(2)}/yr
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <IconCalendar className="w-4 h-4" />
                          {format(new Date(policy.start_date), "MMM d, yyyy")} – {format(new Date(policy.end_date), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.status === "cancelled" ? "destructive" : "default"}>
                          {policy.status === "cancelled" ? "Cancelled" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {policy.status !== "cancelled" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Cancel Policy {policy.policy_number || policy.id}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. Coverage ends immediately.
                              </AlertDialogDescription>
                              <AlertDialogCancel>Keep Policy</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600"
                                onClick={async () => {
                                const res = await fetch("/api/policies", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: policy.id }),
                                });
                                if (res.ok) {
                                    setPolicies(prev => prev.map(p => 
                                    p.id === policy.id ? { ...p, status: "cancelled" } : p
                                    ));
                                }
                                }}
                              >
                                Yes, Cancel Policy
                              </AlertDialogAction>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}