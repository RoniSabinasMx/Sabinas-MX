/**
 * Run this once to seed Supabase.
 * Usage (from the Sabinas project folder):
 *   node DOCS/seed_supabase.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Config — loaded from config/config.js values
const SUPABASE_URL = 'https://ejtxpkmrsqcdekyckked.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Hi48LWIGQP1XVFIpqkBKRw_j3AEJG1U';

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const __dir = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dir, 'supabase_migration.sql'), 'utf8');

const { error } = await db.rpc('exec_sql', { query: sql }).catch(e => ({ error: e }));
if (error) {
    console.error('Migration error:', error.message || error);
    process.exit(1);
}
console.log('✅ Migration applied successfully');
