export default defineNuxtRouteMiddleware(async (to, from) => {
    const { loggedIn, user , fetch} = useUserSession();

    await fetch();

    if (!loggedIn.value) {
        return navigateTo('/login');
    }

    if (to.path.startsWith('/admin') && user.value?.role !== 'admin') {
        return navigateTo('/');
    }

})