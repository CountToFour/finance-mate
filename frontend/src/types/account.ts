interface AccountBase {
    name: string
    description?: string
    balance: number
    color: string
}

export interface Account extends AccountBase {
    id: string
    includeInStats: boolean
    archived?: boolean
}

export interface AccountDto extends AccountBase {}

export interface TransferDto {
    fromAccountId?: string
    toAccountId?: string
    amount: number
}