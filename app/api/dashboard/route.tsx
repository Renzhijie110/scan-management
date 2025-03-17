import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    const dashboard = await sql`
      SELECT
          LEFT(b.box_id, 6) AS date,  
          u.warehouse AS orig_warehouse,
          SUBSTRING(b.box_id FROM 7 FOR 4) AS dest_warehouse,  
          COUNT(CASE WHEN sr.scan_type = 'sorting' THEN sr.box_id END) AS sorting_count,  
          COUNT(CASE WHEN sr.scan_type = 'driver' THEN sr.box_id END) AS driver_count,
          nd.note
      FROM boxes b  
      LEFT JOIN users u ON b.user_id = u.user_id  
      LEFT JOIN scan_records sr ON b.box_id = sr.box_id  
      LEFT JOIN notes_by_date nd ON LEFT(b.box_id, 6) = nd.date
      GROUP BY 
          LEFT(b.box_id, 6), 
          SUBSTRING(b.box_id FROM 7 FOR 4), 
          u.warehouse, 
          nd.note
      ORDER BY date DESC;
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