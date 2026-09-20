import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const headers = ['id', 'createdAt', 'occurredAt', 'mode', 'line', 'station', 'direction', 'vehicleContext', 'category', 'subcategory', 'severity', 'status', 'lat', 'lng'] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    const reports = await prisma.report.findMany({
      include: {
        category: true,
        subcategory: true,
        station: true,
        line: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Sanitize data for public export (remove tokens, precise sensitive locations etc if needed)
    const sanitizedReports = reports.map(r => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      occurredAt: r.occurredAt.toISOString(),
      mode: r.mode,
      line: r.line?.name || null,
      station: r.station?.name || null,
      direction: r.direction,
      vehicleContext: r.vehicleContext,
      category: r.category.titleFa,
      subcategory: r.subcategory.titleFa,
      severity: r.severity,
      status: r.status,
      // For sensitive categories, we don't expose exact lat/lng
      lat: r.subcategory.isSensitive ? null : r.lat,
      lng: r.subcategory.isSensitive ? null : r.lng,
    }));

    if (format === 'csv') {
      const csvRows = [headers.join(',')];
      
      for (const report of sanitizedReports) {
        const values = headers.map(header => {
          const val = report[header];
          if (val === null || val === undefined) return '';
          // Escape quotes and wrap in quotes if contains comma
          const strVal = String(val).replace(/"/g, '""');
          return strVal.includes(',') || strVal.includes('\n') ? `"${strVal}"` : strVal;
        });
        csvRows.push(values.join(','));
      }
      
      const csvString = csvRows.join('\n');
      
      return new NextResponse(csvString, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="reports_export.csv"',
        },
      });
    }

    // Default to JSON
    return new NextResponse(JSON.stringify(sanitizedReports, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="reports_export.json"',
      },
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
