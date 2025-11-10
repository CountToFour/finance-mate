import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem, Box,
} from "@mui/material";
import {useNotification} from "../../components/NotificationContext.tsx";
import type {Account, CreateAccountDto, Currency} from "../../lib/types.ts";
import {
    getCurrencies,
    createAccount, updateAccount
} from "../../lib/api.ts";
import {useTranslation} from "react-i18next";


interface AddExpenseDialogProps {
    open: boolean;
    onClose: () => void;
    initialAccount?: Account | null;
}

const AddAccountDialog: React.FC<AddExpenseDialogProps> = ({open, onClose, initialAccount}) => {
    const {success, error} = useNotification();
    const {t} = useTranslation();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [color, setColor] = useState<string>("#2b8aef");
    const [currencyCode, setCurrencyCode] = useState<string>("");
    const [currencies, setCurrencies] = useState<Currency[]>([]);

    const [errors, setErrors] = useState({
        amount: "",
        color: "",
        currencyId: "",
        name: "",
        description: "",
    });

    useEffect(() => {
        void getCurrencies().then((res) => setCurrencies(res.data)).catch(() => {});
        if (initialAccount) {
            setName(initialAccount.name ?? "");
            setDescription(initialAccount.description ?? "");
            setAmount((initialAccount.balance ?? 0).toString());
            setColor(initialAccount.color ?? '#2b8aef')
            setCurrencyCode(initialAccount.currencyCode.code ?? "");
        } else {
            // reset when opening for new account
            setName("");
            setDescription("");
            setAmount("");
            setColor('#2b8aef');
            setCurrencyCode("");
        }
    }, [initialAccount]);


    const validate = () => {
        let valid = true;
        const newErrors = {description: "", amount: "", color: "", currencyId: "", name: ""};

        if (!amount || Number.isNaN(parseFloat(amount))) {
            newErrors.amount = t('accounts.add.amountRequired', 'Saldo jest wymagane');
            valid = false;
        }
        if (!color) {
            newErrors.color = 'Kolor jest wymagany'
            valid = false;
        }
        if (!currencyCode) {
            newErrors.currencyId = 'Waluta jest wymagana'
            valid = false;
        }
        if (!name) {
            newErrors.name = 'Nazwa jest wymagana'
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = async () => {
        if (!validate()) return;

        const accountDto = ({
            name: name,
            description: description || undefined,
            currencyId: currencyCode,
            balance: parseFloat(amount) || 0,
            color: color,
        } as unknown) as CreateAccountDto;

        try {
            if (!initialAccount) {
                await createAccount(accountDto);
                success(t('accounts.notifications.createSuccess', 'Udało się utworzyć konto'));
                handleClose();
            } else {
                await updateAccount(accountDto, initialAccount.id);
                success(t('accounts.notifications.updateSuccess', 'Udało się zaktualizować konto'));
                handleClose();
            }
        } catch (e) {
            console.error(e);
            if (!initialAccount) {
                error(t('accounts.notifications.createError', 'Nie udało się utworzyć konta'));
            } else {
                error(t('accounts.notifications.updateError', 'Nie udało się zaktualizować konta'));
            }
        }

    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setAmount("");
        setColor('#2b8aef');
        setCurrencyCode("");
        setErrors({amount: "", color: "", currencyId: "", name: "", description: ""});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>{initialAccount ? t('accounts.dialog.editTitle', 'Edytuj konto') : t('accounts.dialog.addTitle', 'Dodaj konto')}</DialogTitle>
            <DialogContent dividers>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"},
                        gap: 2,
                    }}
                >
                    <TextField
                        fullWidth
                        label={t('accounts.fields.amount', 'Saldo')}
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            if (e.target.value.length > 0) {
                                setErrors(prev => ({...prev, amount: ""}));
                            }
                        }}
                        error={!!errors.amount}
                        helperText={errors.amount}
                    />
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label={t('accounts.fields.currency', 'Waluta')}
                        value={currencyCode}
                        onChange={(e) => {
                            setCurrencyCode(e.target.value);
                            setErrors(prev => ({...prev, currencyId: ""}));
                        }}
                        error={!!errors.currencyId}
                        helperText={errors.currencyId}
                    >
                        <MenuItem value="">— wybierz —</MenuItem>
                        {currencies.map((currency: Currency) => (
                            <MenuItem key={currency.code} value={currency.code}>
                                {currency.code} {currency.name ? `- ${currency.name}` : ''}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
                <TextField
                    fullWidth
                    margin="normal"
                    label={t('accounts.fields.name', 'Nazwa')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label={t('accounts.fields.description', 'Opis')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label={t('accounts.fields.color', 'Kolor')}
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    error={!!errors.color}
                    helperText={errors.color}
                    InputLabelProps={{shrink: true}}
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
    );
};

export default AddAccountDialog;
