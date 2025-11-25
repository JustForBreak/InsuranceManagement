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

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(setUsers)
      .catch(err => console.error("Users load error:", err));
  }, []);

  return (
    <div className="p-8 space-y-6">
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
              {users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>{u.first_name} {u.last_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.credit_score ?? "—"}</TableCell>
                  <TableCell>{u.risk_level ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DETAILS */}
      <Accordion type="multiple">
        {users.map((u: any) => (
          <AccordionItem key={u.id} value={`user-${u.id}`}>
            <AccordionTrigger>
              {u.first_name} {u.last_name} — Details
            </AccordionTrigger>

            <AccordionContent className="space-y-4">

              {/* Credit Card */}
              <Card>
                <CardHeader><CardTitle>Credit Profile</CardTitle></CardHeader>
                <CardContent>
                  <p><strong>Score:</strong> {u.credit_score ?? "N/A"}</p>
                  <p><strong>Risk:</strong> {u.risk_level ?? "N/A"}</p>
                  <p><strong>Last Checked:</strong> {u.last_checked ?? "N/A"}</p>
                </CardContent>
              </Card>

              {/* Policies */}
              <Card>
                <CardHeader><CardTitle>Policies</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {u.policies.length === 0 && <p>No policies</p>}
                  {u.policies.map((p: any) => (
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

              {/* Claims */}
              <Card>
                <CardHeader><CardTitle>Claims</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {u.claims.length === 0 && <p>No claims</p>}
                  {u.claims.map((c: any) => (
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
