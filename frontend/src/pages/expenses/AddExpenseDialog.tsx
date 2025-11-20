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
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs, {Dayjs} from "dayjs";
import {useNotification} from "../../components/NotificationContext.tsx";
import type {Account, Category, Currency, Expense, TransactionDto} from "../../lib/types.ts";
import {addTransaction, addRecurringTransaction, editExpense} from "../../lib/api.ts";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useTranslation} from "react-i18next";


interface AddExpenseDialogProps {
    open: boolean;
    onClose: () => void;
    initialExpense?: Expense | null;
    accounts: Account[];
    categories: Category[];
}

//TODO ZROBIĆ Z TEGO ENUM W types.ts I ROZWAŻYĆ CUSTOM PERIOD
const periodTypes = {
    NONE: "None",
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly"
}

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({open, onClose, initialExpense, accounts, categories}) => {
    const {success, error} = useNotification();
    const {t} = useTranslation();
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [description, setDescription] = useState<string | null>(null);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<Category | null>(null);
    const [currency, setCurrency] = useState<Currency | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [periodType, setPeriodType] = useState<keyof typeof periodTypes>("NONE");

    const [errors, setErrors] = useState({
        amount: "",
        category: "",
        account: "",
    });

    useEffect(() => {
        if (initialExpense) {
            setDescription(initialExpense.description ?? null);
            setAmount(Math.abs(initialExpense.price).toString());
            if ((initialExpense as Expense).category) {
                const cat = categories.find(c => c.name === (initialExpense as Expense).category);
                if (cat) setCategory(cat);
            }
            setDate(dayjs(initialExpense.createdAt));
            // jeśli initialExpense zawiera id konta, ustaw odpowiednie konto w stanie
            // zakładamy, że initialExpense ma pole accountId (string). Jeśli nie, nic nie zmieniamy.
            if ((initialExpense as Expense).accountName) {
                // znajdź konto w liście accounts
                const acct = accounts.find(a => a.name === (initialExpense as Expense).accountName);
                if (acct) {
                    setSelectedAccount(acct);
                    setCurrency(acct.currency);
                }
            }
        }
    }, [initialExpense, accounts, categories])


    const validate = () => {
        let valid = true;
        const newErrors = {description: "", amount: "", category: "", account: ""};

        if (!amount || parseFloat(amount) <= 0.01) {
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
            // wysyłamy id konta
            accountId: selectedAccount!.id,
            categoryId: category!.id,
            price: parseFloat(amount),
            description: description,
            createdAt: date!.format("YYYY-MM-DD"),
            periodType: periodType,
            transactionType: "EXPENSE"
        };

        if (!initialExpense) {
            if (periodType !== 'NONE') {
                addRecurringTransaction(expenseDto)
                    .then(() => {
                        success(t('expenses.notifications.add.success'));
                        handleClose();
                    })
                    .catch(() => {
                        error(t('expenses.notifications.add.error'));
                    });
            } else {
                addTransaction(expenseDto)
                    .then(() => {
                        success(t('expenses.notifications.add.success'));
                        handleClose();
                    })
                    .catch(() => {
                        error(t('expenses.notifications.add.error'));
                    });
            }
        } else {
            editExpense(initialExpense.id, expenseDto)
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
        setSelectedAccount(null);
        setDescription(null);
        setAmount("");
        setCategory(null);
        setCurrency(null);
        setPeriodType("NONE");
        setDate(dayjs());
        setErrors({amount: "", category: "", account: ""});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>{initialExpense ? t('expenses.addExpense.editLabel') : t('expenses.addExpense.addLabel')}</DialogTitle>
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
                            sx = {{flex: 1}}
                        />
                    </LocalizationProvider>
                    <TextField
                        fullWidth
                        label={t('expenses.addExpense.price.label')}
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
                        sx = {{flex: 1}}
                    />
                    <TextField
                        fullWidth
                        label={"Waluta"}
                        value={currency?.symbol ?? ""}
                        disabled
                        sx={{ flex: 0.5 }}
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
                    disabled={!!initialExpense}
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
                {!initialExpense && (<TextField
                        select
                        fullWidth
                        margin="normal"
                        label={t('expenses.addExpense.repeat')}
                        value={periodType}
                        onChange={(e) => setPeriodType(e.target.value as keyof typeof periodTypes
                        )}
                        defaultValue={periodTypes.NONE}
                    >
                        {Object.entries(periodTypes).map(([key, label]) => (
                            <MenuItem key={key} value={key}>
                                {label}
                            </MenuItem>
                        ))}
                    </TextField>
                )
                }
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
