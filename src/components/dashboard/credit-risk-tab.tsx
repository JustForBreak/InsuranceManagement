"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const multipliers: Record<string, number> = {
  low: 1.0,
  medium: 1.3,
  high: 1.7,
};

type ConcerningClaim = { claim_number: string; status: string; amount: number };
type ConcerningPolicy = { policy_number: string; status: string };

type Profile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  credit_score: number;
  risk_level: keyof typeof multipliers;
  concerning_claims?: ConcerningClaim[] | null;
  concerning_policies?: ConcerningPolicy[] | null;
};

export function CreditRiskTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  async function loadProfiles() {
    const res = await fetch("/api/credit-risk");
    const data = await res.json();
    setProfiles(data);
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Credit & Risk Profiles</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profiles.map((p) => (
          <Card key={p.id} className="shadow">
            <CardContent className="p-4 space-y-2">
              <p><b>User:</b> {p.first_name} {p.last_name}</p>
              <p><b>Email:</b> {p.email}</p>
              <p><b>Credit Score:</b> {p.credit_score}</p>
              <p><b>Risk Level:</b> {p.risk_level}</p>
              <p><b>Multiplier:</b> {multipliers[p.risk_level]}</p>

              <div>
                <b>Concerning Claims:</b>
                <ul className="list-disc ml-6">
                  {p.concerning_claims?.length ? (
                    p.concerning_claims.map((c, i) => (
                      <li key={i}>
                        #{c.claim_number} — {c.status} (${c.amount})
                      </li>
                    ))
                  ) : "None"}
                </ul>
              </div>

              <div>
                <b>Concerning Policies:</b>
                <ul className="list-disc ml-6">
                  {p.concerning_policies?.length ? (
                    p.concerning_policies.map((pol, i) => (
                      <li key={i}>
                        {pol.policy_number} — {pol.status}
                      </li>
                    ))
                  ) : "None"}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
