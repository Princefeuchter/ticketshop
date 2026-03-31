declare module '#auth-utils' {
  export interface User {
    id: number
    login?: string
    role?: 'admin' | 'customer'
  }

  export interface UserSession {
    loggedInAt: Date
    expiresAt: Date
    user: User
  }
}

export {}
