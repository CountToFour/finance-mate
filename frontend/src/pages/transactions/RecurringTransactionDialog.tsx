import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem, Box, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs, {Dayjs} from "dayjs";
import {useNotification} from "../../components/NotificationContext.tsx";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useTranslation} from "react-i18next";
import {
    getPeriodTypes, type PeriodType,
    type RecurringTransaction,
    type TransactionDto,
    type TransactionType
} from "../../types/transaction.ts";
import type {Account} from "../../types/account.ts";
import type {Category} from "../../types/category.ts";
import {transactionService} from "../../api/transaction-client.ts";
import {useRecurringTransactionStore} from "../../store/recurring-transaction-store.ts";


interface AddTransactionDialogProps {
    open: boolean;
    onClose: () => void;
    recurringTransaction: RecurringTransaction | null;
    accounts: Account[];
    categories: Category[];
}

const RecurringTransactionDialog: React.FC<AddTransactionDialogProps> = ({open, onClose, recurringTransaction, accounts, categories}) => {
    const {success, error} = useNotification();
    const {t} = useTranslation();
    const [date, setDate] = useState<Dayjs>();
    const [description, setDescription] = useState<string>("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<Category | null>(null);
    // const [currency, setCurrency] = useState<Currency | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [periodType, setPeriodType] = useState<PeriodType>(recurringTransaction?.periodType as PeriodType);
    const [type] = useState<TransactionType>(recurringTransaction?.transactionType ? recurringTransaction.transactionType : "EXPENSE");

    const periodTypes = getPeriodTypes(t)

    const [errors, setErrors] = useState({
        amount: "",
        category: "",
        account: "",
    });

    const updateRecurringTransaction = useRecurringTransactionStore(state => state.update)

    useEffect(() => {
        if (recurringTransaction) {
            setDescription(recurringTransaction.description ?? "");
            setAmount(Math.abs(recurringTransaction.price).toString());
            setDate(dayjs(recurringTransaction.createdAt));
            setPeriodType(recurringTransaction.periodType as PeriodType);

            if (recurringTransaction.categoryName) {
                const cat = categories.find(c => c.name === recurringTransaction.categoryName);
                if (cat) setCategory(cat);
            }

            if (recurringTransaction.accountName) {
                const acct = accounts.find(a => a.name === recurringTransaction.accountName);
                if (acct) {
                    setSelectedAccount(acct);
                    // setCurrency(acct.currency);
                }
            }
        }
    }, [accounts, categories, recurringTransaction])


    const validate = () => {
        let valid = true;
        const newErrors = {description: "", amount: "", category: "", account: ""};

        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = t('transactions.add.price.required');
            valid = false;
        }
        if (!category) {
            newErrors.category = t('transactions.add.category.required');
            valid = false;
        }
        if (!selectedAccount) {
            newErrors.account = t('transactions.add.account.required') || 'Wybierz konto';
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
            transactionType: recurringTransaction?.transactionType,
        };

        if (recurringTransaction) {
            try {
                const response = await transactionService.editRecurringTransaction(recurringTransaction.id, transactionDto)
                updateRecurringTransaction(response)
                success(t('transactions.notifications.edit.success'));
                handleClose();
            } catch {
                error(t('transactions.notifications.edit.error'));
            }
        }
    };

    const handleClose = () => {
        setErrors({amount: "", category: "", account: ""});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <DialogTitle>{t('transactions.recurringTransaction.label')}</DialogTitle>
                <ToggleButtonGroup
                    value={type}
                    exclusive
                    size="small"
                    sx={{mr: 3}}
                    disabled={!!recurringTransaction}
                >
                    <ToggleButton value={'EXPENSE'}>
                        {t('transactions.add.expense')}
                    </ToggleButton>
                    <ToggleButton value={'INCOME'}>
                        {t('transactions.add.income')}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
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
                            label={t('transactions.add.date')}
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
                        label={t('transactions.add.price.label')}
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
                        label={t('transactions.add.currency.label')}
                        // value={currency?.symbol ?? ""}
                        value={""}
                        disabled
                        sx={{flex: 0.5}}
                    />
                </Box>
                <TextField
                    fullWidth
                    margin="normal"
                    label={t('transactions.add.description')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label={t('transactions.add.account.label')}
                    value={selectedAccount ? selectedAccount.id : ""}
                    onChange={(e) => {
                        const id = e.target.value as string;
                        const acct = accounts.find(a => a.id === id) ?? null;
                        setSelectedAccount(acct);
                        // setCurrency(acct?.currency);
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
                    label={t('transactions.add.category.label')}
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
                        label={t('transactions.add.repeat')}
                        value={periodType}
                        onChange={(e) => setPeriodType(
                            e.target.value as keyof typeof periodTypes
                        )}
                    >
                        {Object.entries(periodTypes)
                            .filter(([key]) => key !== 'NONE')
                            .map(([key, label]) => (
                            <MenuItem key={key} value={key}>
                                {label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions sx={{mr: 2, mb: 1, mt: 1}}>
                <Button onClick={handleClose} color="secondary">
                    {t('transactions.add.cancel')}
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    {t('transactions.add.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecurringTransactionDialog;
