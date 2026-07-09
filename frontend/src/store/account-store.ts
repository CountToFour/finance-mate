import type {Account} from "../types/account.ts";
import {create} from "zustand";
import {persist} from "zustand/middleware";

interface AccountState {
    accounts: Account[];
    setAccounts: (accounts: Account[]) => void;
    addAccount: (account: Account) => void;
    deleteAccount: (account: Account) => void;
    updateAccount: (updatedAccount: Account) => void;
}

export const useAccountStore = create<AccountState>()(
    persist(
        (set) => ({
            accounts: [],

            setAccounts: (accounts) => set({accounts: accounts}),

            addAccount: (account) => set((prev) => ({
                accounts: [...prev.accounts, account]
            })),

            deleteAccount: (accountToDelete) => set((prev) => ({
                accounts: prev.accounts.filter(acc => acc.id !== accountToDelete.id)
            })),

            updateAccount: (updatedAccount) => set((prev) => ({
                accounts: prev.accounts.map((acc) =>
                    acc.id === updatedAccount.id ? updatedAccount : acc
                )
            })),
        }),
        {name: 'financemate-accounts'}
    )
)