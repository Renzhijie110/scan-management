import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: Request) {
  try {
    const { box_id } = await request.json();

    // 检查 box 是否存在
    const box = await sql`
      SELECT box_id FROM boxes WHERE box_id = ${box_id}
    `;

    if (!box.length) {
      return NextResponse.json(
        { error: '物品不存在' },
        { status: 404 }
      );
    }

    // 插入或更新分拣扫描记录
    await sql`
      INSERT INTO scan_records (box_id, scan_type, scan_time)
      VALUES (${box_id}, 'sorting', CURRENT_TIMESTAMP)
      ON CONFLICT (box_id, scan_type) 
      DO UPDATE SET scan_time = CURRENT_TIMESTAMP
      WHERE scan_records.scan_type = 'sorting';
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '扫描失败' },
      { status: 500 }
    );
  }
} 