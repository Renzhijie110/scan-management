import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })
// Create a new box
export async function createBox(box_id: string, qr_code: string, user_id: string) {
  await sql`
    INSERT INTO "boxes" (box_id, qr_code, user_id)
    VALUES (${box_id}, ${qr_code}, ${user_id})
    ON CONFLICT (box_id, user_id) DO NOTHING;
  `;
}


