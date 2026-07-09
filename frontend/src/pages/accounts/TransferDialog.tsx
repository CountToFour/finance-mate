import React, {useState} from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useNotification} from "../../components/NotificationContext.tsx";
import {transferBetweenAccounts} from "../../lib/api.ts";
import type {Account, TransferDto} from "../../types/account.ts";
import {useAccountStore} from "../../store/account-store.ts";

interface TransferDialogProps {
    open: boolean;
    onClose: () => void;
}

const TransferDialog: React.FC<TransferDialogProps> = ({open, onClose}) => {
    const {t} = useTranslation();
    const {success, error} = useNotification();
    const [amount, setAmount] = useState<string>("");
    const [fromAccount, setFromAccount] = useState<Account | null>(null);
    const [toAccount, setToAccount] = useState<Account | null>(null);
    // const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
    // const [toCurrency, setToCurrency] = useState<Currency | null>(null);

    const accounts = useAccountStore(state => state.accounts);

    const [errors, setFormErrors] = useState({
        amount: "",
        accounts: "",
    });

    const handleClose = () => {
        setAmount("");
        setFromAccount(null);
        setToAccount(null);
        // setFromCurrency(null);
        // setToCurrency(null);
        setFormErrors({amount: "", accounts: ""});
        onClose();
    };

    const validate = () => {
        let valid = true;
        const newErrors = {accounts: "", amount: ""};

        if (fromAccount?.id === toAccount?.id) {
            newErrors.accounts = t('account.dialog.transfer.error.account')
            valid = false;
        }
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            newErrors.amount = t('account.dialog.transfer.error.amount')
            valid = false;
        }
        setFormErrors(newErrors);
        return valid;
    }

    const handleSave = async () => {
        if (!validate()) return;

        const transferDto: TransferDto = {
            fromAccountId: fromAccount?.id,
            toAccountId: toAccount?.id,
            amount: parseFloat(amount)
        }

        transferBetweenAccounts(transferDto).then(() => {
            success(t('account.dialog.transfer.success'))
            handleClose();
        }).catch(() => {
            error(t('account.dialog.transfer.error.failed'))
            handleClose()
        })
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>
                {t('account.dialog.transfer.label')}
            </DialogTitle>

            <DialogContent dividers sx={{position: 'relative'}}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <TextField
                        select
                        fullWidth
                        //TODO WIELOJEZYCZNOSC
                        label={t('account.dialog.transfer.from')}
                        value={fromAccount ? fromAccount.id : ""}
                        onChange={(e) => {
                            const id = e.target.value as string;
                            const acct = accounts.find(a => a.id === id) ?? null;
                            setFromAccount(acct);
                            // setFromCurrency(acct?.currency);
                            setFormErrors({...errors, accounts: ""});
                        }
                        }
                        error={!!errors.accounts}
                        helperText={errors.accounts}
                        sx={{flex: 1}}
                    >
                        {accounts.map((account) => (
                            <MenuItem key={account.id} value={account.id}>
                                {account.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label={t('account.dialog.transfer.currency')}
                        // value={fromCurrency?.symbol ?? ""}
                        disabled
                        sx={{flex: 0.4}}
                    />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        //TODO WIELOJEZYCZNOSC
                        label={t('account.dialog.transfer.to')}
                        value={toAccount ? toAccount.id : ""}
                        onChange={(e) => {
                            const id = e.target.value as string;
                            const acct = accounts.find(a => a.id === id) ?? null;
                            setToAccount(acct);
                            // setToCurrency(acct?.currency);
                            setFormErrors({...errors, accounts: ""});
                        }
                        }
                        error={!!errors.accounts}
                        helperText={errors.accounts}
                        sx={{flex: 1}}
                    >
                        {accounts.map((account) => (
                            <MenuItem key={account.id} value={account.id}>
                                {account.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="normal"
                        fullWidth
                        label={t('account.dialog.transfer.currency')}
                        // value={toCurrency?.symbol ?? ""}
                        disabled
                        sx={{flex: 0.4}}
                    />
                </Box>
                <TextField
                    fullWidth
                    label={t('account.dialog.transfer.amount')}
                    type="number"
                    value={amount}
                    margin="normal"
                    onChange={(e) => {
                        setAmount(e.target.value)
                        if (e.target.value.length > 0) {
                            setFormErrors({...errors, amount: ""})
                        }
                    }
                    }
                    error={!!errors.amount}
                    helperText={errors.amount}
                />
            </DialogContent>

            <DialogActions sx={{mr: 2, mb: 1, mt: 1}}>
                <Button onClick={handleClose} color="secondary">
                    {t('account.dialog.transfer.cancel')}
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    {t('account.dialog.transfer.save')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default TransferDialog;