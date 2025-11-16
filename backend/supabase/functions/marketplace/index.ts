import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      case 'list':
        return await listTicket(req, supabaseClient)
      case 'unlist':
        return await unlistTicket(req, supabaseClient)
      case 'buy':
        return await buyTicket(req, supabaseClient)
      case 'getListings':
        return await getListings(req, supabaseClient)
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

async function listTicket(req: Request, supabase: any) {
  const { ticketId, tokenId, sellerWallet, priceToken, txHash } = await req.json()

  // Update ticket status
  await supabase
    .from('tickets')
    .update({ status: 'listed' })
    .eq('id', ticketId)

  // Create listing
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert([{
      ticket_id: ticketId,
      token_id: tokenId,
      seller_wallet: sellerWallet.toLowerCase(),
      price_token: priceToken,
      tx_hash: txHash,
      status: 'active',
    }])
    .select()
    .single()

  if (error) throw error

  // Record transaction
  await supabase
    .from('transactions')
    .insert([{
      ticket_id: ticketId,
      token_id: tokenId,
      type: 'list',
      from_wallet: sellerWallet.toLowerCase(),
      price_token: priceToken,
      tx_hash: txHash,
    }])

  return new Response(
    JSON.stringify({ success: true, listing: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function unlistTicket(req: Request, supabase: any) {
  const { listingId, txHash } = await req.json()

  // Get listing
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select('*, tickets(*)')
    .eq('id', listingId)
    .single()

  // Update listing status
  const { data, error } = await supabase
    .from('marketplace_listings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', listingId)
    .select()
    .single()

  if (error) throw error

  // Update ticket status
  await supabase
    .from('tickets')
    .update({ status: 'minted' })
    .eq('id', listing.ticket_id)

  // Record transaction
  await supabase
    .from('transactions')
    .insert([{
      ticket_id: listing.ticket_id,
      token_id: listing.token_id,
      type: 'unlist',
      from_wallet: listing.seller_wallet,
      tx_hash: txHash,
    }])

  return new Response(
    JSON.stringify({ success: true, listing: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function buyTicket(req: Request, supabase: any) {
  const { listingId, buyerWallet, txHash } = await req.json()

  // Get listing
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select('*, tickets(*)')
    .eq('id', listingId)
    .single()

  if (!listing || listing.status !== 'active') {
    throw new Error('Listing not available')
  }

  // Update listing status
  await supabase
    .from('marketplace_listings')
    .update({
      status: 'sold',
      buyer_wallet: buyerWallet.toLowerCase(),
      sold_at: new Date().toISOString(),
    })
    .eq('id', listingId)

  // Update ticket owner and status
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .update({
      owner_wallet: buyerWallet.toLowerCase(),
      status: 'sold',
    })
    .eq('id', listing.ticket_id)
    .select()
    .single()

  if (ticketError) throw ticketError

  // Record transaction
  await supabase
    .from('transactions')
    .insert([{
      ticket_id: listing.ticket_id,
      token_id: listing.token_id,
      type: 'sale',
      from_wallet: listing.seller_wallet,
      to_wallet: buyerWallet.toLowerCase(),
      price_token: listing.price_token,
      tx_hash: txHash,
    }])

  // Update event analytics
  await supabase.rpc('update_event_secondary_sale', {
    event_id: ticket.event_id,
    amount: listing.price_token,
  })

  return new Response(
    JSON.stringify({ success: true, ticket }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getListings(req: Request, supabase: any) {
  const url = new URL(req.url)
  const eventId = url.searchParams.get('eventId')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  let query = supabase
    .from('marketplace_full')
    .select('*', { count: 'exact' })
    .order('listed_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (eventId) {
    query = query.eq('event_id', eventId)
  }

  const { data, error, count } = await query

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      listings: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
