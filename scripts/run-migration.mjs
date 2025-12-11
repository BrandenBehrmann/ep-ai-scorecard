// Direct PostgreSQL migration using pg module
import pg from 'pg';
const { Client } = pg;

// Supabase direct connection
// Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
const connectionString = `postgresql://postgres.oqghzxbrlvxrmlcjkvyj:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function runMigration() {
  console.log('Connecting to Supabase PostgreSQL...');

  // We need the database password - let's try the service role key approach instead
  // Using Supabase's PostgREST endpoint to call a migration function

  const supabaseUrl = 'https://oqghzxbrlvxrmlcjkvyj.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZ2h6eGJybHZ4cm1sY2prdnlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDIwNzUyNywiZXhwIjoyMDc5NzgzNTI3fQ.vOtGYng4BJMJdbT7-8eEPwGyZ5Cnn_GkSkU70aisurg';

  // Try using the Supabase SQL API (if available)
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `ALTER TABLE assessments ADD COLUMN IF NOT EXISTS insights JSONB DEFAULT NULL;`
    })
  });

  const result = await response.text();
  console.log('Response:', response.status, result);
}

runMigration().catch(console.error);
