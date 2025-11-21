import React, {useEffect, useState} from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, FormControlLabel, Switch } from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs, {Dayjs} from "dayjs";
import {useNotification} from "../../components/NotificationContext.tsx";
import type {Account, Category, RecurringIncome} from "../../lib/types";
import {editExpense} from "../../lib/api";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useTranslation} from "react-i18next";

interface Props {
    open: boolean;
    onClose: () => void;
    recurringTransaction?: RecurringIncome | null;
    accounts: Account[];
    categories: Category[];
}

const periodTypes = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly"
}

const RecurringIncomeDialog: React.FC<Props> = ({open, onClose, recurringTransaction, accounts, categories}) => {
    const {success, error} = useNotification();
    const {t} = useTranslation();
    const [date, setDate] = useState<Dayjs>();
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<Category | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [periodType, setPeriodType] = useState<string>(recurringTransaction?.periodType ?? "");
    const [active, setActive] = useState<boolean>();
    const [errors, setErrors] = useState({amount: "", category: "", account: ""});

    useEffect(() => {
        if (recurringTransaction) {
            setDescription(recurringTransaction.description ?? "");
            setAmount(Math.abs(recurringTransaction.price).toString());
            setDate(dayjs(recurringTransaction.createdAt));
            setActive(recurringTransaction.active);
            setPeriodType(recurringTransaction.periodType);
            if (recurringTransaction.category) {
                const cat = categories.find(c => c.name === recurringTransaction.category);
                if (cat) setCategory(cat);
            }
            if (recurringTransaction.accountName) {
                const acct = accounts.find(a => a.name === recurringTransaction.accountName);
                if (acct) setSelectedAccount(acct);
            }
        }
    }, [recurringTransaction, accounts, categories])

    const validate = () => {
        let valid = true;
        const newErrors = {description: "", amount: "", category: "", account: ""};
        if (!amount || parseFloat(amount) <= 0) { newErrors.amount = 'Kwota jest wymagana'; valid = false; }
        if (!category) { newErrors.category = 'Kategoria jest wymagana'; valid = false; }
        if (!selectedAccount) { newErrors.account = 'Wybierz konto'; valid = false; }
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
            active: active
        }
        if (recurringTransaction) {
            editExpense(recurringTransaction.id, dto).then(() => { success('Zapisano'); onClose(); }).catch(() => error('Błąd'));
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Powtarzające się przychody</DialogTitle>
            <DialogContent dividers>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label={'Data'} value={date} onChange={(v) => setDate(v as Dayjs | undefined)} slotProps={{textField: {fullWidth: true}}} format={"DD-MM-YYYY"} sx={{flex: 1}} />
                    </LocalizationProvider>
                    <TextField fullWidth label={'Kwota'} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{flex: 1}} error={!!errors.amount} helperText={errors.amount} />
                </Box>
                <TextField fullWidth margin="normal" label={'Opis'} value={description} onChange={(e) => setDescription(e.target.value)} />
                <TextField select fullWidth margin="normal" label={'Konto'} value={selectedAccount ? selectedAccount.id : ''} onChange={(e) => { const id = e.target.value as string; const acct = accounts.find(a => a.id === id) ?? null; setSelectedAccount(acct); }} error={!!errors.account} helperText={errors.account}>
                    {accounts.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                </TextField>
                <TextField select fullWidth margin="normal" label={'Kategoria'} value={category ? category.id : ''} onChange={(e) => { const id = e.target.value as string; const cat = categories.find(c => c.id === id) ?? null; setCategory(cat); }} error={!!errors.category} helperText={errors.category}>
                    {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
                <Box display="flex" gap={2}>
                    <TextField select fullWidth margin="normal" label={t('expenses.addExpense.repeat') || 'Powtarzaj'} value={periodType} onChange={(e) => setPeriodType(e.target.value as string)}>
                        {Object.entries(periodTypes).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
                    </TextField>
                    <FormControlLabel control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} color="secondary" />} label={active ? 'Aktywny' : 'Nieaktywny'} sx={{minWidth: '140px'}} />
                </Box>
            </DialogContent>
            <DialogActions sx={{mr:2, mb:1, mt:1}}>
                <Button onClick={onClose} color="secondary">Anuluj</Button>
                <Button onClick={handleSave} variant="contained" color="primary">Zapisz</Button>
            </DialogActions>
        </Dialog>
    )
}

export default RecurringIncomeDialog;
