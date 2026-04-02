import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const eventId = Number(config.stripeDefaultEventId || 1)

  let db = await serverSupabaseClient(event)

  const serviceRoleKey = process.env.NUXT_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || ''
  const canUseServiceRole = serviceRoleKey.length > 0
    && !serviceRoleKey.includes('your-service-role-key')
    && !serviceRoleKey.startsWith('sb_service_key_')

  if (canUseServiceRole) {
    try {
      db = await serverSupabaseServiceRole(event)
    }
    catch {
      // Fallback auf client role, falls service role nicht verfuegbar ist.
    }
  }

  const { data: eventRow, error } = await db
    .from('events')
    .select('id, capacity, tickets_sold, is_active')
    .eq('id', eventId)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Eventstatus konnte nicht geladen werden',
      data: error,
    })
  }

  if (!eventRow) {
    throw createError({
      statusCode: 404,
      message: 'Event nicht gefunden',
    })
  }

  return {
    id: Number(eventRow.id),
    capacity: Number(eventRow.capacity || 0),
    ticketsSold: Number(eventRow.tickets_sold || 0),
    isActive: eventRow.is_active === true || Number(eventRow.is_active) === 1,
  }
})