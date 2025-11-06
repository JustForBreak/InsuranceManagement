import { NextResponse } from 'next/server';

// Mock user dashboard data
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 300));

  const data = {
    stats: {
      myPolicies: 3,
      activeClaims: 1,
      totalClaims: 5,
      nextPayment: 450.00,
      nextPaymentDate: '2024-07-15',
      coverageTotal: 75000,
    },
    myPolicies: [
      {
        id: 'POL-2024-1001',
        type: 'Auto',
        status: 'Active',
        premium: 145.00,
        coverage: 25000,
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        nextPaymentDate: '2024-07-15',
      },
      {
        id: 'POL-2024-1002',
        type: 'Home',
        status: 'Active',
        premium: 225.00,
        coverage: 35000,
        startDate: '2024-02-15',
        endDate: '2025-02-15',
        nextPaymentDate: '2024-08-15',
      },
      {
        id: 'POL-2024-1003',
        type: 'Health',
        status: 'Active',
        premium: 80.00,
        coverage: 15000,
        startDate: '2024-03-01',
        endDate: '2025-03-01',
        nextPaymentDate: '2024-09-01',
      },
    ],
    myClaims: [
      {
        id: 'CLM-2024-456',
        policyNumber: 'POL-2024-1001',
        type: 'Auto',
        amount: 2500,
        status: 'Under Review',
        date: '2024-06-10',
        description: 'Vehicle collision damage',
      },
      {
        id: 'CLM-2024-234',
        policyNumber: 'POL-2024-1002',
        type: 'Home',
        amount: 1200,
        status: 'Approved',
        date: '2024-05-15',
        description: 'Water damage repair',
      },
      {
        id: 'CLM-2024-123',
        policyNumber: 'POL-2024-1003',
        type: 'Health',
        amount: 850,
        status: 'Approved',
        date: '2024-04-20',
        description: 'Medical expenses',
      },
      {
        id: 'CLM-2023-890',
        policyNumber: 'POL-2024-1001',
        type: 'Auto',
        amount: 750,
        status: 'Approved',
        date: '2023-12-05',
        description: 'Minor accident repair',
      },
      {
        id: 'CLM-2023-678',
        policyNumber: 'POL-2024-1002',
        type: 'Home',
        amount: 450,
        status: 'Rejected',
        date: '2023-11-12',
        description: 'Maintenance claim',
      },
    ],
    claimTrends: [
      { month: 'Jan', approved: 0, rejected: 0, pending: 0 },
      { month: 'Feb', approved: 0, rejected: 0, pending: 0 },
      { month: 'Mar', approved: 0, rejected: 0, pending: 0 },
      { month: 'Apr', approved: 1, rejected: 0, pending: 0 },
      { month: 'May', approved: 1, rejected: 0, pending: 0 },
      { month: 'Jun', approved: 0, rejected: 0, pending: 1 },
    ],
  };

  return NextResponse.json(data);
}

