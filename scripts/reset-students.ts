import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log('Dropping attendance table...');
  await client.execute(`DROP TABLE IF EXISTS attendance;`);
  
  console.log('Dropping students table...');
  await client.execute(`DROP TABLE IF EXISTS students;`);

  console.log('Done!');
}

main().catch(console.error);
