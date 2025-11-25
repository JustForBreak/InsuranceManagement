// src/app/api/documents/download/route.ts
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // e.g., "5-contract"

  if (!id) {
    return new NextResponse('Missing document ID', { status: 400 });
  }

  const [policyId, docType] = id.split('-');

  // Get user from cookie (same as your other routes)
  const cookieHeader = request.headers.get('cookie');
  const userCookie = cookieHeader?.match(/user=([^;]+)/)?.[1];
  if (!userCookie) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let user;
  try {
    user = JSON.parse(decodeURIComponent(userCookie));
  } catch {
    return new NextResponse('Invalid cookie', { status: 401 });
  }

  try {
    // Fetch policy
    const result = await pool.query(
      'SELECT * FROM policies WHERE id = $1 AND user_id = $2',
      [policyId, user.id]
    );

    if (result.rows.length === 0) {
      return new NextResponse('Policy not found', { status: 404 });
    }

    const policy = result.rows[0];

    // Create new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const drawText = (text: string, x: number, y: number, size = 12, isBold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0),
      });
    };

    // Header
    drawText('INSURANCE POLICY DOCUMENT', 50, height - 50, 24, true);
    drawText(`Generated: ${new Date().toLocaleDateString()}`, 50, height - 80, 10);

    // Policyholder
    drawText('Policyholder Information', 50, height - 130, 16, true);
    drawText(`Name: ${user.name || 'Customer'}`, 50, height - 160);
    drawText(`Email: ${user.email || 'N/A'}`, 50, height - 180);

    // Policy Details
    drawText('Policy Details', 50, height - 230, 16, true);
    drawText(`Policy Number: ${policy.policy_number}`, 50, height - 260);
    drawText(`Type: ${policy.type.toUpperCase()} Insurance`, 50, height - 280);
    drawText(`Coverage Amount: $${Number(policy.coverage_amount).toLocaleString()}`, 50, height - 300);
    drawText(`Annual Premium: $${Number(policy.premium).toFixed(2)}`, 50, height - 320);
    drawText(`Effective: ${new Date(policy.start_date).toLocaleDateString()}`, 50, height - 340);
    drawText(`Expires: ${new Date(policy.end_date).toLocaleDateString()}`, 50, height - 360);

    // Document type title
    const title = docType === 'contract' ? 'POLICY CONTRACT' :
                  docType === 'idcard' ? 'DIGITAL ID CARD' : 'PAYMENT RECEIPT';
    drawText(title, 50, height - 420, 18, true);

    drawText('This document serves as proof of active insurance coverage.', 50, height - 460, 10);
    drawText('For questions: support@yourinsurance.com', 50, height - 500, 10);

    // Generate PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${policy.policy_number} - ${title}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Error:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}