export interface Ticket {
    id: number
    order_item_id: number
    event_id: number
    ticket_code?: string
    created_at: string
    issued_to_email?: string
    checked_in_at?: string
}