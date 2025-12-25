import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// Create postgres connection
const client = postgres(connectionString)

// Create drizzle instance with schema
export const db = drizzle(client, { schema })
