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
import type {Currency} from "../../lib/types.ts";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useTranslation} from "react-i18next";
import type {Transaction, TransactionDto, TransactionType} from "../../types/transaction.ts";
import type { Account } from "../../types/account.ts";
import type { Category } from "../../types/category.ts";
import {transactionService} from "../../api/transaction-client.ts";
import {useTransactionStore} from "../../store/transaction-store.ts";
import {useRecurringTransactionStore} from "../../store/recurring-transaction-store.ts";


interface AddExpenseDialogProps {
    open: boolean;
    onClose: () => void;
    initialTransaction?: Transaction | null;
    accounts: Account[];
    categories: Category[];
}

//TODO ZROBIĆ Z TEGO ENUM W types.ts I ROZWAŻYĆ CUSTOM PERIOD
const periodTypes = {
    NONE: "Nie powtarzaj",
    DAILY: "Co dzień",
    WEEKLY: "Co tydzień",
    MONTHLY: "Co miesiąc",
    YEARLY: "Co rok"
}

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({open, onClose, initialTransaction, accounts, categories}) => {
    const {success, error} = useNotification();
    const {t} = useTranslation();
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [description, setDescription] = useState<string | null>(null);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<Category | null>(null);
    const [currency, setCurrency] = useState<Currency | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [periodType, setPeriodType] = useState<keyof typeof periodTypes>("NONE");
    const [type, setType] = useState<TransactionType>(initialTransaction?.transactionType ? initialTransaction.transactionType : "EXPENSE");

    const addTransaction = useTransactionStore(state => state.addTransaction)
    const addRecurringTransaction = useRecurringTransactionStore(state => state.addTransaction)

    const updateTransaction = useTransactionStore(state => state.editTransaction)

    const [errors, setErrors] = useState({
        amount: "",
        category: "",
        account: "",
    });

    useEffect(() => {
        if (initialTransaction) {
            setDescription(initialTransaction.description ?? null);
            setAmount(Math.abs(initialTransaction.price).toString());
            if (initialTransaction.categoryName) {
                const cat = categories.find(c => c.name === initialTransaction.categoryName);
                if (cat) setCategory(cat);
            }
            setDate(dayjs(initialTransaction.createdAt));
            if (initialTransaction.accountName) {
                const acct = accounts.find(a => a.name === initialTransaction.accountName);
                if (acct) {
                    setSelectedAccount(acct);
                    // setCurrency(acct.currency);
                }
            }
        }
    }, [initialTransaction, accounts, categories])


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

    const handleSave = async () => {
        if (!validate()) return;

        const transactionDto: TransactionDto = {
            accountId: selectedAccount!.id,
            categoryId: category!.id,
            price: parseFloat(amount),
            description: description,
            createdAt: date!.format("YYYY-MM-DD"),
            periodType: periodType,
            transactionType: type
        };

        if (!initialTransaction) {
            try {
                if (periodType !== 'NONE') {
                    const response = await transactionService.addRecurringTransaction(transactionDto)
                    addRecurringTransaction(response)
                    success(t('expenses.notifications.add.success'));
                    handleClose();
                } else {
                    const response = await transactionService.addTransaction(transactionDto)
                    addTransaction(response)
                    success(t('expenses.notifications.add.success'));
                    handleClose();
                }
            } catch {
                error(t('expenses.notifications.add.error'));
            }
        } else {
            try {
                const response = await transactionService.editTransaction(initialTransaction.id, transactionDto)
                updateTransaction(response)
                success(t('expenses.notifications.edit.success'));
                handleClose();
            } catch {
                error(t('expenses.notifications.edit.error'));
            }
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
            <DialogTitle>{initialTransaction ? t('expenses.addExpense.editLabel') : t('expenses.addExpense.addLabel')}</DialogTitle>
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
                    data-testid='description-input'
                    fullWidth
                    margin="normal"
                    label={t('expenses.addExpense.description')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    data-testid='account-input'
                    select
                    fullWidth
                    margin="normal"
                    disabled={!!initialTransaction}
                    //TODO WIELOJEZYCZNOSC
                    label={t('Konto')}
                    value={selectedAccount ? selectedAccount.id : ""}
                    onChange={(e) => {
                        const id = e.target.value as string;
                        const acct = accounts.find(a => a.id === id) ?? null;
                        setSelectedAccount(acct);
                        setCurrency(acct!.currency);
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
                    data-testid='category-input'
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
                {!initialTransaction && (<TextField
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
