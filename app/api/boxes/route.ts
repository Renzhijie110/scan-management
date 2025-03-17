import postgres from 'postgres';
import { createBox } from '@/lib/api';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: Request) {
  try {
    const { box_id, qr_code, user_id } = await request.json();
    console.log('Received data:', { box_id, qr_code, user_id });

    // Calling the createBox function
    await createBox(box_id, qr_code, user_id);

    console.log('Box created successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log the full error for debugging
    console.error('Error:', error);

    // Returning a 500 error response with the message
    return NextResponse.json(
      { error: 'Failed to create box', message: error},
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
        b.user_id,
        u.warehouse,
        MAX(CASE WHEN sr.scan_type = 'sorting' THEN sr.scan_time END) as sorting_time,
        MAX(CASE WHEN sr.scan_type = 'driver' THEN sr.scan_time END) as driver_time
      FROM boxes b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN scan_records sr ON b.box_id = sr.box_id
      GROUP BY b.box_id, b.created_at, b.user_id, u.warehouse
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