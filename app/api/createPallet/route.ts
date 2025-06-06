import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: Request) {
  try {
    const { pallet_group_id, boxId, date, sw, dw } = await request.json();
    const id = `${pallet_group_id}_${boxId}`;
    const pallet_cluster_id = `${date}_${sw}`;

    // 先保证 Pallet_Cluster 里有对应记录，避免外键约束失败
    await sql`
      INSERT INTO "Pallet_Group" (id)
      VALUES (${pallet_group_id})
      ON CONFLICT (id) DO NOTHING
    `;

    // 再插入 Pallet 表
    await sql`
      INSERT INTO "Pallet" 
      (id, pallet_group_id, box_id, date, start_warehouse, destination_warehouse, pallet_cluster_id)
      VALUES 
      (${id}, ${pallet_group_id}, ${boxId}, ${date}, ${sw}, ${dw}, ${pallet_cluster_id})
    `;

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create box', message: error },
      { status: 500 }
    );
  }
}
