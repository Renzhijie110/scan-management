import postgres from 'postgres';
import { NextResponse } from 'next/server';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: Request) {
  try {
    const {pallet_group_id,boxId,date,sw,dw} = await request.json();
    const id = `${pallet_group_id}_${boxId}`
    const pallet_cluster_id = `${date}_${sw}`
    await sql`
      INSERT INTO "Pallet" (id, pallet_group_id,box_id,date,start_warehouse,destination_warehouse,pallet_cluster_id)
      VALUES (${id},${pallet_group_id},${boxId},${date},${sw},${dw},${pallet_cluster_id})
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
