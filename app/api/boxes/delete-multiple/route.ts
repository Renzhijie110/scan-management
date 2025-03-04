import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: NextRequest) {
  try {
    const { box_ids } = await request.json();

    if (!Array.isArray(box_ids) || box_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one Box ID is required' },
        { status: 400 }
      );
    }

    // 先删除 scan_records 表中的匹配记录
    await sql`
      DELETE FROM scan_records WHERE box_id = ANY(${box_ids})
    `;

    // 再删除 boxes 表中的匹配记录
    await sql`
      DELETE FROM boxes WHERE box_id = ANY(${box_ids})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete boxes' },
      { status: 500 }
    );
  }
}
