"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconX,
  IconPlus,
  IconFilter,
  IconFileDescription,
  IconDotsVertical,
  IconEye,
  IconShield,
} from "@tabler/icons-react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter
} from "@/components/ui/card";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Claim = {
  id: number;
  claimNumber: string;
  amount: number;
  description: string;
  status: string;
  filedDate: string;
  resolvedDate: string | null;
  policyId: number;
  policyNumber: string;
  policyType: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type Policy = {
  id: number;
  policyNumber: string;
  type: string;
  status: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export function ClaimsTab({ initialOpenDialog = false }: { initialOpenDialog?: boolean }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(initialOpenDialog);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);

  const [formData, setFormData] = useState({
    policyId: "",
    userId: "",
    amount: "",
    description: "",
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

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      Promise.all([loadClaims(), loadPolicies()]).finally(() => setIsLoading(false));
    }
  }, [statusFilter, currentUser]);

  const loadClaims = async () => {
    if (!currentUser) return;
    
    try {
      const isAdmin = currentUser.role === 'agent';
      const params = new URLSearchParams();
      
      // Add status filter if not "all"
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      
      // For regular users, add userId filter
      if (!isAdmin) {
        params.append("userId", currentUser.id.toString());
      }
      
      const queryString = params.toString();
      const url = queryString ? `/api/claims?${queryString}` : "/api/claims";
      
      const res = await fetch(url);
      const data = await res.json();
      setClaims(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load claims");
    }
  };

  const loadPolicies = async () => {
    if (!currentUser) return;
    
    try {
      const isAdmin = currentUser.role === 'agent';
      const url = isAdmin 
        ? "/api/policies" 
        : `/api/policies?userId=${currentUser.id}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setPolicies(Array.isArray(data) ? data.filter((p: Policy) => p.status === "active") : []);
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/claims?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const messages: Record<string, string> = {
        approved: "Claim approved successfully",
        rejected: "Claim rejected",
        under_review: "Claim flagged for review",
        pending: "Claim set to pending",
      };
      toast.success(messages[status] || "Status updated");
      loadClaims();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update claim status");
    }
  };

  const handleCreateClaim = async () => {
    if (!formData.policyId || !formData.amount || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPolicy = policies.find((p) => p.id.toString() === formData.policyId);
      if (!selectedPolicy) {
        toast.error("Invalid policy selected");
        return;
      }

      // For regular users, ensure they can only create claims for their own policies
      const isAdmin = currentUser.role === 'agent';
      const userId = isAdmin ? selectedPolicy.user.id : currentUser.id;

      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyId: parseInt(formData.policyId),
          userId: userId,
          amount: parseFloat(formData.amount),
          description: formData.description,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create claim");
      }

      toast.success("Claim created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ policyId: "", userId: "", amount: "", description: "" });
      loadClaims();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to create claim");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
      approved: {
        icon: <IconCheck className="size-3.5" />,
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800",
        label: "Approved",
      },
      pending: {
        icon: <IconClock className="size-3.5" />,
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800",
        label: "Pending",
      },
      rejected: {
        icon: <IconX className="size-3.5" />,
        color: "text-rose-700 dark:text-rose-400",
        bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-800",
        label: "Rejected",
      },
      under_review: {
        icon: <IconAlertTriangle className="size-3.5" />,
        color: "text-blue-700 dark:text-blue-400",
        bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800",
        label: "Under Review",
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Stats calculation
  const stats = {
    total: claims.length,
    pending: claims.filter((c) => c.status === "pending").length,
    underReview: claims.filter((c) => c.status === "under_review").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
    totalAmount: claims.reduce((sum, c) => sum + c.amount, 0),
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-3 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-[160px]" />
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6"><Skeleton className="h-4 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                  <TableHead className="text-right pr-6"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Skeleton className="h-8 w-8 ml-auto" />
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

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Claims Management</h1>
          <p className="text-muted-foreground">Review and process insurance claims</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <IconPlus className="size-4" />
              New Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[580px] p-0 gap-0 overflow-hidden">
            {/* Header with gradient and image */}
            <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4 overflow-hidden">
              {/* Background image */}
              <div className="absolute inset-0 opacity-10">
                <Image 
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=200&fit=crop&q=80" 
                  alt="Insurance claim" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="relative flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <IconFileDescription className="size-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <DialogTitle className="text-xl">File New Claim</DialogTitle>
                  <DialogDescription>
                    Submit a claim against an active insurance policy. Our team will review it within 24-48 hours.
                  </DialogDescription>
                </div>
              </div>
              {/* Visual element */}
              <div className="relative mt-4 flex items-center justify-center h-32">
                <Image 
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=200&fit=crop&q=80" 
                  alt="Document processing" 
                  width={500}
                  height={200}
                  className="w-full h-full object-cover rounded-lg border border-primary/20"
                  unoptimized
                />
              </div>
            </div>

            {/* Form content */}
            <div className="p-6 space-y-6">
              {/* Policy Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="policy" className="text-sm font-medium">
                    Select Policy
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {policies.length} active {policies.length === 1 ? "policy" : "policies"}
                  </span>
                </div>
                <Select
                  value={formData.policyId}
                  onValueChange={(value) => {
                    const policy = policies.find((p) => p.id.toString() === value);
                    setFormData({
                      ...formData,
                      policyId: value,
                      userId: policy?.user.id.toString() || "",
                    });
                  }}
                >
                  <SelectTrigger id="policy" className="h-12">
                    <SelectValue placeholder="Choose a policy to claim against..." />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No active policies available
                      </div>
                    ) : (
                      policies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id.toString()} className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                              <IconShield className="size-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-mono font-medium">{policy.policyNumber}</span>
                              <span className="text-xs text-muted-foreground">
                                {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} • {policy.user.firstName} {policy.user.lastName}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Claim Amount
                </Label>
                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center border-r bg-muted/50 rounded-l-md">
                    <span className="text-sm font-medium text-muted-foreground">USD</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="h-12 pl-14 text-lg font-semibold tabular-nums"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the total amount you're claiming for this incident.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Incident Description
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.description.length}/500
                  </span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Please describe the incident in detail. Include dates, circumstances, and any relevant information that will help process your claim..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value.slice(0, 500) })
                  }
                  rows={5}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t bg-muted/30 px-6 py-4">
              <p className="text-xs text-muted-foreground max-w-[280px]">
                By submitting, you confirm all information is accurate to the best of your knowledge.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setFormData({ policyId: "", userId: "", amount: "", description: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateClaim} 
                  disabled={isSubmitting || !formData.policyId || !formData.amount || !formData.description}
                  className="gap-2 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <IconClock className="size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <IconCheck className="size-4" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-50 to-card dark:from-amber-950/20 dark:to-card border-amber-100 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconClock className="size-4 text-amber-600" />
              Pending
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums text-amber-700 dark:text-amber-400">
              {stats.pending}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <span className="text-xs text-muted-foreground">Awaiting review</span>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-card dark:from-blue-950/20 dark:to-card border-blue-100 dark:border-blue-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconAlertTriangle className="size-4 text-blue-600" />
              Under Review
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums text-blue-700 dark:text-blue-400">
              {stats.underReview}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <span className="text-xs text-muted-foreground">Being investigated</span>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-card dark:from-emerald-950/20 dark:to-card border-emerald-100 dark:border-emerald-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconCheck className="size-4 text-emerald-600" />
              Approved
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums text-emerald-700 dark:text-emerald-400">
              {stats.approved}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <span className="text-xs text-muted-foreground">Claims processed</span>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-card dark:from-primary/10 dark:to-card">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <IconFileDescription className="size-4" />
              Total Value
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {formatCurrency(stats.totalAmount)}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <span className="text-xs text-muted-foreground">{stats.total} total claims</span>
          </CardFooter>
        </Card>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>All Claims</CardTitle>
            <CardDescription>
              {claims.length} claim{claims.length !== 1 ? "s" : ""} in database
            </CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <IconFilter className="size-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="px-0">
          {claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <IconFileDescription className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No claims found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {statusFilter !== "all" 
                  ? `No ${statusFilter.replace("_", " ")} claims to display.`
                  : "Get started by creating your first claim."}
              </p>
              {statusFilter !== "all" && (
                <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
                  View all claims
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Claim</TableHead>
                    <TableHead>Claimant</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Filed</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {claims.map((claim) => {
                    const statusConfig = getStatusConfig(claim.status);
                    return (
                      <TableRow key={claim.id} className="group">
                        <TableCell className="pl-6">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-medium">{claim.claimNumber}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {claim.description}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {claim.user.firstName} {claim.user.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {claim.user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">{claim.policyNumber}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {claim.policyType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatCurrency(claim.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`gap-1 ${statusConfig.bg} ${statusConfig.color} border`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(claim.filedDate)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <IconDotsVertical className="size-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setSelectedClaim(claim)}>
                                <IconEye className="size-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {claim.status !== "approved" && (
                                <DropdownMenuItem 
                                  onClick={() => updateStatus(claim.id, "approved")}
                                  className="text-emerald-600"
                                >
                                  <IconCheck className="size-4 mr-2" />
                                  Approve Claim
                                </DropdownMenuItem>
                              )}
                              {claim.status !== "under_review" && (
                                <DropdownMenuItem 
                                  onClick={() => updateStatus(claim.id, "under_review")}
                                  className="text-blue-600"
                                >
                                  <IconAlertTriangle className="size-4 mr-2" />
                                  Flag for Review
                                </DropdownMenuItem>
                              )}
                              {claim.status !== "rejected" && (
                                <DropdownMenuItem 
                                  onClick={() => updateStatus(claim.id, "rejected")}
                                  className="text-rose-600"
                                >
                                  <IconX className="size-4 mr-2" />
                                  Reject Claim
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Details Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedClaim && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-mono">{selectedClaim.claimNumber}</DialogTitle>
                  <Badge 
                    variant="outline" 
                    className={`gap-1 ${getStatusConfig(selectedClaim.status).bg} ${getStatusConfig(selectedClaim.status).color}`}
                  >
                    {getStatusConfig(selectedClaim.status).icon}
                    {getStatusConfig(selectedClaim.status).label}
                  </Badge>
                </div>
                <DialogDescription>
                  Filed on {formatDate(selectedClaim.filedDate)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Claimant</p>
                    <p className="font-medium">{selectedClaim.user.firstName} {selectedClaim.user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedClaim.user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Policy</p>
                    <p className="font-mono">{selectedClaim.policyNumber}</p>
                    <p className="text-sm text-muted-foreground capitalize">{selectedClaim.policyType}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Claim Amount</p>
                  <p className="text-2xl font-bold tabular-nums">{formatCurrency(selectedClaim.amount)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
                  <p className="text-sm leading-relaxed">{selectedClaim.description}</p>
                </div>

                {selectedClaim.resolvedDate && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resolved</p>
                    <p className="text-sm">{formatDate(selectedClaim.resolvedDate)}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {selectedClaim.status !== "approved" && (
                  <Button 
                    onClick={() => {
                      updateStatus(selectedClaim.id, "approved");
                      setSelectedClaim(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <IconCheck className="size-4 mr-2" />
                    Approve
                  </Button>
                )}
                {selectedClaim.status !== "rejected" && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      updateStatus(selectedClaim.id, "rejected");
                      setSelectedClaim(null);
                    }}
                  >
                    <IconX className="size-4 mr-2" />
                    Reject
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
