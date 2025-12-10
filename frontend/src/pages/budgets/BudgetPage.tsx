import React, {useEffect, useMemo, useState} from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Stack,
    useTheme
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";

import {
    getBudgets,
    deleteBudget,
    getCategories, getGoals,
} from "../../lib/api";
import type {Budget, Category, FinancialGoal} from "../../lib/types";
import BudgetDialog from "./BudgetDialog.tsx";
import BudgetCard from "./BudgetCard.tsx";
import {useNotification} from "../../components/NotificationContext.tsx";
import SmartInvestmentWidget from "./InvestmentWidget.tsx";
import {useAuthStore} from "../../store/auth.ts";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GoalCard from "./GoalCard.tsx";
import AddGoalDialog from "./AddGoalDialog.tsx";


const hexToRgba = (hex: string, alpha = 0.2) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const BudgetPage: React.FC = () => {
    const theme = useTheme();
    const {user} = useAuthStore();

    const {success, error} = useNotification();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editing, setEditing] = useState<Budget | null>(null);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [openGoalDialog, setOpenGoalDialog] = useState(false);

    const loadAll = async () => {
        try {
            const [bRes, cRes, goalsRes] = await Promise.all([
                getBudgets(),
                getCategories("EXPENSE"),
                getGoals()
            ]);
            setBudgets(bRes.data);
            setCategories(cRes.data);
            setGoals(goalsRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const money = (v: number) =>
        v.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + ` ${user?.currency.symbol || ''}`;

    const totals = useMemo(() => {
        const totalLimit = budgets.reduce((s, b) => s + b.limitAmount, 0);
        const totalSpent = budgets.reduce((s, b) => s + b.spentAmount, 0);
        const remaining = Math.max(totalLimit - totalSpent, 0);
        const dailyAllowance = budgets.reduce((sum, budget) => {
            const budgetRemaining = Math.max(budget.limitAmount - budget.spentAmount, 0);
            const end = dayjs(budget.endDate).endOf('day');
            const now = dayjs();

            const daysLeft = Math.max(end.diff(now, 'day') + 1, 1);

            return sum + (budgetRemaining / daysLeft);
        }, 0);

        return {
            totalLimit,
            totalSpent,
            remaining,
            avg: Math.floor(dailyAllowance)
        };
    }, [budgets]);

    const handleSavedBudget = (saved: Budget) => {
        setBudgets(prev => {
            const exist = prev.find(p => p.id === saved.id);
            if (exist) {
                return prev.map(p => (p.id === saved.id ? saved : p));
            }
            return [saved, ...prev];
        });
    };

    const handleEdit = (b: Budget) => {
        setEditing(b);
        setOpenDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Usunąć budżet?")) return;
        try {
            await deleteBudget(id);
            success("Operacja zakończona powodzeniem")
            setBudgets(prev => prev.filter(b => b.id !== id));
        } catch (e) {
            console.error(e);
            error("Operacja zakończona niepowodzeniem")
        }
    };

    return (
        <Box p={3}>
            {/* HEADER */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight={"bod"} color="secondary">Budżet</Typography>
                    <Typography variant="body2" sx={{mt: 1}}>Planuj i kontroluj swoje wydatki według
                        kategorii</Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<EmojiEventsIcon/>} onClick={() => setOpenGoalDialog(true)}>
                        Dodaj cel
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => {
                        setEditing(null);
                        setOpenDialog(true);
                    }}>
                        <AddIcon sx={{mr: 1}}/> Ustaw budżet
                    </Button>
                </Stack>
            </Stack>

            {/* Alerts (proste reguły) */}
            <Stack spacing={2} mb={3}>
                {/* przykładowe reguły */}
                {budgets.some(b => b.spentAmount > b.limitAmount) && (
                    <Card variant="outlined" sx={{borderColor: "error.light", background: hexToRgba("#ffcccc", 0.4)}}>
                        <CardContent>
                            <Typography fontWeight={700}>Przekroczono budżet!</Typography>
                            <Typography
                                variant="body2">Kategorie: {budgets.filter(b => b.spentAmount > b.limitAmount).map(b => b.categoryName).join(", ")}</Typography>
                        </CardContent>
                    </Card>
                )}

                {budgets.some(b => b.spentAmount / b.limitAmount > 0.8 && b.spentAmount / b.limitAmount <= 1) && (
                    <Card variant="outlined" sx={{borderColor: "warning.light", background: hexToRgba("#fff4cc", 0.4)}}>
                        <CardContent>
                            <Typography fontWeight={700}>Ostrzeżenie!</Typography>
                            <Typography variant="body2">Zbliżasz się do limitu w
                                kategoriach: {budgets.filter(b => b.spentAmount / b.limitAmount > 0.8 && b.spentAmount / b.limitAmount <= 1).map(b => b.categoryName).join(", ")}</Typography>
                        </CardContent>
                    </Card>
                )}
            </Stack>

            {/* Summary cards */}
            <Box display="grid" gridTemplateColumns={{xs: '1fr', sm: 'repeat(4, 1fr)'}} gap={2} mb={3}>
                <Card
                    variant="outlined"
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        borderLeft: `6px solid ${theme.palette.primary.main}`,
                    }}
                >
                    <CardContent>
                        <Typography variant="subtitle2">Całkowity budżet</Typography>
                        <Typography variant="h5" color="primary"
                                    fontWeight={700}>{money(totals.totalLimit)}</Typography>
                        <Typography variant="caption" color="text.secondary">Miesięczny limit wydatków</Typography>
                    </CardContent>
                </Card>

                <Card
                    variant="outlined"
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        borderLeft: `6px solid ${theme.palette.error.main}`,
                    }}
                >
                    <CardContent>
                        <Typography variant="subtitle2">Wydano</Typography>
                        <Typography variant="h5" color="error" fontWeight={700}>{money(totals.totalSpent)}</Typography>
                        <Typography variant="caption"
                                    color="text.secondary">{(totals.totalLimit > 0 ? ((totals.totalSpent / totals.totalLimit) * 100).toFixed(1) : 0)}%
                            budżetu wykorzystane</Typography>
                    </CardContent>
                </Card>

                <Card
                    variant="outlined"
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        borderLeft: `6px solid ${theme.palette.success.main}`,
                    }}
                >
                    <CardContent>
                        <Typography variant="subtitle2">Pozostało</Typography>
                        <Typography variant="h5" color="success.main"
                                    fontWeight={700}>{money(totals.remaining)}</Typography>
                        <Typography variant="caption" color="text.secondary">Do końca miesiąca</Typography>
                    </CardContent>
                </Card>

                <Card
                    variant="outlined"
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        borderLeft: `6px solid ${theme.palette.secondary.main}`,
                    }}
                >
                    <CardContent>
                        <Typography variant="subtitle2">Średnia dzienna</Typography>
                        <Typography variant="h5" color="secondary" fontWeight={700}>{money(totals.avg)}</Typography>
                        <Typography variant="caption" color="text.secondary">Na pozostałe dni</Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Budgets by categories */}
            <Card variant="outlined" sx={{p: 2, borderRadius: 2}}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>Budżet wg kategorii</Typography>
                            <Typography variant="body2" color="text.secondary">Postęp wydatków w poszczególnych
                                kategoriach</Typography>
                        </Box>
                        <Button startIcon={<AddIcon/>} color="secondary" variant="contained" onClick={() => {
                            setEditing(null);
                            setOpenDialog(true);
                        }}>Dodaj budżet</Button>
                    </Stack>

                    <Box sx={{display: 'grid', gap: 2, gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'}}}>
                        {budgets.length === 0 &&
                            <Typography color="text.secondary">Brak ustawionych budżetów — dodaj nowy budżet, aby zacząć
                                monitorować wydatki</Typography>}
                        {budgets.map((b) => {
                            const cat = categories.find(c => c.name === b.categoryName);
                            return (
                                <BudgetCard key={b.id} budget={b} category={cat} onEdit={handleEdit}
                                            onDelete={handleDelete} currency={user?.currency.symbol}/>
                            );
                        })}
                    </Box>
                </CardContent>
            </Card>

            {/* Smart Investment Widget */}
            <Box mt={3}>
                <SmartInvestmentWidget/>
            </Box>

            <Card variant="outlined" sx={{p: 2, borderRadius: 2, mt: 3}}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
                        <EmojiEventsIcon color="warning"/> Twoje Cele Finansowe
                    </Typography>
                    {goals.length > 0 && (
                        <Box display="grid" gridTemplateColumns={{xs: '1fr', md: 'repeat(3, 1fr)'}} gap={2}>
                            {goals.map(goal => (
                                <GoalCard key={goal.id} goal={goal}/>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>


            {/* Dialog */}
            <BudgetDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                categories={categories}
                initial={editing}
                onSaved={handleSavedBudget}
                currency={user?.currency.symbol}
            />

            <AddGoalDialog
                open={openGoalDialog}
                onClose={() => setOpenGoalDialog(false)}
                onSaved={(newGoal) => setGoals(prev => [...prev, newGoal])}
            />
        </Box>
    );
};

export default BudgetPage;
