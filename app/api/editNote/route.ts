import postgres from 'postgres';
import { NextResponse } from 'next/server';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: Request) {
  try {
    const {item,comment} = await request.json();
    const id = `${item.date}_${item.start_warehouse}_${item.destination_warehouse}`

    await sql`
    UPDATE "Pallet_Group"
    SET comment = ${comment}
    WHERE id = ${id}
  `;

    return NextResponse.json({ id });
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
