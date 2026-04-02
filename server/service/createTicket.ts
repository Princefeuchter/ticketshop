import {v4 as uuidv4} from 'uuid';
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';

function generateQRCodeId() {
    return uuidv4();
}

type CreateTicketInput = {
    order_item_id: number
    event_id: number
    created_at: string
    issued_to_email?: string
    user_id?: number
}

export async function createTicket(event: any, ticket: CreateTicketInput) {
    const qrCodeId = generateQRCodeId();

    let db;
    try {
        db = await serverSupabaseServiceRole(event);
    } catch {
        db = await serverSupabaseClient(event);
    }
    
    const { data, error } = await db.from('tickets').insert({
        order_item_id: ticket.order_item_id,
        event_id: ticket.event_id,
        ticket_code: qrCodeId,
        issued_to_email: ticket.issued_to_email,
        created_at: ticket.created_at,
        user_id: ticket.user_id,
    }).select().single();

    if (error) {
        const code = (error as { code?: string }).code || null;

        // If another request already created the ticket for this checkout session,
        // return the existing row instead of failing the payment finalization.
        if (code === '23505') {
            const existingQuery = db
                .from('tickets')
                .select('*')
                .eq('order_item_id', ticket.order_item_id);

            if (typeof ticket.user_id === 'number') {
                existingQuery.eq('user_id', ticket.user_id);
            }

            const { data: existingTicket, error: existingError } = await existingQuery.maybeSingle();

            if (!existingError && existingTicket) {
                return existingTicket;
            }
        }

        console.error('Error creating ticket:', error);
        throw createError({
            statusCode: 500,
            message: 'Fehler beim Erstellen des Tickets',
            data: {
                details: error.message,
                code,
            },
        });
    }

    return data;
}
