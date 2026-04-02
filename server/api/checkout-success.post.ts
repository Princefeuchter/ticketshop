import Stripe from 'stripe'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { createTicket } from '~~/server/service/createTicket'

type CheckoutSuccessBody = {
  sessionId?: string
}

export default defineEventHandler(async (event) => {
  const userSession = await getUserSession(event)

  if (!userSession.user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Login required',
    })
  }

  const { sessionId } = (await readBody<CheckoutSuccessBody>(event).catch(() => ({} as CheckoutSuccessBody))) || {}

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Missing sessionId',
    })
  }

  const config = useRuntimeConfig(event)

  if (!config.stripeSecretKey) {
    throw createError({
      statusCode: 500,
      message: 'Stripe secret key is not configured',
    })
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  })

  let checkoutSession: Stripe.Checkout.Session
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    console.error('Stripe session retrieval failed', error)
    throw createError({
      statusCode: 400,
      message: 'Stripe session could not be verified',
    })
  }

  if (checkoutSession.payment_status !== 'paid') {
    throw createError({
      statusCode: 400,
      message: 'Payment is not completed',
    })
  }

  const stripeUserId = checkoutSession.metadata?.userId
  if (stripeUserId && stripeUserId !== String(userSession.user.id)) {
    throw createError({
      statusCode: 403,
      message: 'Session does not belong to current user',
    })
  }

  const metadataOrderItemId = Number(checkoutSession.metadata?.orderItemId)
  const fallbackOrderItemId = Number(config.stripeDefaultOrderItemId || 1)
  const orderItemId = Number.isInteger(metadataOrderItemId) && metadataOrderItemId > 0
    ? metadataOrderItemId
    : fallbackOrderItemId

  if (!Number.isInteger(orderItemId) || orderItemId <= 0) {
    throw createError({
      statusCode: 500,
      message: 'No valid order item id resolved for ticket creation',
    })
  }

  const serviceRoleKey = process.env.NUXT_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || ''
  const canUseServiceRole = serviceRoleKey.length > 0
    && !serviceRoleKey.includes('your-service-role-key')
    && !serviceRoleKey.startsWith('sb_service_key_')

  let db
  if (canUseServiceRole) {
    try {
      db = await serverSupabaseServiceRole(event)
    } catch {
      db = await serverSupabaseClient(event)
    }
  } else {
    db = await serverSupabaseClient(event)
  }

  const { data: existingTicket, error: existingError } = await db
    .from('tickets')
    .select('*')
    .eq('order_item_id', orderItemId)
    .eq('user_id', userSession.user.id)
    .maybeSingle()

  if (existingError) {
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Pruefen vorhandener Tickets',
    })
  }

  if (existingTicket) {
    return {
      created: false,
      ticket: existingTicket,
    }
  }

  const { data: orderItem, error: orderItemError } = await db
    .from('order_items')
    .select('id, event_id, order_id')
    .eq('id', orderItemId)
    .maybeSingle()

  if (orderItemError) {
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Abrufen der Bestellung',
    })
  }

  if (!orderItem) {
    throw createError({
      statusCode: 400,
      message: 'Order item not found for ticket creation',
    })
  }

  const { data: orderRow, error: orderError } = await db
    .from('orders')
    .select('id, user_id, status')
    .eq('id', orderItem.order_id)
    .maybeSingle()

  if (orderError) {
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Abrufen der Order',
    })
  }

  if (!orderRow) {
    throw createError({
      statusCode: 400,
      message: 'Order not found for ticket creation',
    })
  }

  if (Number(orderRow.user_id) !== Number(userSession.user.id)) {
    throw createError({
      statusCode: 403,
      message: 'Order does not belong to current user',
    })
  }

  if (String(orderRow.status) !== 'paid') {
    const { error: orderUpdateError } = await db
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderRow.id)

    if (orderUpdateError) {
      throw createError({
        statusCode: 500,
        message: 'Order status could not be updated to paid',
      })
    }
  }

  const eventId = Number(orderItem.event_id)

  let ticket
  try {
    ticket = await createTicket(event, {
    order_item_id: orderItemId,
      event_id: eventId,
      created_at: new Date().toISOString(),
      issued_to_email: checkoutSession.customer_details?.email || userSession.user.login || undefined,
      user_id: userSession.user.id,
    })
  } catch (error) {
    console.error('Ticket creation after payment failed', error)
    const errorWithData = error as { data?: { details?: string; code?: string | null }; message?: string }
    throw createError({
      statusCode: 500,
      message: 'Payment was successful but ticket creation failed',
      data: {
        details: errorWithData.data?.details || errorWithData.message || null,
        code: errorWithData.data?.code || null,
      },
    })
  }

  return {
    created: true,
    ticket,
  }
})