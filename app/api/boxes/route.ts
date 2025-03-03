import postgres from 'postgres';
import { createBox } from '@/lib/api';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: Request) {
  try {
    const { box_id, qr_code } = await request.json();
    
    await createBox(box_id, qr_code);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create box' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const boxes = await sql`
      SELECT 
        b.box_id,
        b.created_at,
        MAX(CASE WHEN sr.scan_type = 'sorting' THEN sr.scan_time END) as sorting_time,
        MAX(CASE WHEN sr.scan_type = 'driver' THEN sr.scan_time END) as driver_time
      FROM boxes b
      LEFT JOIN scan_records sr ON b.box_id = sr.box_id
      GROUP BY b.box_id, b.created_at
      ORDER BY b.created_at DESC
    `;
    
    return NextResponse.json(boxes);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boxes' },
      { status: 500 }
    );
  }
} 