import postgres from 'postgres';
import { NextResponse } from 'next/server';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pallet_group_id = searchParams.get('pallet_group_id');
    if (!pallet_group_id) {
      return NextResponse.json({ error: 'Missing pallet_group_id' }, { status: 400 });
    }

    const boxes = await sql`
      SELECT * FROM "Pallet"
      WHERE "pallet_group_id" = ${pallet_group_id}
    `;
    return NextResponse.json({ length: boxes.length });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch box info', message: error },
      { status: 500 }
    );
  }
}
