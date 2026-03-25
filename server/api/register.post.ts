import { serverSupabaseClient } from '#supabase/server'
import { create } from 'node:domain';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event);
    const db = await serverSupabaseClient(event);
    console.log(password);
    if(password == ''){
        console.log('No password provided');
        throw createError({
            statusCode: 400,
            message: 'Password is required'
        })
    }
    const passwordHash = await hashPassword(password);
    console.log(passwordHash);

    await db.from('users').insert({
        email,
        password_hash: passwordHash,
        full_name: email.split('@')[0],
        created_at: new Date().getDate().toString()
    });

    return { success: true };
});