const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Reliable connection test
async function verifyConnection() {
  try {
    // Simple RPC call that always works
    const { data, error } = await supabase.rpc("now");

    if (error) throw error;
    console.log("✅ Connected to Supabase");
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    return false;
  }
}

// Verify connection
verifyConnection();

module.exports = { supabase };
