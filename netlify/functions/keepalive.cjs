// Netlify Serverless Function for Supabase Database Keep-Alive
// Prevents Supabase project from pausing due to inactivity ("matb9ach tfa")

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tqmpphasiqzacuzrvtny.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qv4PgnVzgCHC_z0HN8ATJQ_Lvg67qE7';

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };

  try {
    const timestamp = new Date().toISOString();
    
    // 1. Perform a read query to keep database pool active
    const readRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const isReadOk = readRes.ok;

    // 2. Perform write / upsert to heartbeat table if present
    let writeStatus = 'skipped';
    try {
      const writeRes = await fetch(`${SUPABASE_URL}/rest/v1/heartbeat`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: 'keep_alive_ping',
          pinged_at: timestamp,
          source: 'netlify_keepalive'
        })
      });
      writeStatus = writeRes.status;
    } catch (e) {
      writeStatus = e.message;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'alive',
        message: 'Supabase traffic keep-alive executed successfully',
        timestamp,
        readStatus: readRes.status,
        writeStatus
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        error: error.message
      })
    };
  }
};
