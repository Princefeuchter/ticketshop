declare module '#auth-utils' {
  export interface User {
    login?: string
  }

  export interface UserSession {
    loggedInAt: Date
    expiresAt: Date
    user: User
  }
}

export {}
