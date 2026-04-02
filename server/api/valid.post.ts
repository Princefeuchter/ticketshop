import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { id } = await readBody<{ id?: string }>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Ticket ID fehlt',
    })
  }

  const db = await serverSupabaseClient(event)
  const { data: ticket, error } = await db
    .from('tickets')
    .select('id, ticket_code, checked_in_at')
    .eq('ticket_code', id)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Abrufen der Tickets'
    })
  }

  if (!ticket) {
    return { valid: false }
  }

  if (ticket.checked_in_at) {
    throw createError({
      statusCode: 409,
      message: 'Ticket wurde bereits validiert',
      data: {
        checkedInAt: ticket.checked_in_at,
      },
    })
  }

  const checkedInAt = new Date().toISOString()
  const { error: updateError } = await db
    .from('tickets')
    .update({ checked_in_at: checkedInAt })
    .eq('id', ticket.id)

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: 'Ticket konnte nicht als eingecheckt markiert werden',
    })
  }

  return {
    valid: true,
    checkedInAt,
  }
})
