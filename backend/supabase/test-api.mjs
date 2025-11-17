// Simple script to test the ticket-manager Supabase Edge Function
// To run: node test-api.mjs

// --- ⚠️ ACTION REQUIRED: Please fill in these values before running ---
const EVENT_ID = "1"; // The ID of an event in your 'events' table
const USER_WALLET = "YOUR_WALLET_ADDRESS"; // The wallet address to mint the ticket to
// --------------------------------------------------------------------


// --- Configuration (already filled in) ---
const SUPABASE_URL = "https://xuqswkwbgaoilulgllbu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cXN3a3diZ2FvaWx1bGdsbGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzg0MjksImV4cCI6MjA3ODg1NDQyOX0.F89y2I5j26jbP5af6sIMxEqu1WMzcEeyYGFJeEs9YQs";
const FUNCTION_NAME = "ticket-manager";


async function testTicketManager() {
  if (USER_WALLET === "YOUR_WALLET_ADDRESS" || !EVENT_ID) {
    console.error("❌ Error: Please fill in the EVENT_ID and USER_WALLET variables in this script before running.");
    return;
  }

  console.log(`🚀 Calling '${FUNCTION_NAME}' function...`);
  console.log(`   - Event ID: ${EVENT_ID}`);
  console.log(`   - User Wallet: ${USER_WALLET}`);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: EVENT_ID,
        user_wallet: USER_WALLET,
      }),
    });

    console.log(`\n✅ Response Status: ${response.status} ${response.statusText}`);

    const responseData = await response.json();
    console.log("\n📝 Response Body:");
    console.log(JSON.stringify(responseData, null, 2));

    if (response.ok) {
        console.log("\n🎉 Test successful! The transaction has been sent.");
        console.log("Check the indexer terminal for logs and your Supabase 'tickets' table for the new entry.");
    } else {
        console.error("\n🔥 Test failed. See the error message above.");
    }

  } catch (error) {
    console.error("\n❌ An error occurred while making the request:", error);
  }
}

testTicketManager();
