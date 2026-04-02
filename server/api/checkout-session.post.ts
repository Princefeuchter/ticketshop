import Stripe from 'stripe'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

type CheckoutSessionBody = {
  priceId?: string
  quantity?: number
  eventId?: number
  orderItemId?: number
}

export default defineEventHandler(async (event) => {
  const userSession = await getUserSession(event)

  if (!userSession.user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Login required',
    })
  }

  const config = useRuntimeConfig(event)
  const rawAllowedPriceIds = config.stripeAllowedPriceIds as unknown
  const allowedPriceIds = Array.isArray(rawAllowedPriceIds)
    ? rawAllowedPriceIds.filter((value): value is string => typeof value === 'string' && value.length > 0)
    : typeof rawAllowedPriceIds === 'string'
      ? rawAllowedPriceIds
          .split(',')
          .map((value: string) => value.trim())
          .filter((value: string) => value.length > 0)
      : []

  if (!config.stripeSecretKey) {
    throw createError({
      statusCode: 500,
      message: 'Stripe secret key is not configured',
    })
  }

  if (allowedPriceIds.length === 0) {
    throw createError({
      statusCode: 500,
      message: 'No allowed Stripe price IDs configured',
    })
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  })

  const body = (await readBody<CheckoutSessionBody>(event).catch(() => ({} as CheckoutSessionBody))) || {}
  const quantity = Number.isInteger(body.quantity) && (body.quantity as number) > 0 ? (body.quantity as number) : 1
  const requestedPriceId = body.priceId || config.stripeDefaultPriceId || allowedPriceIds[0]
  const resolvedEventId = Number.isInteger(body.eventId)
    ? Number(body.eventId)
    : Number(config.stripeDefaultEventId || 1)

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

  let resolvedOrderItemId = Number.isInteger(body.orderItemId) && Number(body.orderItemId) > 0
    ? Number(body.orderItemId)
    : 0

  if (!requestedPriceId) {
    throw createError({
      statusCode: 500,
      message: 'No Stripe price ID resolved',
    })
  }

  if (!allowedPriceIds.includes(requestedPriceId)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid price selected',
    })
  }

  const { data: eventRow, error: eventError } = await db
    .from('events')
    .select('id, capacity, tickets_sold, is_active')
    .eq('id', resolvedEventId)
    .maybeSingle()

  if (eventError) {
    throw createError({
      statusCode: 500,
      message: 'Event availability could not be verified',
      data: {
        details: eventError.message,
        code: (eventError as { code?: string }).code || null,
      },
    })
  }

  if (!eventRow) {
    throw createError({
      statusCode: 400,
      message: 'Selected event does not exist',
    })
  }

  const isActive = eventRow.is_active === true || Number(eventRow.is_active) === 1
  if (!isActive) {
    throw createError({
      statusCode: 400,
      message: 'Event is not active',
    })
  }

  const capacity = Number(eventRow.capacity || 0)
  const ticketsSold = Number(eventRow.tickets_sold || 0)
  const remainingCapacity = capacity - ticketsSold

  if (remainingCapacity <= 0) {
    throw createError({
      statusCode: 409,
      message: 'Event is sold out',
    })
  }

  if (quantity > remainingCapacity) {
    throw createError({
      statusCode: 409,
      message: 'Not enough tickets available',
      data: {
        remainingCapacity,
      },
    })
  }

  if (resolvedOrderItemId === 0) {
    let unitPriceCents = 0
    try {
      const price = await stripe.prices.retrieve(requestedPriceId)
      unitPriceCents = Number(price.unit_amount || 0)
    } catch (error) {
      console.error('Stripe price retrieval failed', error)
      throw createError({
        statusCode: 500,
        message: 'Price could not be resolved',
      })
    }

    if (!Number.isInteger(unitPriceCents) || unitPriceCents <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Invalid Stripe price configuration',
      })
    }

    const { data: orderRow, error: orderInsertError } = await db
      .from('orders')
      .insert({
        user_id: userSession.user.id,
        status: 'paid',
        total_cents: unitPriceCents * quantity,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (orderInsertError || !orderRow?.id) {
      console.error('Order insert failed during checkout-session', orderInsertError)
      throw createError({
        statusCode: 500,
        message: 'Order could not be created for checkout',
        data: {
          details: orderInsertError?.message || null,
          code: (orderInsertError as { code?: string } | null)?.code || null,
        },
      })
    }

    const { data: orderItemRow, error: orderItemInsertError } = await db
      .from('order_items')
      .insert({
        order_id: orderRow.id,
        event_id: Number(eventRow.id),
        quantity,
        unit_price_cents: unitPriceCents,
      })
      .select('id')
      .single()

    if (orderItemInsertError || !orderItemRow?.id) {
      console.error('Order item insert failed during checkout-session', orderItemInsertError)
      throw createError({
        statusCode: 500,
        message: 'Order item could not be created for checkout',
        data: {
          details: orderItemInsertError?.message || null,
          code: (orderItemInsertError as { code?: string } | null)?.code || null,
        },
      })
    }

    resolvedOrderItemId = Number(orderItemRow.id)
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
    price: requestedPriceId,
    quantity,
  }]

  const origin = getRequestHeader(event, 'origin') || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded_page',
    line_items: lineItems,
    return_url: `${origin}/payment?session_id={CHECKOUT_SESSION_ID}`,
    customer_email: userSession.user.login,
    metadata: {
      userId: String(userSession.user.id),
      eventId: String(resolvedEventId),
      orderItemId: String(resolvedOrderItemId),
    },
  })

  if (!session.client_secret) {
    throw createError({
      statusCode: 500,
      message: 'Stripe did not return a client secret',
    })
  }

  return {
    clientSecret: session.client_secret,
  }
})