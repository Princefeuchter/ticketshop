import {serverSupabaseClient} from "#supabase/server";


export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event);
    const db = await serverSupabaseClient(event);

    const { data } = await db.from('users').select('*').eq('email',email).single();
    if (!data) {
        console.log('No user found with email:', email);
        throw createError({
            statusCode: 401,
            message: 'Invalid email or password'
        })
    }

    if(await verifyPassword(data.password_hash, password)){
        console.log('User found:', data);
        await setUserSession(event, {
            user: {
                login: data.email,
                role: data.role
            },
            loggedInAt: new Date(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        });
        return { success: true };
    }else{
        console.log('Invalid password for user:', data);
        throw createError({
            statusCode: 401,
            message: 'Invalid password'
        })
    }

}) 