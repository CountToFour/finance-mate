import {useState} from 'react';
import {
    Box,
    Typography,
    Button
} from "@mui/material";
import {Add} from '@mui/icons-material';
import {useNotification} from "../../components/NotificationContext.tsx";
import AddAccountDialog from "./AddAccountDialog.tsx";
import AccountSummaryCard from "./AccountSummaryCard.tsx";
import TransferDialog from "./TransferDialog.tsx";
import type {Account} from "../../types/account.ts";
import {useAccountStore} from "../../store/account-store.ts";
import {accountService} from "../../api/account-client.ts";
import {useTranslation} from "react-i18next";

export default function Accounts() {
    const [openDialog, setOpenDialog] = useState(false);
    const [transferDialog, setTransferDialog] = useState(false);
    const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

    const accounts = useAccountStore(state => state.accounts);
    const update = useAccountStore(state => state.updateAccount);
    const deleteAccount = useAccountStore(state => state.deleteAccount);
    const addAccount = useAccountStore(state => state.addAccount);

    const {t} = useTranslation();
    // const [currencies, setCurrencies] = useState<Currency[]>([]);
    // const [isLoading, setIsLoading] = useState(false);

    const {success, error} = useNotification();

    const includeAccountInStats = (account: Account) => {
        accountService.includeInStats(account.id).then(() => {
            success(t('account.page.stats.success'));

            update(account);
        }).catch(() => {
            error(t('account.page.stats.error'));
        });
    }

    const handleDeleteAccount = (account: Account) => {
        accountService.deleteAccount(account.id).then(() => {
            success(t('account.page.delete.success'));
            deleteAccount(account);
        }).catch(() => {
            error(t('account.page.delete.error'));
        });
    }

    const updateAccount = (updated: Account) => {
        update(updated)
    };

    const addAccountToList = (newAccount: Account) => {
        addAccount(newAccount);
    }

    return (
        <>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight={'bold'} color={'secondary'}>
                        {t ('account.page.label')}
                    </Typography>
                    <Typography variant="body2" sx={{mt: 1}}>
                        {t('account.page.secondLabel')}
                    </Typography>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                    <Button variant="outlined" onClick={() => {
                        setTransferDialog(true)
                    }}>
                        <Add sx={{mr: 1}}/>
                        {t('account.page.transfer')}
                    </Button>
                    <Button variant={'contained'} color={'secondary'} onClick={() => {
                        setOpenDialog(true)
                    }}>
                        <Add sx={{mr: 1}}/>
                        {t('account.page.add')}
                    </Button>
                </Box>
            </Box>

            <Box p={2} display="grid" gap={2}
                 sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'}}}>
                {accounts.map((account) => (
                    <AccountSummaryCard
                        name={account.name}
                        description={account.description}
                        balance={account.balance}
                        // currencySymbol={account.currency.symbol}
                        currencySymbol={'zł'}
                        color={account.color}
                        includeInStats={account.includeInStats}
                        statsMethod={() => includeAccountInStats(account)}
                        deleteMethod={() => handleDeleteAccount(account)}
                        editMethod={() => {
                            setAccountToEdit(account);
                            setOpenDialog(true)
                        }}

                    />
                ))}
            </Box>
            <TransferDialog
                open={transferDialog}
                onClose={() => setTransferDialog(false)}
            />
            <AddAccountDialog
                open={openDialog}
                onClose={() => {
                    setOpenDialog(false)
                    setAccountToEdit(null)
                }}
                initialAccount={accountToEdit}
                onUpdated={updateAccount}
                onCreated={addAccountToList}
            />
        </>
    )
}
