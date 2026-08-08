import fs from 'fs';

let envStr = '';
try {
  envStr = fs.readFileSync('.env.local', 'utf8');
} catch (e) {
  envStr = fs.readFileSync('.env', 'utf8');
}

const url = envStr.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envStr.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const tables = ['workspace_config', 'landing_config', 'gallery_items'];

Promise.all(tables.map(async t => {
  const res = await fetch(`${url}/rest/v1/${t}?limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log(`Table: ${t} - Status: ${res.status} ${res.statusText}`);
}));
