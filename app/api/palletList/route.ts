import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // e.g., 20250530
    
    // 用于 WHERE 条件时根据你的表结构去查，比如：
    const data = await sql`
      SELECT * FROM "Pallet"
      Where date = ${date}
      ORDER BY box_id DESC
    `;
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
} 