import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

import {
    createBudget,
    updateBudget,
} from "../../lib/api";
import type { Budget, BudgetDto, Category} from "../../lib/types";


const BudgetDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    categories: Category[];
    initial?: Budget | null;
    onSaved: (saved: Budget) => void;
}> = ({ open, onClose, categories, initial, onSaved }) => {
    const isEdit = !!initial;
    const [categoryId, setCategoryId] = useState<string>(initial ? "" : "");
    const [limitAmount, setLimitAmount] = useState<number>(initial ? initial.limitAmount : 0);
    const [periodType, setPeriodType] = useState<string>(initial ? initial.periodType : "MONTH");
    const [startDate, setStartDate] = useState<any>(initial ? dayjs(initial.startDate) : dayjs());
    const [endDate, setEndDate] = useState<any>(initial ? dayjs(initial.endDate) : dayjs().endOf("month"));
    const [color, setColor] = useState<string>(initial ? (categories.find(c => c.name === initial.categoryName)?.color ?? "#6b7280") : "#6b7280");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initial) {
            setLimitAmount(initial.limitAmount);
            setPeriodType(initial.periodType);
            setStartDate(dayjs(initial.startDate));
            setEndDate(dayjs(initial.endDate));
            const cat = categories.find(c => c.name === initial.categoryName);
            setCategoryId(cat?.id ?? "");
            setColor(cat?.color ?? "#6b7280");
        } else {
            setCategoryId("");
            setLimitAmount(0);
            setPeriodType("MONTH");
            setStartDate(dayjs());
            setEndDate(dayjs().endOf("month"));
        }
    }, [initial, categories, open]);

    const handleSave = async () => {
        if (!categoryId) return alert("Wybierz kategorię");
        setSaving(true);
        const dto: BudgetDto = {
            categoryId,
            limitAmount,
            periodType,
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
            color,
        };

        try {
            if (isEdit && initial) {
                const res = await updateBudget(dto, initial.id);
                onSaved(res.data);
            } else {
                const res = await createBudget(dto);
                onSaved(res.data);
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert("Błąd zapisu budżetu");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? "Edytuj budżet" : "Nowy budżet"}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField
                        select
                        label="Kategoria"
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value);
                            const cat = categories.find(c => c.id === e.target.value);
                            if (cat) setColor(cat.color);
                        }}
                        fullWidth
                    >
                        {categories.map(c => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Limit (PLN)"
                        type="number"
                        value={limitAmount}
                        onChange={(e) => setLimitAmount(Number(e.target.value))}
                        fullWidth
                    />

                    <TextField
                        select
                        label="Okres"
                        value={periodType}
                        onChange={(e) => setPeriodType(e.target.value)}
                    >
                        <MenuItem value="MONTH">Miesięczny</MenuItem>
                        <MenuItem value="WEEK">Tygodniowy</MenuItem>
                        <MenuItem value="YEAR">Roczny</MenuItem>
                    </TextField>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Stack direction="row" spacing={2}>
                            <DatePicker
                                label="Start"
                                value={startDate}
                                onChange={(v) => setStartDate(v)}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                            <DatePicker
                                label="Koniec"
                                value={endDate}
                                onChange={(v) => setEndDate(v)}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Stack>
                    </LocalizationProvider>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            label="Kolor"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            sx={{ width: 80 }}
                        />
                        <Typography variant="body2">Podgląd koloru</Typography>
                        <Box sx={{ width: 32, height: 24, background: color, borderRadius: 1, border: "1px solid #ccc" }} />
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Anuluj</Button>
                <Button onClick={handleSave} variant="contained" disabled={saving}>
                    {isEdit ? "Zapisz" : "Utwórz"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BudgetDialog;