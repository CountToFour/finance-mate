import {useEffect, useState} from 'react';
import {
    Box,
    Typography,
    Button, Grid,
} from "@mui/material";
import {Add} from '@mui/icons-material';
import {getAccounts, getCurrencies, includeInStatsAccount} from "../../lib/api.ts";
import type {Account, Currency} from "../../lib/types.ts";
import {useNotification} from "../../components/NotificationContext.tsx";
import AddAccountDialog from "./AddAccountDialog.tsx";
import AccountSummaryCard from "./AccountSummaryCard.tsx";

export default function Accounts() {
    const [openDialog, setOpenDialog] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const {success, error} = useNotification();

    useEffect(() => {
        getAccounts().then((res) => {
            setAccounts(res.data);
        });
        getCurrencies().then((res) => {
            setCurrencies(res.data);
        });
    }, []);

    const includeAccountInStats = (accountId: string) => {
        includeInStatsAccount(accountId).then((res) => {
            success('Operacja zakończona sukcesem');
            getAccounts().then((res) => {
                setAccounts(res.data);
            });
        })
    }

    return (
        <>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight={'bold'} color={'secondary'}>Konta</Typography>
                    <Typography variant="body2" sx={{mt: 1}}>Zarządzaj swoimi kontami</Typography>
                </Box>
                <Button variant={'contained'} color={'secondary'} onClick={() => {setOpenDialog(true)}}>
                    <Add sx={{mr: 1}}/>
                    Nowe konto
                </Button>
            </Box>

            <Box p={2} display="grid" gap={2} sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'}}}>
                {accounts.map((account) => (
                    <AccountSummaryCard
                        name={account.name}
                        description={account.description}
                        balance={account.balance}
                        currencySymbol={account.currencySymbol}
                        color={account.color}
                        includeInStats={account.includeInStats}
                        statsMethod={() => includeAccountInStats(account.id)}
                    />
                ))}
            </Box>

            <AddAccountDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                initialAccount={null}
            />
        </>
    )
}
