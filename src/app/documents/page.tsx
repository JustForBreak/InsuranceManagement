// src/app/documents/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  IconFileText, IconDownload, IconId, IconReceipt,
  IconShieldCheck, IconChevronDown, IconChevronRight,
  IconCar, IconHome, IconHeart
} from "@tabler/icons-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Document {
  type: string;
  description: string;
  id: string;
}

interface Policy {
  id: number;
  policy_number: string;
  type: string;
  status: string;
  coverage_amount: string;
  premium: string;
  start_date: string;
  end_date: string;
  documents: Document[];
}

export default function DocumentsPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPolicies, setOpenPolicies] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) return (window.location.href = "/login");

      const res = await fetch("/api/documents");
      const data = await res.json();
      setPolicies(data.policies || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const togglePolicy = (id: number) => {
    setOpenPolicies(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    return isNaN(d.getTime()) ? "—" : format(d, "MMM d, yyyy");
  };

  const getPolicyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "auto": return <IconCar className="w-6 h-6 text-blue-600" />;
      case "home": return <IconHome className="w-6 h-6 text-green-600" />;
      case "health": return <IconHeart className="w-6 h-6 text-red-600" />;
      default: return <IconShieldCheck className="w-6 h-6" />;
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case "Policy Contract": return <IconFileText className="w-5 h-5 text-blue-600" />;
      case "Digital ID Card": return <IconId className="w-5 h-5 text-green-600" />;
      case "Payment Receipt": return <IconReceipt className="w-5 h-5 text-purple-600" />;
      default: return <IconFileText className="w-5 h-5" />;
    }
  };

  if (loading) return <div className="p-12 text-center">Loading documents...</div>;

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
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">My Documents</h1>
          <p className="text-muted-foreground mt-2">
            All your insurance documents, organized by policy
          </p>
        </div>

        {policies.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent>
              <IconShieldCheck className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <p className="text-xl mb-6">No policies yet</p>
              <Button asChild size="lg"><Link href="/quick-create">Create Policy</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <Collapsible open={openPolicies.has(policy.id)} onOpenChange={() => togglePolicy(policy.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getPolicyIcon(policy.type)}
                          <div>
                            <CardTitle className="text-xl">
                              {policy.policy_number} – {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Policy
                            </CardTitle>
                            <CardDescription>
                              Coverage: ${Number(policy.coverage_amount).toLocaleString()} • 
                              Premium: ${Number(policy.premium).toFixed(2)}/yr • 
                              {formatDate(policy.start_date)} to {formatDate(policy.end_date)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={policy.status === "cancelled" ? "destructive" : "default"}>
                            {policy.status === "cancelled" ? "Cancelled" : "Active"}
                          </Badge>
                          {openPolicies.has(policy.id) ? <IconChevronDown /> : <IconChevronRight />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {policy.documents.map((doc) => (
                          <div key={doc.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                              {getDocIcon(doc.type)}
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{doc.type}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-5 w-full"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = `/api/documents/download?id=${doc.id}`;
                                link.download = `${policy.policy_number} - ${doc.type}.pdf`;
                                link.click();
                              }}
                            >
                              <IconDownload className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
    </div>
    </SidebarProvider>
  );
}