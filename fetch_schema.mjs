import fs from 'fs';

const SUPABASE_URL = 'https://pndkqnnsxjpjvxufrdav.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZGtxbm5zeGpwanZ4dWZyZGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjM3MDQsImV4cCI6MjEwMTkzOTcwNH0.jg8WjUv2q6rw3icJH4vTlz4tMLc7simaaVbW6_WWDHo';

async function fetchSchema() {
  console.log('Fetching OpenAPI spec from Supabase...');
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${await res.text()}`);
    }
    
    const data = await res.json();
    
    let output = '# LIVE SCHEMA AUDIT (Partial - REST API)\n\n';
    output += '> Note: This audit was generated using the Supabase REST API because the direct PostgreSQL connection string was not provided. It accurately reflects tables, columns, and foreign keys. RLS Policies, Triggers, and Function Bodies are hidden by the REST API for security.\n\n';
    
    const definitions = data.definitions || {};
    
    if (Object.keys(definitions).length === 0) {
      output += '## WARNING: NO TABLES FOUND!\n';
      output += 'The REST API returned 0 tables. This could mean the database is completely empty, or the tables are not exposed to the public schema/REST API.\n\n';
    }
    
    for (const [tableName, definition] of Object.entries(definitions)) {
      output += `## Table: ${tableName}\n`;
      
      const properties = definition.properties || {};
      const required = definition.required || [];
      
      output += '| Column | Type | Nullable | Default | Description |\n';
      output += '|---|---|---|---|---|\n';
      
      for (const [colName, colDef] of Object.entries(properties)) {
        const isNullable = !required.includes(colName);
        const type = colDef.type || colDef.format || 'unknown';
        const defaultVal = colDef.default !== undefined ? colDef.default : 'none';
        const desc = colDef.description || '';
        
        output += `| ${colName} | ${type} | ${isNullable} | ${defaultVal} | ${desc} |\n`;
      }
      output += '\n';
    }
    
    fs.writeFileSync('D:\\Froster-gym\\LIVE_SCHEMA_AUDIT.md', output);
    console.log(`Successfully generated LIVE_SCHEMA_AUDIT.md with ${Object.keys(definitions).length} tables.`);
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

fetchSchema();
