import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem, Box, FormControlLabel, Switch,
} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs, {Dayjs} from "dayjs";
import {useNotification} from "../../components/NotificationContext.tsx";
import type {TransactionDto, RecurringExpense, Account, Category, Currency} from "../../lib/types.ts";
import {editExpense} from "../../lib/api.ts";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useTranslation} from "react-i18next";


interface AddExpenseDialogProps {
    open: boolean;
    onClose: () => void;
    recurringExpense?: RecurringExpense;
    accounts: Account[];
    categories: Category[];
}

//TODO ZROBIĆ Z TEGO ENUM W types.ts I ROZWAŻYĆ CUSTOM PERIOD
const periodTypes = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly"
}

type PeriodType = keyof typeof periodTypes;

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({open, onClose, recurringExpense, accounts, categories}) => {
    const {success, error} = useNotification();
    const {t} = useTranslation();
    const [date, setDate] = useState<Dayjs>();
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<Category | null>(null);
    const [currency, setCurrency] = useState<Currency | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [periodType, setPeriodType] = useState<PeriodType | "">(recurringExpense?.periodType as PeriodType ?? "");
    const [active, setActive] = useState<boolean>();

    const [errors, setErrors] = useState({
        amount: "",
        category: "",
        account: "",
    });

    useEffect(() => {
        if (recurringExpense) {
            setDescription(recurringExpense.description ?? null);
            setAmount(Math.abs(recurringExpense.price).toString());
            setDate(dayjs(recurringExpense.createdAt));
            setActive(recurringExpense.active);
            setPeriodType(recurringExpense.periodType as PeriodType);

            if ((recurringExpense as RecurringExpense).category) {
                const cat = categories.find(c => c.name === (recurringExpense as RecurringExpense).category);
                if (cat) setCategory(cat);
            }

            if ((recurringExpense as RecurringExpense).accountName) {
                // znajdź konto w liście accounts
                const acct = accounts.find(a => a.name === (recurringExpense as RecurringExpense).accountName);
                if (acct) {
                    setSelectedAccount(acct);
                    setCurrency(acct.currency);
                }
            }
        }
    }, [accounts, categories, recurringExpense])


    const validate = () => {
        let valid = true;
        const newErrors = {description: "", amount: "", category: "", account: ""};

        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = t('expenses.addExpense.price.required');
            valid = false;
        }
        if (!category) {
            newErrors.category = t('expenses.addExpense.category.required');
            valid = false;
        }
        if (!selectedAccount) {
            newErrors.account = t('expenses.addExpense.account.required') || 'Wybierz konto';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = () => {
        if (!validate()) return;

        const expenseDto: TransactionDto = {
            accountId: selectedAccount!.id,
            categoryId: category!.id,
            price: parseFloat(amount),
            description: description,
            createdAt: date!.format("YYYY-MM-DD"),
            periodType: periodType,
            active: active,
            transactionType: "EXPENSE"
        };

        if (recurringExpense) {
            editExpense(recurringExpense?.id, expenseDto)
                .then(() => {
                    success(t('expenses.notifications.edit.success'));
                    handleClose();
                })
                .catch(() => {
                    error(t('expenses.notifications.edit.error'));
                });
        }
    };

    const handleClose = () => {
        setErrors({amount: "", category: "", account: ""});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('expenses.recurringExpense.label')}</DialogTitle>
            <DialogContent dividers>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label={t('expenses.addExpense.date')}
                            value={date}
                            onChange={(newValue) => setDate(newValue)}
                            slotProps={{textField: {fullWidth: true}}}
                            format={"DD-MM-YYYY"}
                            sx={{flex: 1}}
                            // disablePast={true}
                        />
                    </LocalizationProvider>
                    <TextField
                        fullWidth
                        label={t('expenses.addExpense.price.label')}
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                            if (e.target.value.length > 0) {
                                setErrors({...errors, amount: ""})
                            }
                        }
                        }
                        error={!!errors.amount}
                        helperText={errors.amount}
                        sx={{flex: 1}}
                    />
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
                    label={t('expenses.addExpense.description')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    //TODO WIELOJEZYCZNOSC
                    label={t('Konto')}
                    value={selectedAccount ? selectedAccount.id : ""}
                    onChange={(e) => {
                        const id = e.target.value as string;
                        const acct = accounts.find(a => a.id === id) ?? null;
                        setSelectedAccount(acct);
                        setCurrency(acct?.currency);
                        setErrors({...errors, account: ""});
                    }
                    }
                    error={!!errors.account}
                    helperText={errors.account}
                >
                    {accounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                            {account.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label={t('expenses.addExpense.category.label')}
                    value={category ? category.id : ""}
                    onChange={(e) => {
                        const id = e.target.value as string;
                        const cat = categories.find(c => c.id === id) ?? null;
                        setCategory(cat)
                        setErrors({...errors, category: ""})
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
                <Box display="flex" gap={2}>
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label={t('expenses.addExpense.repeat')}
                        value={periodType}
                        onChange={(e) => setPeriodType(
                            e.target.value as keyof typeof periodTypes
                        )}
                    >
                        {Object.entries(periodTypes).map(([key, label]) => (
                            <MenuItem key={key} value={key}>
                                {label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <FormControlLabel control={
                        <Switch
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            color="secondary"
                        />

                    }
                                      label={active ? t('expenses.recurringExpense.active') : t('expenses.recurringExpense.inactive')}
                                      sx={{minWidth: "140px"}}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{mr: 2, mb: 1, mt: 1}}>
                <Button onClick={handleClose} color="secondary">
                    {t('expenses.addExpense.cancel')}
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    {t('expenses.addExpense.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddExpenseDialog;
