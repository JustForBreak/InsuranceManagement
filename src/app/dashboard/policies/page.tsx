"use client";

import { useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    fetch("/api/policies")
      .then(r => r.json())
      .then(setPolicies)
      .catch(e => console.error(e));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, status } : p))
    );

    await fetch(`/api/policies?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  };

  return (
    <div className="p-8 space-y-6">

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
              {policies.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.policy_number}</TableCell>
                  <TableCell>{p.user.first_name} {p.user.last_name}</TableCell>
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

