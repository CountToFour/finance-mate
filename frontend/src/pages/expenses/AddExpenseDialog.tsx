import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import {useNotification} from "../../components/NotificationContext.tsx";
import {useAuthStore} from "../../store/auth.ts";
import type {ExpenseDto} from "../../lib/types.ts";
import {addExpense} from "../../lib/api.ts";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";


interface AddExpenseDialogProps {
    open: boolean;
    onClose: () => void;
}

const categories = ["Jedzenie", "Transport", "Zakupy", "Rozrywka", "Inne"];

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({ open, onClose}) => {
    const { success, error } = useNotification(); // 🔹 notyfikacje
    const user = useAuthStore(s => s.user);
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");

    const [errors, setErrors] = useState({
        description: "",
        amount: "",
        category: "",
    });

    const validate = () => {
        let valid = true;
        const newErrors = { description: "", amount: "", category: "" };

        if (!description.trim()) {
            newErrors.description = "Opis jest wymagany";
            valid = false;
        }
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
            expenseDate: date?.format("YYYY-MM-DD"), // lub date.toISOString()
            periodType: "NONE",
        };

        addExpense(expenseDto)
            .then(() => {
                success("Wydatek został pomyślnie dodany!");
                handleClose();
            })
            .catch(() => {
                error("Nie udało się dodać wydatku. Spróbuj ponownie.");
            });
    };

    const handleClose = () => {
        setDescription("");
        setAmount("");
        setCategory("");
        setErrors({ description: "", amount: "", category: "" });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Dodaj wydatek</DialogTitle>
            <DialogContent dividers>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Data"
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                    />
                </LocalizationProvider>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Opis"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Kwota"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={!!errors.amount}
                    helperText={errors.amount}
                />
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Kategoria"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    error={!!errors.category}
                    helperText={errors.category}
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                            {cat}
                        </MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions>
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
