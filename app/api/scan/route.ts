import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: Request) {
  try {
    const { item_id } = await request.json();

    // 使用 PostgreSQL 内置的当前时间函数 NOW()
    await sql`
      UPDATE "Pallet"
      SET scan_time = NOW()
      WHERE id = ${item_id}
    `;

    return NextResponse.json({ id: item_id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update pallet', message: (error as Error).message || error },
      { status: 500 }
    );
  }
}
