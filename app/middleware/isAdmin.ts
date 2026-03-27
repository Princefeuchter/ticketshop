export default defineNuxtRouteMiddleware((to, from) => {
    const {loggedIn, user, fetch} = useUserSession();

        if (!loggedIn.value) {
            return navigateTo('/login');
        }

        if(user.value?.role !== 'admin') {
            return navigateTo('/');
        }
})

