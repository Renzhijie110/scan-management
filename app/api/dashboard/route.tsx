import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    const dashboard = await sql`
      SELECT
        p.date,
        p.start_warehouse,
        p.destination_warehouse,
        COUNT(*) AS total_pallet_count,
        COUNT(p.scan_time) AS scan_pallet_count,
        COUNT(*) - COUNT(p.scan_time) AS unscanned_count,
        pc.comment
      FROM "Pallet_Cluster" pc
      LEFT JOIN "Pallet" p ON p.pallet_group_id = pc.id
      GROUP BY pc.id,p.date,p.start_warehouse,p.destination_warehouse, pc.comment
      ORDER BY p.date DESC;
    `;
    
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
} 