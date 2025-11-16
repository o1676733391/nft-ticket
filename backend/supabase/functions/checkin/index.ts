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
      case 'validate':
        return await validateTicket(req, supabaseClient)
      case 'confirm':
        return await confirmCheckin(req, supabaseClient)
      case 'getLogs':
        return await getCheckinLogs(req, supabaseClient)
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

async function validateTicket(req: Request, supabase: any) {
  const { qrHash } = await req.json()

  // Get ticket by QR hash
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      ticket_templates(*),
      events(*)
    `)
    .eq('qr_hash', qrHash)
    .single()

  if (error || !ticket) {
    return new Response(
      JSON.stringify({
        success: false,
        valid: false,
        message: 'Invalid QR code',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if already checked in
  if (ticket.is_checked_in) {
    return new Response(
      JSON.stringify({
        success: false,
        valid: false,
        message: 'Ticket already checked in',
        checkedInAt: ticket.checked_in_at,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if event is active
  const now = new Date()
  const eventStart = new Date(ticket.events.start_date)
  const eventEnd = new Date(ticket.events.end_date)

  if (now < eventStart) {
    return new Response(
      JSON.stringify({
        success: false,
        valid: false,
        message: 'Event has not started yet',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (now > eventEnd) {
    return new Response(
      JSON.stringify({
        success: false,
        valid: false,
        message: 'Event has ended',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if ticket is burned or cancelled
  if (ticket.status === 'burned' || ticket.status === 'cancelled') {
    return new Response(
      JSON.stringify({
        success: false,
        valid: false,
        message: `Ticket is ${ticket.status}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Ticket is valid
  return new Response(
    JSON.stringify({
      success: true,
      valid: true,
      ticket: {
        tokenId: ticket.token_id,
        owner: ticket.owner_wallet,
        ticketName: ticket.ticket_templates.name,
        eventName: ticket.events.title,
        tier: ticket.ticket_templates.tier,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function confirmCheckin(req: Request, supabase: any) {
  const { qrHash, scannedBy, deviceInfo, locationInfo } = await req.json()

  // Get ticket
  const { data: ticket } = await supabase
    .from('tickets')
    .select('*')
    .eq('qr_hash', qrHash)
    .single()

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  if (ticket.is_checked_in) {
    throw new Error('Ticket already checked in')
  }

  // Update ticket
  const { data: updatedTicket, error: updateError } = await supabase
    .from('tickets')
    .update({
      is_checked_in: true,
      checked_in_at: new Date().toISOString(),
      checked_in_by: scannedBy,
    })
    .eq('id', ticket.id)
    .select()
    .single()

  if (updateError) throw updateError

  // Create check-in log
  const { data: log, error: logError } = await supabase
    .from('checkin_logs')
    .insert([{
      ticket_id: ticket.id,
      token_id: ticket.token_id,
      event_id: ticket.event_id,
      scanned_by: scannedBy,
      device_info: deviceInfo,
      location_info: locationInfo,
    }])
    .select()
    .single()

  if (logError) throw logError

  return new Response(
    JSON.stringify({
      success: true,
      ticket: updatedTicket,
      log,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getCheckinLogs(req: Request, supabase: any) {
  const { eventId, page = 1, limit = 50 } = await req.json()
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('checkin_logs')
    .select(`
      *,
      tickets(token_id, owner_wallet, ticket_templates(name)),
      users(username, avatar_url)
    `, { count: 'exact' })
    .eq('event_id', eventId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return new Response(
    JSON.stringify({
      success: true,
      logs: data,
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
