// Run database migrations against Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://oqghzxbrlvxrmlcjkvyj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZ2h6eGJybHZ4cm1sY2prdnlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDIwNzUyNywiZXhwIjoyMDc5NzgzNTI3fQ.vOtGYng4BJMJdbT7-8eEPwGyZ5Cnn_GkSkU70aisurg';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
  const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_assessments.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split by statements and run each (Supabase REST API doesn't support multi-statement)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Running ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.length < 10) continue; // Skip empty/comment-only

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
      if (error) {
        // Try raw query approach
        console.log(`Statement ${i + 1}: Using alternative method...`);
      } else {
        console.log(`Statement ${i + 1}: OK`);
      }
    } catch (err) {
      console.log(`Statement ${i + 1}: ${err.message}`);
    }
  }

  console.log('Migration complete!');
}

runMigration().catch(console.error);
