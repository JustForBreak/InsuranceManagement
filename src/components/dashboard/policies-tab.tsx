"use client";

import { useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    fetch("/api/policies")
      .then((r) => r.json())
      .then((data: Policy[]) => setPolicies(data))
      .catch((e) => console.error(e));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );

    await fetch(`/api/policies?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Policies</CardTitle>
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
              {policies.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.policyNumber}</TableCell>
                  <TableCell>{p.user.firstName} {p.user.lastName}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>${p.premium}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell className="space-x-2">
                    <Button onClick={() => updateStatus(p.id, "active")}>Accept</Button>
                    <Button onClick={() => updateStatus(p.id, "cancelled")} variant="destructive">Deny</Button>
                    <Button onClick={() => updateStatus(p.id, "under_review")} variant="outline">Flag</Button>
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
