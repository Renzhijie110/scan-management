import postgres from 'postgres';
import { NextResponse } from 'next/server';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseInput = searchParams.get('warehouseInput');
    const start_warehouse = searchParams.get('start_warehouse');
    if (!warehouseInput) {
      return NextResponse.json({ error: 'Missing warehouseInput' }, { status: 400 });
    }

    const list = await sql`
      SELECT DISTINCT w.id, c.name, c.start_warehouse
      FROM "Warehouse" w
      LEFT JOIN "Center_Warehouse" c ON w.belong_to = c.id
      WHERE w.belong_to = ${warehouseInput} AND c.start_warehouse = ${start_warehouse};
    `;
    return NextResponse.json({ list });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch box info', message: error },
      { status: 500 }
    );
  }
}
