import type {Account, Currency, TransferDto} from "../../lib/types.ts";
import React, {useState} from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useNotification} from "../../components/NotificationContext.tsx";
import {transferBetweenAccounts} from "../../lib/api.ts";

interface TransferDialogProps {
    open: boolean;
    onClose: () => void;
    accounts: Account[];
}

const TransferDialog: React.FC<TransferDialogProps> = ({open, onClose, accounts}) => {
    const {t} = useTranslation();
    const {success, error} = useNotification();
    const [amount, setAmount] = useState<string>("");
    const [fromAccount, setFromAccount] = useState<Account | null>(null);
    const [toAccount, setToAccount] = useState<Account | null>(null);
    const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
    const [toCurrency, setToCurrency] = useState<Currency | null>(null);

    const [errors, setFormErrors] = useState({
        amount: "",
        accounts: "",
    });

    const handleClose = () => {
        setAmount("");
        setFromAccount(null);
        setToAccount(null);
        setFromCurrency(null);
        setToCurrency(null);
        setFormErrors({amount: "", accounts: ""});
        onClose();
    };

    const validate = () => {
        let valid = true;
        const newErrors = {accounts: "", amount: ""};

        if (fromAccount?.id === toAccount?.id) {
            newErrors.accounts = "Podano takie same konta";
            valid = false;
        }
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            newErrors.amount = "Nieprawidłowa kwota";
            valid = false;
        }
        setFormErrors(newErrors);
        return valid;
    }

    const handleSave = async () => {
        if (!validate()) return;

        const transferDto = ({
            fromAccountId: fromAccount?.id,
            toAccountId: toAccount?.id,
            amount: parseFloat(amount)
        } as unknown) as TransferDto;

        transferBetweenAccounts(transferDto).then(() => {
            success("Operacja zakończona powodzeniem")
            handleClose();
        }).catch(() => {
            error("Błąd podczas wykonywania transferu")
            handleClose()
        })
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>
                Transfer pomiędzy kontami
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
                        label={"Transfer z"}
                        value={fromAccount ? fromAccount.id : ""}
                        onChange={(e) => {
                            const id = e.target.value as string;
                            const acct = accounts.find(a => a.id === id) ?? null;
                            setFromAccount(acct);
                            setFromCurrency(acct?.currency);
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
                        label={"Waluta"}
                        value={fromCurrency?.symbol ?? ""}
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
                        label={"Transfer do"}
                        value={toAccount ? toAccount.id : ""}
                        onChange={(e) => {
                            const id = e.target.value as string;
                            const acct = accounts.find(a => a.id === id) ?? null;
                            setToAccount(acct);
                            setToCurrency(acct?.currency);
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
                        label={"Waluta"}
                        value={toCurrency?.symbol ?? ""}
                        disabled
                        sx={{flex: 0.4}}
                    />
                </Box>
                <TextField
                    fullWidth
                    label={t('expenses.addExpense.price.label')}
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
                    {t('expenses.addExpense.cancel', 'Anuluj')}
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    {t('expenses.addExpense.save', 'Zapisz')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default TransferDialog;