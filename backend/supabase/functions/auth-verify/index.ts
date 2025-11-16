import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, signature, address } = await req.json()

    // Verify signature using Web3
    const { verifyMessage } = await import('https://esm.sh/ethers@6')
    const recoveredAddress = verifyMessage(message, signature)

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Invalid signature')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if user exists
    let { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .single()

    // Create user if not exists
    if (!user) {
      const { data: newUser, error: createError } = await supabaseClient
        .from('users')
        .insert([{ wallet_address: address.toLowerCase() }])
        .select()
        .single()

      if (createError) throw createError
      user = newUser
    }

    // Generate JWT token
    const token = await createSupabaseToken(user.id, supabaseClient)

    return new Response(
      JSON.stringify({
        success: true,
        user,
        token,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function createSupabaseToken(userId: string, supabase: any) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: `${userId}@temp.wallet`,
  })

  if (error) throw error
  return data
}
