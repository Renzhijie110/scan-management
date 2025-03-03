import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

type RouteContext = {
  params: {
    box_id: string;
  };
};

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const box_id = context.params.box_id;
    
    // 先删除 scan_records 表中的记录
    await sql`
      DELETE FROM scan_records WHERE box_id = ${box_id}
    `;
    
    // 再删除 boxes 表中的记录
    await sql`
      DELETE FROM boxes WHERE box_id = ${box_id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete box' },
      { status: 500 }
    );
  }
} 