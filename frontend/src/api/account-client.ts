import type {Account, AccountDto, TransferDto} from "../types/account.ts";
import api from "./api.ts";

export const accountService = {
    getAccounts: async (): Promise<Account[]> => {
        const response = await api.get(
        '/account',
        );
        return response.data;
    },

    createAccount: async (data: AccountDto): Promise<Account> => {
        const response = await api.post<Account>(
            `/account/create`,
            data,
        )
        return response.data;
    },

    updateAccount: async (data: AccountDto, id: string): Promise<Account> => {
        const response = await api.put<Account>(
            `/account/update/${id}`,
            data
        );
        return response.data;
    },

    deleteAccount: async (id: string): Promise<void> => {
        const response = await api.delete(
            `/account/delete/${id}`,
        );
        return response.data;
    },

    getAccount: async (id: string): Promise<Account> => {
        const response = await api.get<Account>(
            `/account/${id}`,
        )
        return response.data;
    },

    archive: async (id: string): Promise<void> => {
        const response = await api.put(
            `/account/archive/${id}`,
        )
        return response.data;
    },

    includeInStats: async (id: string): Promise<void> => {
        const response = await api.put(
            `account/include-in-stats/${id}`,
        )
        return response.data;
    },

    transfer: async (data: TransferDto): Promise<void> => {
        const response = await api.put(
            `/account/transfer`,
            data,
        )
        return response.data;
    }

}