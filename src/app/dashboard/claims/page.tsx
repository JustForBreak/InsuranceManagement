"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClaimsPage() {
    const [claims, setClaims] = useState([]);

    async function loadClaims() {
        const res = await fetch("/api/claims");
        const data = await res.json();
        setClaims(data);
    }

    async function updateClaim(id: number, action: string) {
        await fetch("/api/claims", {
            method: "POST",
            body: JSON.stringify({ claimId: id, action }),
        });
        loadClaims();
    }

    useEffect(() => {
        loadClaims();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Claims</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {claims.map((c: any) => (
                    <Card key={c.id} className="shadow">
                        <CardContent className="p-4 space-y-2">
                            <p><b>Claim #:</b> {c.claim_number}</p>
                            <p><b>User:</b> {c.first_name} {c.last_name} ({c.email})</p>
                            <p><b>Policy:</b> {c.policy_number}</p>
                            <p><b>Amount:</b> ${c.amount}</p>
                            <p><b>Status:</b> {c.status}</p>
                            <p><b>Filed:</b> {c.filed_date}</p>
                            <p><b>Resolved:</b> {c.resolved_date ?? "—"}</p>
                            <p><b>Description:</b> {c.description}</p>

                            <div className="flex gap-2 pt-3">
                                <Button onClick={() => updateClaim(c.id, "approved")}>
                                    Approve
                                </Button>
                                <Button variant="destructive" onClick={() => updateClaim(c.id, "rejected")}>
                                    Reject
                                </Button>
                                <Button 
                                    variant="secondary"
                                    onClick={() => updateClaim(c.id, "under_review")}
                                >
                                    Flag
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
