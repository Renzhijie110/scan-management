import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function PUT(request: NextRequest, context: { params: { date: any } }) {
  try {
    const { note } = await request.json();
    const { date } = await context.params; // ⚠️ 这里需要 await

    if (!date || note === undefined) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    await sql`
      INSERT INTO notes_by_date (date, note)
      VALUES (${date}, ${note})
      ON CONFLICT (date) DO UPDATE SET note = EXCLUDED.note
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
