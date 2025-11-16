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
      case 'create':
        return await createEvent(req, supabaseClient)
      case 'list':
        return await listEvents(req, supabaseClient)
      case 'get':
        return await getEvent(req, supabaseClient)
      case 'update':
        return await updateEvent(req, supabaseClient)
      case 'createTemplate':
        return await createTicketTemplate(req, supabaseClient)
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

async function createEvent(req: Request, supabase: any) {
  const {
    organizerId,
    title,
    description,
    location,
    venueName,
    bannerUrl,
    category,
    startDate,
    endDate,
    royaltyFee,
  } = await req.json()

  const { data, error } = await supabase
    .from('events')
    .insert([{
      organizer_id: organizerId,
      title,
      description,
      location,
      venue_name: venueName,
      banner_url: bannerUrl,
      category,
      start_date: startDate,
      end_date: endDate,
      royalty_fee: royaltyFee || 0,
    }])
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, event: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function listEvents(req: Request, supabase: any) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const search = url.searchParams.get('search')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  let query = supabase
    .from('events')
    .select('*, users!events_organizer_id_fkey(username, avatar_url)', { count: 'exact' })
    .eq('is_published', true)
    .order('start_date', { ascending: true })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.textSearch('search_vector', search)
  }

  const { data, error, count } = await query

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      events: data,
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

async function getEvent(req: Request, supabase: any) {
  const { eventId } = await req.json()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      users!events_organizer_id_fkey(username, avatar_url, wallet_address),
      ticket_templates(*)
    `)
    .eq('id', eventId)
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, event: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateEvent(req: Request, supabase: any) {
  const { eventId, updates } = await req.json()

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, event: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createTicketTemplate(req: Request, supabase: any) {
  const {
    eventId,
    name,
    description,
    priceToken,
    supply,
    tier,
    royaltyFee,
    benefits,
    isSoulbound,
    saleStartsAt,
    saleEndsAt,
  } = await req.json()

  const { data, error } = await supabase
    .from('ticket_templates')
    .insert([{
      event_id: eventId,
      name,
      description,
      price_token: priceToken,
      supply,
      tier: tier || 1,
      royalty_fee: royaltyFee || 0,
      benefits,
      is_soulbound: isSoulbound || false,
      sale_starts_at: saleStartsAt,
      sale_ends_at: saleEndsAt,
    }])
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, template: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
