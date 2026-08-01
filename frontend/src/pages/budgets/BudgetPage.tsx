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
import BudgetDialog from "./budget/BudgetDialog.tsx";
import BudgetCard from "./budget/BudgetCard.tsx";
import {useNotification} from "../../components/NotificationContext.tsx";
import SmartInvestmentWidget from "./InvestmentWidget.tsx";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GoalCard from "./goal/GoalCard.tsx";
import AddGoalDialog from "./goal/AddGoalDialog.tsx";
import GoalAcceleratorWidget from "./goal/GoalAcceleratorWidget.tsx";
import DepositGoalDialog from "./goal/DepositGoalDialog.tsx";
import type {Budget, FinancialGoal} from "../../types/budget.ts";
import {useBudgetStore} from "../../store/budget-store.ts";
import {useCategoryStore} from "../../store/category-store.ts";
import {useAccountStore} from "../../store/account-store.ts";
import {useGoalStore} from "../../store/goal-store.ts";
import {budgetService} from "../../api/budget-client.ts";
import {useTranslation} from "react-i18next";


const hexToRgba = (hex: string, alpha = 0.2) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const BudgetPage: React.FC = () => {
    const {t} = useTranslation();
    const theme = useTheme();
    const {success, error} = useNotification();

    const budgets = useBudgetStore(state => state.budgets);
    const setBudgets = useBudgetStore(state => state.setBudgets);
    const deleteBudget = useBudgetStore(state => state.deleteBudget);

    const categories = useCategoryStore(state => state.categories);
    const accounts = useAccountStore(state => state.accounts);

    const goals = useGoalStore(state => state.goals);
    const setGoals = useGoalStore(state => state.setGoals)
    const addGoal = useGoalStore(state => state.addGoal);
    const updateGoal = useGoalStore(state => state.updateGoal);

    const [openDialog, setOpenDialog] = useState(false);
    const [editing, setEditing] = useState<Budget | null>(null);
    const [openGoalDialog, setOpenGoalDialog] = useState(false);
    const [depositGoal, setDepositGoal] = useState<FinancialGoal | null>(null);
    const [openDepositDialog, setOpenDepositDialog] = useState(false);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [budgetResponse, goalResponse] = await Promise.all([
                    budgetService.getBudgets(),
                    budgetService.getGoals()
                ]);
                setBudgets(budgetResponse);
                setGoals(goalResponse);
            } catch (e) {
                console.error(e);
            }
        };
        loadAll();
    }, [setBudgets, setGoals]);

    const money = (v: number) =>
        v.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
            // }) + ` ${user?.currency.symbol || ''}`;
        }) + ` zł`;

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

    const handleEdit = (b: Budget) => {
        setEditing(b);
        setOpenDialog(true);
    };

    const handleDelete = async (budget: Budget) => {
        if (!confirm(t('budget.page.delete.confirm'))) return;
        try {
            await budgetService.deleteBudget(budget.id);
            success(t('budget.page.delete.success'))
            deleteBudget(budget)
        } catch (e) {
            console.error(e);
            error(t('budget.page.delete.error'))
        }
    };

    return (
        <Box p={3}>
            {/* HEADER */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight={"bod"} color="secondary">
                        {t('budget.page.label')}
                    </Typography>
                    <Typography variant="body2" sx={{mt: 1}}>
                        {t('budget.page.secondLabel')}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<EmojiEventsIcon/>} onClick={() => setOpenGoalDialog(true)}
                            data-testid='add-goal-button'>
                        {t('goal.page.add.label')}
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => {
                        setEditing(null);
                        setOpenDialog(true);
                    }}>
                        <AddIcon sx={{mr: 1}}/>
                        {t('budget.page.add.label')}
                    </Button>
                </Stack>
            </Stack>

            <Stack spacing={2} mb={3}>
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
                    data-testid='summary-card'
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
                        <Typography variant="subtitle2">
                            {t('budget.page.card1.label')}
                        </Typography>
                        <Typography variant="h5" color="primary"
                                    fontWeight={700}>{money(totals.totalLimit)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('budget.page.card1.text')}
                        </Typography>
                    </CardContent>
                </Card>

                <Card
                    data-testid='summary-card'
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
                        <Typography variant="subtitle2">
                            {t('budget.page.card2.label')}
                        </Typography>
                        <Typography variant="h5" color="error" fontWeight={700}>
                            {money(totals.totalSpent)}
                        </Typography>
                        <Typography variant="caption"
                                    color="text.secondary">{(totals.totalLimit > 0 ? ((totals.totalSpent / totals.totalLimit) * 100).toFixed(1) : 0)}%
                            {t('budget.page.card2.text')}
                        </Typography>
                    </CardContent>
                </Card>

                <Card
                    data-testid='summary-card'
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
                        <Typography variant="subtitle2">
                            {t('budget.page.card3.label')}
                        </Typography>
                        <Typography variant="h5" color="success.main"
                                    fontWeight={700}>{money(totals.remaining)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('budget.page.card3.text')}
                        </Typography>
                    </CardContent>
                </Card>

                <Card
                    data-testid='summary-card'
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
                        <Typography variant="subtitle2">
                            {t('budget.page.card4.label')}
                        </Typography>
                        <Typography variant="h5" color="secondary" fontWeight={700}>
                            {money(totals.avg)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('budget.page.card4.text')}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Budgets by categories */}
            <Card variant="outlined" sx={{p: 2, borderRadius: 2}} data-testid='budget-by-category'>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                {t('budget.page.table.label')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('budget.page.table.secondLabel')}
                            </Typography>
                        </Box>
                        <Button startIcon={<AddIcon/>} color="secondary" variant="contained" onClick={() => {
                            setEditing(null);
                            setOpenDialog(true);
                        }}>
                            {t('budget.page.add.label')}
                        </Button>
                    </Stack>

                    <Box sx={{display: 'grid', gap: 2, gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'}}}>
                        {budgets.length === 0 &&
                            <Typography color="text.secondary">
                                {t('budget.page.table.empty')}
                            </Typography>}
                        {budgets.map((b) => {
                            const cat = categories.find(c => c.name === b.categoryName);
                            return (
                                <BudgetCard key={b.id} budget={b} category={cat} onEdit={handleEdit}
                                            onDelete={handleDelete} currency={"zł"}/>
                            );
                        })}
                    </Box>
                </CardContent>
            </Card>

            {/* Smart Investment Widget */}
            <Box mt={3} data-testid='investment-widget'>
                <SmartInvestmentWidget/>
            </Box>

            {/*Financial Goals*/}
            <Box mb={3}>
                <GoalAcceleratorWidget/>
            </Box>

            <Card variant="outlined" sx={{p: 2, borderRadius: 2, mt: 3}} data-testid='goals-card'>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center"
                                        gap={1}>
                                <EmojiEventsIcon color="warning"/>
                                {t('goal.page.table.label')}
                            </Typography>
                        </Box>
                        <Button variant="outlined" startIcon={<EmojiEventsIcon/>}
                                onClick={() => setOpenGoalDialog(true)}>
                            {t('goal.page.add.label')}
                        </Button>
                    </Stack>
                    {goals.length > 0 && (
                        <Box display="grid" gridTemplateColumns={{xs: '1fr', md: 'repeat(3, 1fr)'}} gap={2}>
                            {goals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} onDeposit={(g) => {
                                    setDepositGoal(g);
                                    setOpenDepositDialog(true);
                                }}/>
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
                // currency={user?.currency.symbol}
                currency={"zł"}
            />

            <AddGoalDialog
                open={openGoalDialog}
                onClose={() => setOpenGoalDialog(false)}
                onSaved={(newGoal) => addGoal(newGoal)}
                accounts={accounts}
                // currency={user?.currency.symbol}
                currency={"zł"}
            />

            <DepositGoalDialog
                open={openDepositDialog}
                onClose={() => setOpenDepositDialog(false)}
                goal={depositGoal}
                accounts={accounts}
                onSuccess={updateGoal}
            />
        </Box>
    );
};

export default BudgetPage;
