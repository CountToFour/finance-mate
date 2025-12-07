import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack
} from "@mui/material";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider, DatePicker} from "@mui/x-date-pickers";
import dayjs, {type Dayjs} from "dayjs";

import {
    createBudget,
    updateBudget,
} from "../../lib/api";
import type {Budget, BudgetDto, Category, Currency} from "../../lib/types";
import {useTranslation} from "react-i18next";
import {useNotification} from "../../components/NotificationContext.tsx";


const BudgetDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    categories: Category[];
    initial?: Budget | null;
    onSaved: (saved: Budget) => void;
    currency?: Currency | null;
}> = ({open, onClose, categories, initial, onSaved, currency}) => {
    const {success, error} = useNotification();
    const {t} = useTranslation();
    const isEdit = !!initial;
    const [category, setCategory] = useState<Category | null>(null);
    const [limitAmount, setLimitAmount] = useState<string>(initial ? String(initial.limitAmount) : "");
    const [periodType, setPeriodType] = useState<string>(initial ? initial.periodType : "MONTHLY");
    const [startDate, setStartDate] = useState<Dayjs | null>(initial ? dayjs(initial.startDate) : dayjs());
    const [endDate, setEndDate] = useState<Dayjs | null>(initial ? dayjs(initial.endDate) : dayjs().endOf("month"));
    // const [color, setColor] = useState<string>(initial ? (categories.find(c => c.name === initial.categoryName)?.color ?? "#6b7280") : "#6b7280");
    const [saving, setSaving] = useState(false);

    const [errors, setErrors] = useState({
        limitAmount: "",
        category: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        if (initial) {
            setLimitAmount(String(initial.limitAmount));
            setPeriodType(initial.periodType);
            setStartDate(dayjs(initial.startDate));
            setEndDate(dayjs(initial.endDate));
            if ((initial as Budget).categoryName) {
                const cat = categories.find(c => c.name === (initial as Budget).categoryName);
                if (cat) setCategory(cat);
            }
            // setColor(cat?.color ?? "#6b7280");
        } else {
            setCategory(null);
            setLimitAmount("");
            setPeriodType("MONTHLY");
            setStartDate(dayjs());
            setEndDate(dayjs().endOf("month"));
        }
    }, [initial, categories, open]);

    const validate = () => {
        let valid = true;
        const newErrors = {limitAmount: "", category: "", startDate: "", endDate: "",};

        if (!limitAmount || parseFloat(limitAmount) <= 0.01) {
            newErrors.limitAmount = t('expenses.addExpense.price.required');
            valid = false;
        }
        if (!category) {
            newErrors.category = t('expenses.addExpense.category.required');
            valid = false;
        }

        if (!startDate) {
            newErrors.startDate = 'Wybierz datę rozpoczęcia';
            valid = false;
        }

        if (!endDate) {
            newErrors.endDate = 'Wybierz datę zakończenia';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        const dto: BudgetDto = {
            categoryId: category!.id,
            limitAmount: parseFloat(limitAmount),
            periodType: periodType,
            startDate: startDate!.format("YYYY-MM-DD"),
            endDate: endDate!.format("YYYY-MM-DD"),
            // color,
        };

        try {
            if (isEdit && initial) {
                const res = await updateBudget(dto, initial.id);
                onSaved(res.data);
                success("Udało się edytować budżet")
            } else {
                const res = await createBudget(dto);
                success("Udało się dodać budżetu")
                onSaved(res.data);
            }
            onClose();
        } catch (e) {
            console.error(e);
            error("Nie udało się zapisać budżetu")
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{isEdit ? "Edytuj budżet" : "Nowy budżet"}</DialogTitle>
            <DialogContent dividers>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                        <DatePicker
                            disablePast={true}
                            label="Start"
                            value={startDate}
                            onChange={(v) => setStartDate(v as Dayjs | null)}
                            slotProps={{textField: {fullWidth: true}}}
                        />
                        <DatePicker
                            disablePast={true}
                            label="Koniec"
                            value={endDate}
                            onChange={(v) => setEndDate(v as Dayjs | null)}
                            slotProps={{textField: {fullWidth: true}}}
                        />
                    </Stack>
                </LocalizationProvider>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        mt: 2,
                        alignItems: 'center'
                    }}
                >
                    <TextField
                        select
                        label="Okres"
                        value={periodType}
                        onChange={(e) => setPeriodType(e.target.value)}
                        fullWidth
                        sx={{ flex: 1 }}
                    >
                        <MenuItem value="MONTHLY">Miesięczny</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        label={t('expenses.addExpense.price.label')}
                        type="number"
                        value={limitAmount}
                        onChange={(e) => {
                            setLimitAmount(e.target.value)
                            if (e.target.value.length > 0) {
                                setErrors({...errors, limitAmount: ""})
                            }
                        }
                        }
                        error={!!errors.limitAmount}
                        helperText={errors.limitAmount}
                        sx={{flex: 1}}
                    />
                    <TextField
                        fullWidth
                        label={"Waluta"}
                        value={currency ?? ""}
                        disabled
                        sx={{flex: 0.5}}
                    />
                </Box>

                <Box sx={{display: 'flex', gap: 2, mb: 1}}>
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
                </Box>

                {/*<Stack direction="row" spacing={2} alignItems="center">*/}
                {/*    <TextField*/}
                {/*        label="Kolor"*/}
                {/*        type="color"*/}
                {/*        value={color}*/}
                {/*        onChange={(e) => setColor(e.target.value)}*/}
                {/*        sx={{ width: 80 }}*/}
                {/*    />*/}
                {/*    <Typography variant="body2">Podgląd koloru</Typography>*/}
                {/*    <Box sx={{ width: 32, height: 24, background: color, borderRadius: 1, border: "1px solid #ccc" }} />*/}
                {/*</Stack>*/}
            </DialogContent>

            <DialogActions sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2}}>
                <Button onClick={onClose} color="secondary">Anuluj</Button>
                <Button onClick={handleSave} variant="contained" color="primary"
                        disabled={saving}>{isEdit ? 'Zapisz' : 'Utwórz'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BudgetDialog;
