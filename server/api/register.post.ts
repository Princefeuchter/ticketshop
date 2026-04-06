import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const { email, password, fullname, birthdate } = await readBody(event);
    const db = await serverSupabaseClient(event);

    if (password == '') {
        throw createError({
            statusCode: 400,
            message: 'Password is required'
        })
    }
    const passwordHash = await hashPassword(password);

    await db.from('users').insert({
        email,
        password_hash: passwordHash,
        full_name: fullname,
        created_at: new Date().toISOString(),
        birthdate: birthdate,
    });

    return { success: true };
});