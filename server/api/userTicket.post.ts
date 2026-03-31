import { serverSupabaseClient } from '#supabase/server' 
import { Ticket } from '~~/shared/types/ticket';

export default defineEventHandler(async (event) => {
    const db = await serverSupabaseClient(event);
    const { userId } = await readBody(event);

    const { data, error } = await db.from('tickets').select('*').eq('user_id', userId);

    if (error) {
        console.error('Error fetching tickets:', error);
        throw createError({
            statusCode: 500,
            message: 'Fehler beim Abrufen der Tickets'
        })
    }

    const tickets: Ticket[] = [];

    data.forEach(element => {
        tickets.push(({
            id: element.id,
            order_item_id: element.order_item_id,
            event_id: element.event_id,
            ticket_code: element.ticket_code,
            created_at: element.created_at,
            issued_to_email: element.issued_to_email,
            checked_in_at: element.checked_in_at
        }))
    });

    return tickets;

})
