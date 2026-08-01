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
import {useTranslation} from "react-i18next";
import {useNotification} from "../../../components/NotificationContext.tsx";
import type {Category} from "../../../types/category.ts";
import type {Budget, BudgetDto, UpdateBudgetDto} from "../../../types/budget.ts";
import {budgetService} from "../../../api/budget-client.ts";
import {useBudgetStore} from "../../../store/budget-store.ts";

interface BudgetDialogProps {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    initial?: Budget | null;
    // currency?: Currency | null;
    currency?: string | null;
}

const BudgetDialog: React.FC<BudgetDialogProps> = ({open, onClose, categories, initial, currency}) => {
    const {success, error} = useNotification();
    const {t} = useTranslation();
    const isEdit = !!initial;
    const [category, setCategory] = useState<Category | null>(null);
    const [limitAmount, setLimitAmount] = useState<string>(initial ? String(initial.limitAmount) : "");

    const [startDate, setStartDate] = useState<Dayjs | null>(initial ? dayjs(initial.startDate) : dayjs());
    const [endDate, setEndDate] = useState<Dayjs | null>(initial ? dayjs(initial.endDate) : dayjs().add(1, "month"));
    const [saving, setSaving] = useState(false);

    const budgets = useBudgetStore(state => state.budgets);
    const addBudget = useBudgetStore(state => state.addBudget);
    const updateBudget = useBudgetStore(state => state.updateBudget);

    const [errors, setErrors] = useState({
        limitAmount: "",
        category: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        if (initial) {
            setLimitAmount(String(initial.limitAmount));
            setStartDate(dayjs(initial.startDate));
            setEndDate(dayjs(initial.endDate));
            if (initial.categoryName) {
                const cat = categories.find(c => c.name === (initial as Budget).categoryName);
                if (cat) setCategory(cat);
            }
        } else {
            setCategory(null);
            setLimitAmount("");
            setStartDate(dayjs());
            setEndDate(dayjs().add(1, "month"));
        }
    }, [initial, categories, open]);

    const validate = () => {
        let valid = true;
        const newErrors = {limitAmount: "", category: "", startDate: "", endDate: "",};

        if (!limitAmount || parseFloat(limitAmount) <= 0.01) {
            newErrors.limitAmount = t('budget.dialog.limitAmount.required');
            valid = false;
        }
        if (!category) {
            newErrors.category = t('budget.dialog.category.required');
            valid = false;
        }

        if (!startDate) {
            newErrors.startDate = t('budget.dialog.startDate.required');
            valid = false;
        }

        if (!endDate) {
            newErrors.endDate = t('budget.dialog.endDate.required');
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = async () => {
        if (!validate()) return;

        let repeated = false;
        if (!initial) {
            budgets.forEach((b) => {
                if (b.categoryName === category?.name && dayjs(b.endDate).isAfter(startDate)) {
                    error(t('budget.dialog.category.exists'))
                    repeated = true
                    return;
                }
            })
        }
        if (repeated) return;
        setSaving(true);
        try {
            if (isEdit && initial) {
                const updateDto: UpdateBudgetDto = {
                    limitAmount: parseFloat(limitAmount),
                    startDate: startDate!.format("YYYY-MM-DD"),
                    endDate: endDate!.format("YYYY-MM-DD"),
                };
                const res = await budgetService.updateBudget(initial.id, updateDto);
                updateBudget(res)
                success(t('budget.page.edit.success'));
            } else {
                const dto: BudgetDto = {
                    categoryId: category!.id,
                    limitAmount: parseFloat(limitAmount),
                    startDate: startDate!.format("YYYY-MM-DD"),
                    endDate: endDate!.format("YYYY-MM-DD"),
                };
                const res = await budgetService.createBudget(dto);
                addBudget(res)
                success(t('budget.page.add.success'))
            }
            onClose();
        } catch {
            error(t('budget.page.add.error'))
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>
                {isEdit ? t('budget.dialog.edit.label') : t('budget.dialog.add.label')}
            </DialogTitle>
            <DialogContent dividers>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                        <DatePicker
                            disablePast={true}
                            label={t('budget.dialog.startDate.label')}
                            value={startDate}
                            onChange={(v) => setStartDate(v as Dayjs | null)}
                            slotProps={{textField: {fullWidth: true}}}
                        />
                        <DatePicker
                            disablePast={true}
                            label={t('budget.dialog.endDate.label')}
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
                        fullWidth
                        label={t('budget.dialog.limitAmount.label')}
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
                        label={t('budget.dialog.currency.label')}
                        value={currency ?? ""}
                        disabled
                        sx={{flex: 0.5}}
                    />
                </Box>

                <Box sx={{display: 'flex', gap: 2, mb: 1}}>
                    <TextField
                        disabled={!!initial}
                        select
                        fullWidth
                        margin="normal"
                        label={t('budget.dialog.category.label')}
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
                        {categories.filter(c => c.transactionType === "EXPENSE").map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>

            <DialogActions sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2}}>
                <Button onClick={onClose} color="secondary">{t('budget.dialog.cancel')}</Button>
                <Button onClick={handleSave} variant="contained" color="primary"
                        disabled={saving}>{t('budget.dialog.save')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BudgetDialog;
