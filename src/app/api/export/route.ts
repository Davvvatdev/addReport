import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const headers = ['id', 'createdAt', 'occurredAt', 'mode', 'line', 'station', 'direction', 'vehicleContext', 'category', 'subcategory', 'severity', 'impact', 'status', 'lat', 'lng'] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    // گزارش‌های حساس به‌صورت موردی منتشر نمی‌شوند (ایستگاه + زمان دقیق می‌تواند گزارش‌دهنده را لو دهد)
    const reports = await prisma.report.findMany({
      where: { subcategory: { isSensitive: false } },
      include: {
        category: true,
        subcategory: true,
        station: true,
        line: true,
      },
      orderBy: { createdAt: 'desc' }
    });

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
      impact: r.impact,
      status: r.status,
      lat: r.lat,
      lng: r.lng,
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
