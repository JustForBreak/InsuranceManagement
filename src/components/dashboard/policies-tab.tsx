"use client";

import { useEffect, useState } from "react";
import {
  IconShield,
  IconUser,
  IconCheck,
  IconX,
  IconFlag,
  IconCurrencyDollar,
  IconPlus,
} from "@tabler/icons-react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from "@/components/ui/card";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Policy = {
  id: number;
  policyNumber: string;
  type: string;
  coverageAmount: number;
  premium: number;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export function PoliciesTab() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedRowId, setHighlightedRowId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    type: "",
    coverage: "",
    premium: "",
  });

  useEffect(() => {
    // Load current user from localStorage
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser({ id: parsedUser.id, role: parsedUser.role });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const loadPolicies = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    const isAdmin = currentUser.role === 'agent';
    const url = isAdmin 
      ? "/api/policies" 
      : `/api/policies?userId=${currentUser.id}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load policies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadPolicies();
    }
  }, [currentUser]);

  const updateStatus = async (id: number, status: string) => {
    const policy = policies.find((p) => p.id === id);
    const previousStatus = policy?.status;
    
    // Optimistically update UI
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );

    // Highlight the row
    setHighlightedRowId(id);
    setTimeout(() => {
      setHighlightedRowId(null);
    }, 3000); // Remove highlight after 3 seconds

    try {
      const response = await fetch(`/api/policies?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update policy status");
      }

      // Show success notification
      const statusMessages: Record<string, string> = {
        active: "Policy accepted successfully",
        cancelled: "Policy cancelled successfully",
        under_review: "Policy flagged for review",
      };

      toast.success(statusMessages[status] || "Policy status updated successfully", {
        description: `Policy ${policy?.policyNumber || `#${id}`} status changed from ${previousStatus || "unknown"} to ${status}`,
      });
      
      // Refresh policies list
      loadPolicies();
    } catch (error) {
      console.error("Failed to update policy status:", error);
      
      // Revert on error
      setPolicies((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: previousStatus || p.status } : p))
      );

      // Show error notification
      toast.error("Failed to update policy status", {
        description: "Please try again. If the problem persists, contact support.",
      });
      
      // Remove highlight on error
      setHighlightedRowId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "active") {
      return (
        <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
          Active
        </Badge>
      );
    }
    if (statusLower === "cancelled" || statusLower === "denied") {
      return (
        <Badge variant="destructive">
          Cancelled
        </Badge>
      );
    }
    if (statusLower === "under_review" || statusLower === "flagged") {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
          Under Review
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        {status || "Unknown"}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPolicyType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleCreatePolicy = async () => {
    if (!policyForm.type || !policyForm.coverage || !policyForm.premium) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate start and end dates (1 year policy)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          type: policyForm.type,
          coverageAmount: parseFloat(policyForm.coverage),
          premium: parseFloat(policyForm.premium),
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create policy");
      }

      toast.success("Policy created successfully and submitted for review");
      setIsCreateDialogOpen(false);
      setPolicyForm({ type: "", coverage: "", premium: "" });
      loadPolicies(); // Refresh the policies list
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create policy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = currentUser?.role === 'agent';

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
                  <TableHead>Policy #</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.status?.toLowerCase() === "active").length;
  const totalPremium = policies.reduce((sum, p) => {
    const premium = typeof p.premium === 'string' ? parseFloat(p.premium) : (p.premium || 0);
    return sum + (isNaN(premium) ? 0 : premium);
  }, 0);

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <IconShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPolicies}</div>
            <p className="text-xs text-muted-foreground">All policy records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <IconCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolicies}</div>
            <p className="text-xs text-muted-foreground">
              {totalPolicies > 0 ? `${Math.round((activePolicies / totalPolicies) * 100)}% of total` : "No policies"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Premium</CardTitle>
            <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPremium)}</div>
            <p className="text-xs text-muted-foreground">Monthly premium total</p>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <IconShield className="h-6 w-6" />
                {isAdmin ? "Insurance Policies" : "My Policies"}
              </CardTitle>
              <CardDescription className="mt-2">
                {isAdmin 
                  ? "Manage and review all insurance policies in the system"
                  : "View and manage your insurance policies"}
              </CardDescription>
            </div>
            {!isAdmin && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <IconPlus className="size-4" />
                    New Policy
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Policy</DialogTitle>
                    <DialogDescription>
                      Apply for a new insurance policy. Your application will be reviewed by our team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="policy-type">Policy Type</Label>
                      <Select
                        value={policyForm.type}
                        onValueChange={(value) => setPolicyForm({ ...policyForm, type: value })}
                      >
                        <SelectTrigger id="policy-type">
                          <SelectValue placeholder="Select policy type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                          <SelectItem value="Auto Insurance">Auto Insurance</SelectItem>
                          <SelectItem value="Home Insurance">Home Insurance</SelectItem>
                          <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="coverage">Coverage Amount ($)</Label>
                      <Input
                        id="coverage"
                        type="number"
                        placeholder="500000"
                        value={policyForm.coverage}
                        onChange={(e) => setPolicyForm({ ...policyForm, coverage: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="premium">Monthly Premium ($)</Label>
                      <Input
                        id="premium"
                        type="number"
                        step="0.01"
                        placeholder="450.00"
                        value={policyForm.premium}
                        onChange={(e) => setPolicyForm({ ...policyForm, premium: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePolicy} disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Policy"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {policies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconShield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No policies found</h3>
              <p className="text-sm text-muted-foreground">
                There are no policies in the system yet.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Policy Number</TableHead>
                    <TableHead className="font-semibold">Policyholder</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Coverage</TableHead>
                    <TableHead className="font-semibold">Monthly Premium</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {policies.map((p) => (
                    <TableRow 
                      key={p.id} 
                      className={`hover:bg-muted/50 transition-all duration-500 ${
                        highlightedRowId === p.id 
                          ? "bg-green-50 dark:bg-green-950/30 border-l-4 border-l-green-500 shadow-md" 
                          : ""
                      }`}
                    >
                      <TableCell className="font-medium font-mono">
                        {p.policyNumber || `POL-${p.id}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconUser className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {p.user.firstName} {p.user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">{p.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {formatPolicyType(p.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {p.coverageAmount ? formatCurrency(p.coverageAmount) : "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {(() => {
                          const premium = typeof p.premium === 'string' ? parseFloat(p.premium) : (p.premium || 0);
                          return isNaN(premium) ? 'N/A' : formatCurrency(premium);
                        })()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(p.status)}
                      </TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(p.id, "active")}
                              className="gap-1"
                            >
                              <IconCheck className="h-3.5 w-3.5" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(p.id, "cancelled")}
                              className="gap-1"
                            >
                              <IconX className="h-3.5 w-3.5" />
                              Deny
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(p.id, "under_review")}
                              className="gap-1"
                            >
                              <IconFlag className="h-3.5 w-3.5" />
                              Flag
                            </Button>
                          </div>
                        ) : (
                          <div className="text-right text-sm text-muted-foreground">
                            {p.status === "under_review" ? "Pending Review" : ""}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
