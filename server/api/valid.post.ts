import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {

  const { id } = await readBody(event);

  const db = await serverSupabaseClient(event);
  const { data, error } = await db.from('tickets').select('*');

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Abrufen der Tickets'
    })
  }

  if(data.find(ticket => ticket.id === id)) {
    return { valid: true }
  } else {
    return { valid: false }
  }
})
