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


// Read a box by ID
export async function getBox(box_id: string) {
  const box = await sql`
    SELECT * FROM Boxes WHERE box_id = ${box_id};
  `;
  return box[0];
}

// Update a box's QR code
export async function updateBox(box_id: string, qr_code: string) {
  await sql`
    UPDATE Boxes SET qr_code = ${qr_code} WHERE box_id = ${box_id};
  `;
}

// Delete a box by ID
export async function deleteBox(box_id: string) {
  await sql`
    DELETE FROM Boxes WHERE box_id = ${box_id};
  `;
}

// Create a new scan record
export async function createScanRecord(box_id: string, scan_type: string, scanned_by: string) {
  await sql`
    INSERT INTO Scan_Records (box_id, scan_type, scanned_by)
    VALUES (${box_id}, ${scan_type}, ${scanned_by});
  `;
}

// Read scan records by box ID
export async function getScanRecords(box_id: string) {
  const records = await sql`
    SELECT * FROM Scan_Records WHERE box_id = ${box_id};
  `;
  return records;
}

// Update a scan record by ID
export async function updateScanRecord(scan_id: number, scan_type: string, scanned_by: string) {
  await sql`
    UPDATE Scan_Records SET scan_type = ${scan_type}, scanned_by = ${scanned_by} WHERE scan_id = ${scan_id};
  `;
}

// Delete a scan record by ID
export async function deleteScanRecord(scan_id: number) {
  await sql`
    DELETE FROM Scan_Records WHERE scan_id = ${scan_id};
  `;
}

// Update box timestamp
export async function updateBoxTimestamp(box_id: string) {
  await sql`
    UPDATE Boxes 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE box_id = ${box_id};
  `;
}

