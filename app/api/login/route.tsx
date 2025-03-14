import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';


const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // 查询用户信息
    const users = await sql`
      SELECT * FROM users WHERE username = ${username}`
    ;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // 验证密码
    const passwordMatch = password === user.password ? true : false
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ warehouse: user.warehouse , user_id: user.user_id}, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}