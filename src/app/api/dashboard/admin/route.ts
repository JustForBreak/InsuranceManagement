import { NextResponse } from 'next/server';

// Mock admin dashboard data
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 300));

  const data = {
    stats: {
      totalUsers: 1250,
      activePolicies: 585,
      totalClaims: 328,
      pendingClaims: 24,
      monthlyRevenue: 125000,
      growthRate: 12.5,
    },
    claimTrends: [
      { month: 'Jan', total: 45, approved: 38, rejected: 7, pending: 0 },
      { month: 'Feb', total: 52, approved: 44, rejected: 8, pending: 0 },
      { month: 'Mar', total: 48, approved: 41, rejected: 7, pending: 0 },
      { month: 'Apr', total: 61, approved: 52, rejected: 9, pending: 0 },
      { month: 'May', total: 55, approved: 47, rejected: 8, pending: 0 },
      { month: 'Jun', total: 67, approved: 58, rejected: 9, pending: 0 },
    ],
    policyDistribution: [
      { type: 'Auto', count: 245, value: 245, fill: 'hsl(var(--chart-1))' },
      { type: 'Home', count: 180, value: 180, fill: 'hsl(var(--chart-2))' },
      { type: 'Life', count: 95, value: 95, fill: 'hsl(var(--chart-3))' },
      { type: 'Health', count: 65, value: 65, fill: 'hsl(var(--chart-4))' },
    ],
    recentClaims: [
      {
        id: 'CLM-2024-001',
        policyNumber: 'POL-2024-1542',
        customer: 'John Smith',
        type: 'Auto',
        amount: 5500,
        status: 'Pending',
        date: '2024-06-15',
      },
      {
        id: 'CLM-2024-002',
        policyNumber: 'POL-2024-3789',
        customer: 'Sarah Johnson',
        type: 'Home',
        amount: 12000,
        status: 'Approved',
        date: '2024-06-14',
      },
      {
        id: 'CLM-2024-003',
        policyNumber: 'POL-2024-2456',
        customer: 'Michael Chen',
        type: 'Health',
        amount: 3200,
        status: 'Under Review',
        date: '2024-06-13',
      },
      {
        id: 'CLM-2024-004',
        policyNumber: 'POL-2024-8901',
        customer: 'Emily Davis',
        type: 'Life',
        amount: 50000,
        status: 'Approved',
        date: '2024-06-12',
      },
      {
        id: 'CLM-2024-005',
        policyNumber: 'POL-2024-5623',
        customer: 'David Martinez',
        type: 'Auto',
        amount: 7800,
        status: 'Rejected',
        date: '2024-06-11',
      },
    ],
  };

  return NextResponse.json(data);
}

