export type User = {
    email: string;
    username: string;
}

export type State = {
    accessToken: string | null
    refreshToken: string | null
    tokenType: string | null
    user: User | null
    loading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<boolean>
    register: (email: string, password: string, username: string) => Promise<boolean>
    logout: () => void
}