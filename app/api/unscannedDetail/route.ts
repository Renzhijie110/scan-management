import postgres from 'postgres';
import { NextResponse } from 'next/server';

// 使用 SSL 安全连接到数据库
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const start_warehouse = searchParams.get('start_warehouse');

    const pallet_cluster_id = `${date}_${start_warehouse}`

    const boxes = await sql`
      SELECT * FROM "Pallet"
      WHERE "pallet_cluster_id" = ${pallet_cluster_id}
    `;

    return NextResponse.json({ boxes });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch box info', message: error },
      { status: 500 }
    );
  }
}
