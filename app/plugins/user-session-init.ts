export default defineNuxtPlugin(async () => {
  const { fetch } = useUserSession()

  try {
    await fetch()
  } catch (error) {
    console.error('Failed to initialize user session:', error)
  }
})