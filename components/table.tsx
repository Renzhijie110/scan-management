import postgres from 'postgres'
import RefreshButton from './refresh-button'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export default async function Table() {
  let data
  let startTime = Date.now()
  try {
    data = await sql`SELECT * FROM boxes`
  } catch (e: any) {
    if (e.message.includes('relation "boxes" does not exist')) {
      console.log(
        'Table does not exist, creating and seeding it with dummy data now...'
      )
      // Table is not created yet
      startTime = Date.now()
      data = await sql`SELECT * FROM boxes`
    } else {
      throw e
    }
  }

  const boxes = data
  const duration = Date.now() - startTime

  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Recent Boxes</h2>
          <p className="text-sm text-gray-500">
            Fetched {boxes.length} boxes in {duration}ms
          </p>
        </div>
        <RefreshButton />
      </div>
      <div className="divide-y divide-gray-900/5">
        {boxes.map((user) => (
          <div
            key={user.box_id}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <p className="font-medium leading-none">{user.box_id}</p>
                <p className="text-sm text-gray-500">{user.box_id}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {user.created_at ? new Date(user.created_at).toLocaleString() : 'Date not available'}
            </p>

          </div>
        ))}
      </div>
    </div>
  )
}
