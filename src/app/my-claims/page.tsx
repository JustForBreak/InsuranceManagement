// src/app/my-claims/page.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  IconUpload,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconFileText,
  IconReceipt,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
interface Claim {
  id: number;
  claim_number: string;
  policy_id?: number;
  policy_number?: string;
  amount: string;
  description: string;
  status: string;
  filed_date: string;
  resolved_date?: string | null;
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) return (window.location.href = "/login");

      const [cRes, pRes] = await Promise.all([
        fetch("/api/claims"),
        fetch("/api/policies"),
      ]);

      const cData = await cRes.json();
      const pData = await pRes.json();

      setClaims(cData.claims || []);
      setPolicies(pData.policies || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/claims", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Claim submitted successfully!");
      window.location.reload();
    } else {
      alert("Failed to submit claim");
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return { variant: "default" as const, icon: <IconCircleCheck className="w-4 h-4" />, label: "Approved" };
      case "rejected":
        return { variant: "destructive" as const, icon: <IconCircleX className="w-4 h-4" />, label: "Rejected" };
      default:
        return { variant: "secondary" as const, icon: <IconClock className="w-4 h-4" />, label: "Pending" };
    }
  };

  if (loading) return <div className="p-12 text-center text-lg">Loading your claims...</div>;

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <div className="flex flex-row w-full">
      <AppSidebar variant="inset" role={"user"} />
      <div className="flex-1 min-h-screen bg-gray-50 py-12 px-4">
      <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-10">

        <div>
          <h1 className="text-4xl font-bold">My Claims</h1>
          <p className="text-muted-foreground mt-2">Submit and track your insurance claims</p>
        </div>

        {/* Submit New Claim */}
        <Card>
          <CardHeader>
            <CardTitle>File a New Claim</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Related Policy (optional)</Label>
                  <Select name="policyId">
                    <SelectTrigger>
                        <SelectValue placeholder="Choose policy (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        {policies
                        .filter(p => p.status !== "cancelled")   // ← THIS LINE BLOCKS CANCELLED POLICIES
                        .map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                            {p.policy_number || `#${p.id}`} – {p.type}
                            {p.status !== "active" && " (inactive)"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div>
                  <Label>Claim Amount ($)</Label>
                  <Input type="number" name="amount" required placeholder="2500" />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input name="description" required placeholder="Briefly describe the incident..." />
              </div>

              <Button type="submit" size="lg">
                <IconUpload className="w-4 h-4 mr-2" />
                Submit Claim
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Claims History */}
        <Card>
          <CardHeader>
            <CardTitle>Claim History</CardTitle>
            <CardDescription>
              {claims.length} claim{claims.length !== 1 ? "s" : ""} filed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {claims.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <IconReceipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No claims filed yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim #</TableHead>
                    <TableHead>Filed Date</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resolved Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => {
                    const status = getStatusInfo(claim.status);
                    return (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">{claim.claim_number}</TableCell>
                        <TableCell>{format(new Date(claim.filed_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{claim.policy_number || "—"}</TableCell>
                        <TableCell className="font-semibold">
                          ${Number(claim.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex w-fit items-center gap-1">
                            {status.icon}
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {claim.resolved_date
                            ? format(new Date(claim.resolved_date), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
    </div>
</SidebarProvider>
    
  );
}