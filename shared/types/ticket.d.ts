export interface Ticket {
    id: string
    order_item_id: string
    event_id: number
    ticket_code?: string
    created_at: string
    issued_to_email?: string
    checked_in_at?: string
    created_at: string
}