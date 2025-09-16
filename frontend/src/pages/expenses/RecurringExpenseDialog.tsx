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
import {useAuthStore} from "../../store/auth.ts";
import type {ExpenseDto, RecurringExpense} from "../../lib/types.ts";
import {editExpense} from "../../lib/api.ts";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";


interface AddExpenseDialogProps {
    open: boolean;
    onClose: () => void;
    recurringExpense?: RecurringExpense;
}

//TODO JAK PONIŻEJ
const categories = ["Jedzenie", "Transport", "Zakupy", "Rozrywka", "Inne"];
//TODO ZROBIĆ Z TEGO ENUM W types.ts I ROZWAŻYĆ CUSTOM PERIOD
const periodTypes = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly"
}

type PeriodType = keyof typeof periodTypes;

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({open, onClose, recurringExpense}) => {
    const {success, error} = useNotification();
    const user = useAuthStore(s => s.user);
    const [date, setDate] = useState<Dayjs>();
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [periodType, setPeriodType] = useState<PeriodType | "">(recurringExpense?.periodType as PeriodType ?? "");
    const [active, setActive] = useState<boolean>();

    const [errors, setErrors] = useState({
        amount: "",
        category: "",
    });

    useEffect(() => {
        if (recurringExpense) {
            setDescription(recurringExpense.description ?? null);
            setAmount(recurringExpense.price.toString());
            setCategory(recurringExpense.category);
            setDate(dayjs(recurringExpense.expenseDate));
            setActive(recurringExpense.active);
        }
    }, [recurringExpense])


    const validate = () => {
        let valid = true;
        const newErrors = {description: "", amount: "", category: ""};

        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = "Kwota musi być większa od 0";
            valid = false;
        }
        if (!category) {
            newErrors.category = "Wybierz kategorię";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = () => {
        if (!validate()) return;

        const expenseDto: ExpenseDto = {
            userId: user?.id,
            category: category,
            price: parseFloat(amount),
            description: description,
            expenseDate: date?.format("YYYY-MM-DD"),
            periodType: periodType,
            active: active
        };

        if (recurringExpense) {
            editExpense(recurringExpense?.id, expenseDto)
                .then(() => {
                    success("Wydatek został pomyślnie edytowany!");
                    handleClose();
                })
                .catch(() => {
                    error("Nie udało się edytować wydatku. Spróbuj ponownie.");
                });
        }
    };

    const handleClose = () => {
        setErrors({amount: "", category: ""});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>{"Edytuj wydatekek okresowy"}</DialogTitle>
            <DialogContent dividers>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"},
                        gap: 2,
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Data"
                            value={date}
                            onChange={(newValue) => setDate(newValue)}
                            slotProps={{textField: {fullWidth: true}}}
                            format={"DD-MM-YYYY"}
                            disablePast={true}
                        />
                    </LocalizationProvider>
                    <TextField
                        fullWidth
                        label="Kwota"
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
                    />
                </Box>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Opis"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Kategoria"
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value)
                        setErrors({...errors, category: ""})
                    }
                    }
                    error={!!errors.category}
                    helperText={errors.category}
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                            {cat}
                        </MenuItem>
                    ))}
                </TextField>
                <Box display="flex" gap={2}>
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Repeat"
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
                        label={active ? "Active" : "Inactive"}
                        sx={{ minWidth: "110px"}}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{mr: 2, mb: 1, mt: 1}}>
                <Button onClick={handleClose} color="secondary">
                    Anuluj
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Zapisz
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddExpenseDialog;
