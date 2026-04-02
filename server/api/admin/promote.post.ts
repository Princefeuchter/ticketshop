import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

type PromoteBody = {
  email?: string
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Nicht eingeloggt'
    })
  }

  if (session.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Keine Berechtigung'
    })
  }

  const body = await readBody<PromoteBody>(event)
  const normalizedEmail = body.email?.trim().toLowerCase()

  if (!normalizedEmail) {
    throw createError({
      statusCode: 400,
      message: 'Email ist erforderlich'
    })
  }

  let db = await serverSupabaseClient(event)

  const serviceRoleKey = process.env.NUXT_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || ''
  const canUseServiceRole = serviceRoleKey.length > 0
    && !serviceRoleKey.includes('your-service-role-key')
    && !serviceRoleKey.startsWith('sb_service_key_')

  if (canUseServiceRole) {
    try {
      db = await serverSupabaseServiceRole(event)
    }
    catch {
      // Falls service-role Initialisierung fehlschlaegt, bleibt client-role aktiv.
    }
  }

  const { data: existingUser, error: findError } = await db
    .from('users')
    .select('id, email, role')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (findError) {
    throw createError({
      statusCode: 500,
      message: 'Benutzer konnte nicht geladen werden',
      data: findError
    })
  }

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      message: 'Benutzer existiert nicht'
    })
  }

  if (existingUser.role === 'admin') {
    return {
      success: true,
      alreadyAdmin: true,
      email: existingUser.email
    }
  }

  const { error: updateError } = await db
    .from('users')
    .update({ role: 'admin' })
    .eq('id', existingUser.id)

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: 'Rolle konnte nicht aktualisiert werden',
      data: updateError
    })
  }

  return {
    success: true,
    alreadyAdmin: false,
    email: existingUser.email
  }
})
