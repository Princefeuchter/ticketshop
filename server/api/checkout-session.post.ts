import Stripe from 'stripe'

type CheckoutSessionBody = {
  priceId?: string
  quantity?: number
}

export default defineEventHandler(async (event) => {
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