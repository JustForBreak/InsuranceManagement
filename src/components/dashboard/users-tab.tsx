"use client";

import { useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell
} from "@/components/ui/table";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent
} from "@/components/ui/accordion";

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

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data: User[]) => setUsers(data))
      .catch((err) => console.error("Users load error:", err));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Users</CardTitle>
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
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.firstName} {u.lastName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.creditScore ?? "—"}</TableCell>
                  <TableCell>{u.riskLevel ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Accordion type="multiple">
        {users.map((u) => (
          <AccordionItem key={u.id} value={`user-${u.id}`}>
            <AccordionTrigger>
              {u.firstName} {u.lastName} — Details
            </AccordionTrigger>

            <AccordionContent className="space-y-4">

              <Card>
                <CardHeader><CardTitle>Credit Profile</CardTitle></CardHeader>
                <CardContent>
                  <p><strong>Score:</strong> {u.creditScore ?? "N/A"}</p>
                  <p><strong>Risk:</strong> {u.riskLevel ?? "N/A"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Policies</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {u.policies?.length === 0 && <p>No policies</p>}
                  {u.policies?.map((p) => (
                    <div key={p.id} className="border p-3 rounded">
                      <p><strong>Policy #:</strong> {p.policy_number}</p>
                      <p><strong>Type:</strong> {p.type}</p>
                      <p><strong>Coverage:</strong> ${p.coverage_amount}</p>
                      <p><strong>Premium:</strong> ${p.premium}</p>
                      <p><strong>Status:</strong> {p.status}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Claims</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {u.claims?.length === 0 && <p>No claims</p>}
                  {u.claims?.map((c) => (
                    <div key={c.id} className="border p-3 rounded">
                      <p><strong>Claim #:</strong> {c.claim_number}</p>
                      <p><strong>Amount:</strong> ${c.amount}</p>
                      <p><strong>Description:</strong> {c.description}</p>
                      <p><strong>Status:</strong> {c.status}</p>
                      <p><strong>Date Filed:</strong> {c.filed_date}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
