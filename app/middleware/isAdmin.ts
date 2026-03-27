export default defineNuxtRouteMiddleware(async (to, from) => {
    const {loggedIn, user, fetch} = useUserSession();

        await fetch();

        if (!loggedIn.value) {
            return await navigateTo('/login');
        }

        if(user.value?.role !== 'admin') {
            return await navigateTo('/');
        }
})

