// src/app/quick-create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCirclePlusFilled } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function QuickCreatePage() {
  const [type, setType] = useState("auto");
  const [coverage, setCoverage] = useState("");
  const [premium, setPremium] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        alert("Please log in first!");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          coverageAmount: Number(coverage),
          premium: Number(premium),
          startDate,
          endDate,
          userId: user.id,
        }),
      });

      if (res.ok) {
        alert("Policy created successfully!");
        
        // THIS LINE IS THE FINAL BOSS KILLER
        window.location.href = "/dashboard";
      } else {
        const error = await res.json();
        alert(error.message || "Failed to create policy");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Your icons (SVG – no install needed)
  const icons = {
    auto: <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    home: <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
    health: <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <IconCirclePlusFilled className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
              <h1 className="text-3xl font-bold">Quick Create Policy</h1>
              <p className="text-gray-600 mt-2">Create a new policy in under 2 minutes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rest of the form exactly the same as before */}
              <div>
                <Label>Insurance Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto"><div className="flex items-center gap-3"><svg className="w-8 h-8" /* car icon */ />Auto Insurance</div></SelectItem>
                    <SelectItem value="home"><div className="flex items-center gap-3"><svg className="w-8 h-8" /* home icon */ />Home Insurance</div></SelectItem>
                    <SelectItem value="health"><div className="flex items-center gap-3"><svg className="w-8 h-8" /* heart icon */ />Health Insurance</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center py-4">{icons[type]}</div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Coverage Amount ($)</Label><Input type="number" value={coverage} onChange={e => setCoverage(e.target.value)} required /></div>
                <div><Label>Annual Premium ($)</Label><Input type="number" value={premium} onChange={e => setPremium(e.target.value)} required /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                <div><Label>End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required /></div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating Policy..." : "Create Policy"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}