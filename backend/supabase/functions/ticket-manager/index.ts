import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action } = await req.json()

    switch (action) {
      case 'mint':
        return await mintTicket(req, supabaseClient)
      case 'getByOwner':
        return await getTicketsByOwner(req, supabaseClient)
      case 'getDetails':
        return await getTicketDetails(req, supabaseClient)
      case 'transfer':
        return await recordTransfer(req, supabaseClient)
      default:
        throw new Error('Invalid action')
    }
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

async function mintTicket(req: Request, supabase: any) {
  const {
    tokenId,
    templateId,
    eventId,
    ownerWallet,
    txHash,
    metadataUri,
  } = await req.json()

  // Generate QR code hash for check-in
  const qrHash = createHash('sha256')
    .update(`${tokenId}-${eventId}-${Date.now()}`)
    .digest('hex')

  // Generate QR code URL (you can use a QR service or generate on frontend)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrHash}`

  const { data, error } = await supabase
    .from('tickets')
    .insert([{
      token_id: tokenId,
      template_id: templateId,
      event_id: eventId,
      owner_wallet: ownerWallet.toLowerCase(),
      original_owner: ownerWallet.toLowerCase(),
      tx_hash: txHash,
      metadata_uri: metadataUri,
      qr_code_url: qrCodeUrl,
      qr_hash: qrHash,
      status: 'minted',
    }])
    .select()
    .single()

  if (error) throw error

  // Update template sold count
  await supabase.rpc('increment_template_sold', { template_id: templateId })

  // Update event total sold
  await supabase.rpc('increment_event_sold', { event_id: eventId })

  // Record transaction
  await supabase
    .from('transactions')
    .insert([{
      ticket_id: data.id,
      token_id: tokenId,
      type: 'mint',
      to_wallet: ownerWallet.toLowerCase(),
      tx_hash: txHash,
    }])

  return new Response(
    JSON.stringify({ success: true, ticket: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getTicketsByOwner(req: Request, supabase: any) {
  const { walletAddress } = await req.json()

  const { data, error } = await supabase
    .from('tickets_full')
    .select('*')
    .eq('owner_wallet', walletAddress.toLowerCase())
    .order('minted_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, tickets: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getTicketDetails(req: Request, supabase: any) {
  const { tokenId } = await req.json()

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      ticket_templates(*),
      events(*, users!events_organizer_id_fkey(username, avatar_url))
    `)
    .eq('token_id', tokenId)
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, ticket: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function recordTransfer(req: Request, supabase: any) {
  const { tokenId, fromWallet, toWallet, txHash } = await req.json()

  // Update ticket owner
  const { data: ticket, error: updateError } = await supabase
    .from('tickets')
    .update({
      owner_wallet: toWallet.toLowerCase(),
      status: 'transferred',
    })
    .eq('token_id', tokenId)
    .select()
    .single()

  if (updateError) throw updateError

  // Record transaction
  await supabase
    .from('transactions')
    .insert([{
      ticket_id: ticket.id,
      token_id: tokenId,
      type: 'transfer',
      from_wallet: fromWallet.toLowerCase(),
      to_wallet: toWallet.toLowerCase(),
      tx_hash: txHash,
    }])

  return new Response(
    JSON.stringify({ success: true, ticket }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
