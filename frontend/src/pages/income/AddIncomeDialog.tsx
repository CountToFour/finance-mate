import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem, Box
} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs, {Dayjs} from "dayjs";
import {useNotification} from "../../components/NotificationContext.tsx";
import type {Account, Category, Currency, Income} from "../../lib/types";
import {addTransaction, addRecurringTransaction, editExpense} from "../../lib/api";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

interface Props {
    open: boolean;
    onClose: () => void;
    initialTransaction?: Income | null;
    accounts: Account[];
    categories: Category[];
}

const periodTypes = {
    NONE: "None",
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly"
}

const AddIncomeDialog: React.FC<Props> = ({open, onClose, initialTransaction, accounts, categories}) => {
    const {success, error} = useNotification();
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [description, setDescription] = useState<string | null>(null);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<Category | null>(null);
    const [currency, setCurrency] = useState<Currency | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [periodType, setPeriodType] = useState<keyof typeof periodTypes>("NONE");

    const [errors, setErrors] = useState({amount: "", category: "", account: ""});

    useEffect(() => {
        if (initialTransaction) {
            setDescription(initialTransaction.description ?? null);
            setAmount(Math.abs(initialTransaction.price).toString());
            if (initialTransaction.category) {
                const cat = categories.find(c => c.name === initialTransaction.category);
                if (cat) setCategory(cat);
            }
            setDate(dayjs(initialTransaction.createdAt));
            if (initialTransaction.accountName) {
                const acct = accounts.find(a => a.name === initialTransaction.accountName);
                if (acct) {
                    setSelectedAccount(acct);
                    setCurrency(acct.currency);
                }
            }
        }
    }, [initialTransaction, accounts, categories]);

    const validate = () => {
        let valid = true;
        const newErrors = {description: "", amount: "", category: "", account: ""};
        if (!amount || parseFloat(amount) <= 0.01) {
            newErrors.amount = 'Kwota jest wymagana';
            valid = false;
        }
        if (!category) {
            newErrors.category = 'Kategoria jest wymagana';
            valid = false;
        }
        if (!selectedAccount) {
            newErrors.account = 'Wybierz konto';
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    }

    const handleSave = () => {
        if (!validate()) return;
        const dto = {
            accountId: selectedAccount!.id,
            categoryId: category!.id,
            price: parseFloat(amount),
            description: description,
            createdAt: date!.format('YYYY-MM-DD'),
            periodType: periodType,
            transactionType: 'INCOME',
            active: true
        };

        if (!initialTransaction) {
            if (periodType !== 'NONE') {
                addRecurringTransaction(dto).then(() => {
                    success('Dodano przychód okresowy');
                    handleClose();
                }).catch(() => error('Błąd'));
            } else {
                addTransaction(dto).then(() => {
                    success('Dodano');
                    handleClose();
                }).catch(() => error('Błąd'));
            }
        } else {
            // reuse editExpense endpoint (backend uses same edit path)
            editExpense(initialTransaction.id, dto).then(() => {
                success('Zaktualizowano');
                handleClose();
            }).catch(() => error('Błąd'));
        }
    }

    const handleClose = () => {
        setDate(dayjs());
        setDescription(null);
        setAmount("");
        setCategory(null);
        setSelectedAccount(null);
        setPeriodType("NONE");
        setErrors({amount: "", category: "", account: ""});
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>{initialTransaction ? 'Edytuj przychód' : 'Nowy przychód'}</DialogTitle>
            <DialogContent dividers>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label={'Data'}
                            value={date}
                            onChange={(v) => setDate(v)}
                            slotProps={{textField: {fullWidth: true}}}
                            format={"DD-MM-YYYY"}
                            sx={{flex: 1}}
                        />
                    </LocalizationProvider>
                    <TextField
                        fullWidth
                        label={'Kwota'}
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                            if (e.target.value.length > 0.01) {
                                setErrors({...errors, amount: ""})
                            }
                        }
                        }
                        error={!!errors.amount}
                        helperText={errors.amount}
                        sx={{flex: 1}}/>
                    <TextField
                        fullWidth
                        label={"Waluta"}
                        value={currency?.symbol ?? ""}
                        disabled
                        sx={{flex: 0.5}}
                    />
                </Box>
                <TextField
                    fullWidth
                    margin="normal"
                    label={'Opis'}
                    value={description ?? ''}
                    onChange={(e) => setDescription(e.target.value)}/>
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label={'Konto'}
                    value={selectedAccount ? selectedAccount.id : ''}
                    onChange={(e) => {
                        const id = e.target.value as string;
                        const acct = accounts.find(a => a.id === id) ?? null;
                        setSelectedAccount(acct);
                        setCurrency(acct!.currency);
                        setErrors({...errors, account: ''});
                    }}
                    error={!!errors.account}
                    helperText={errors.account}
                >
                    {accounts.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                </TextField>
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label={'Kategoria'}
                    value={category ? category.id : ''}
                    onChange={(e) => {
                        const id = e.target.value as string;
                        const cat = categories.find(c => c.id === id) ?? null;
                        setCategory(cat);
                        setErrors({...errors, category: ''});
                    }
                    }
                    error={!!errors.category}
                    helperText={errors.category}
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </TextField>
                {!initialTransaction && (
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label={'Powtarzaj'}
                        value={periodType}
                        onChange={(e) => setPeriodType(e.target.value as keyof typeof periodTypes)}
                    >
                        {Object.entries(periodTypes).map(([key, label]) =>
                            <MenuItem key={key}
                                      value={key}>{label}
                            </MenuItem>
                        )}
                    </TextField>
                )}
            </DialogContent>
            <DialogActions sx={{mr: 2, mb: 1, mt: 1}}>
                <Button onClick={handleClose} color="secondary">Anuluj</Button>
                <Button onClick={handleSave} variant="contained" color="primary">Zapisz</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddIncomeDialog;
