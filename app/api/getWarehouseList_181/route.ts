import postgres from 'postgres';
import { NextResponse } from 'next/server';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseInput = searchParams.get('warehouseInput');
    if (!warehouseInput) {
      return NextResponse.json({ error: 'Missing warehouseInput' }, { status: 400 });
    }

    const list = await sql`
      SELECT w.id, c.name
      FROM "Warehouse_181" w
      LEFT JOIN "Center_Warehouse_181" c ON w.belong_to = c.id
      WHERE w.belong_to = ${warehouseInput};
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
