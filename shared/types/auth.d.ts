declare module '#auth-utils' {
  export interface User {
    login?: string
    role?: 'admin' | 'user'
  }

  export interface UserSession {
    loggedInAt: Date
    expiresAt: Date
    user: User
  }
}

export {}
