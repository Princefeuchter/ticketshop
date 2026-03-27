import {v4 as uuidv4} from 'uuid';
import { serverSupabaseClient } from '#supabase/server';
import { Ticket } from '~~/shared/types/ticket';

function generateQRCodeId() {
    return uuidv4();
}

async function createTicket(event: any, ticket: Ticket) {
    const qrCodeId = generateQRCodeId();

    const db =  await serverSupabaseClient(event);
    
    const { data, error } = await db.from('tickets').insert({
        order_item_id: ticket.order_item_id,
        event_id: ticket.event_id,
        ticket_code: qrCodeId,
        issued_to_email: ticket.issued_to_email,
        created_at: ticket.created_at,
    }).select().single();

    if (error) {
        console.error('Error creating ticket:', error);
        throw createError({
            statusCode: 500,
            message: 'Fehler beim Erstellen des Tickets'
        });
    }

    return data;
}
