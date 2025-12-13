import React, {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Stack,
    Divider,
    List,
    ListItem,
    ListItemText,
    useTheme
} from '@mui/material';
import {useAuthStore} from "../../store/auth.ts";
import {
    getAccounts,
    getAllCategoriesAmount,
    getCategories, getDailyOverview,
    getExpenses, getSpendingAuditor, getUserBalance
} from "../../lib/api.ts";
import type {Account, Category, CategoryAmount, DailyOverview, Expense, SpendingStructure} from "../../lib/types.ts";
import dayjs from "dayjs";
import 'dayjs/locale/pl';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AuditorWidget from "./AuditorWidget.tsx";
import CashFlowWidget from "./CashFlowWidget.tsx";
import HealthScoreWidget from "./HealthScoreWidget.tsx";

dayjs.locale('pl');

function Dashboard() {
    const {user} = useAuthStore();
    const theme = useTheme();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
    const [categoryAmounts, setCategoryAmounts] = useState<CategoryAmount[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [weeklyExpenses, setWeeklyExpenses] = useState<{ day: string; amount: number; fullDate: string }[]>([]);
    const [totalBalance, setTotalBalance] = useState<{ amount: number, currency: string }>({amount: 0, currency: ''});
    const [auditorData, setAuditorData] = useState<SpendingStructure | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const today = dayjs();
            const startOfMonth = today.startOf('month').format('YYYY-MM-DD');
            const endOfMonth = today.endOf('month').format('YYYY-MM-DD');
            const startOfLast7Days = today.subtract(6, 'day').format('YYYY-MM-DD');
            const formattedToday = today.format('YYYY-MM-DD');

            try {
                const accountsRes = await getAccounts();
                setAccounts(accountsRes.data);

                const balanceRes = await getUserBalance();
                setTotalBalance({
                    amount: balanceRes.data.balance,
                    currency: balanceRes.data.currency
                });

                const weeklyRes = await getDailyOverview(startOfLast7Days, formattedToday, 'EXPENSE');
                processWeeklyData(weeklyRes.data);

                const recentRes = await getExpenses(null, startOfMonth, formattedToday);
                const sorted = recentRes.data.sort((a: Expense, b: Expense) =>
                    dayjs(b.createdAt).diff(dayjs(a.createdAt))
                );
                setRecentExpenses(sorted.slice(0, 5));

                const catAmountRes = await getAllCategoriesAmount('EXPENSE', startOfMonth, endOfMonth);
                const sortedCats = catAmountRes.data.sort((a: CategoryAmount, b: CategoryAmount) => b.amount - a.amount);
                setCategoryAmounts(sortedCats);
                const catsRes = await getCategories('EXPENSE');
                setAllCategories(catsRes.data);
                const auditorRes = await getSpendingAuditor();
                setAuditorData(auditorRes.data);
                console.log('Auditor ' + auditorRes);
            } catch (error) {
                console.error("Błąd podczas pobierania danych do dashboardu:", error);
            }
        };

        fetchData();
    }, []);


    const processWeeklyData = (data: DailyOverview[]) => {
        const chartData = data.map(item => {
            let dayName = dayjs(item.date).format('ddd');
            dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
            return {
                day: dayName,
                fullDate: item.date,
                amount: item.amount
            };
        });
        setWeeklyExpenses(chartData);
    };

    const hexToRgba = (hex: string, alpha: number) => {
        if (!hex) return `rgba(0,0,0,${alpha})`;
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const formatMoney = (amount: number) =>
        amount.toLocaleString('pl-PL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + ` ${user?.currency.symbol}`;

    const weeklyStats = useMemo(() => {
        const total = weeklyExpenses.reduce((sum, item) => sum + item.amount, 0);
        const avg = weeklyExpenses.length > 0 ? Math.round(total / weeklyExpenses.length) : 0;

        let maxItem = {day: '-', amount: 0, fullDate: ''};
        if (weeklyExpenses.length > 0) {
            maxItem = weeklyExpenses.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
        }

        const maxDayFull = maxItem.fullDate ? dayjs(maxItem.fullDate).format('dddd') : '-';
        const maxDayCapitalized = maxDayFull.charAt(0).toUpperCase() + maxDayFull.slice(1);

        return {avg, maxDay: maxDayCapitalized, maxAmount: maxItem.amount};
    }, [weeklyExpenses]);

    const findTransactionCurrency = (transaction: Expense) => {
        const account = accounts.find(a => a.name === transaction.accountName);
        const symbol = account?.currency?.symbol ?? '';
        return symbol
    }

    return (
        <Box sx={{minHeight: '100vh', p: 3}}>

            {/* --- HEADER --- */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" color="secondary">Dashboard Finansowy</Typography>
                    <Typography variant="body2" sx={{mt: 1}}>Witaj {user?.username}, oto przegląd Twoich
                        finansów</Typography>
                </Box>
            </Stack>

            {/* --- KAFELKI KONT --- */}
            <Grid container spacing={2} mb={4}>
                {accounts.map((account) => (
                    <Grid item xs={12} sm={6} md={3} key={account.id}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                borderLeft: `6px solid ${account.color || theme.palette.primary.main}`,
                                width: 350,
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="start">
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" fontWeight="medium">
                                            {account.name}
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" sx={{mt: 1}}>
                                            {account.balance.toLocaleString('pl-PL', {minimumFractionDigits: 2})} {account.currency.symbol}
                                        </Typography>
                                    </Box>
                                    <AccountBalanceWalletIcon
                                        sx={{color: hexToRgba(account.color || '#000', 0.3), fontSize: 32}}/>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={0} sx={{borderRadius: 3, bgcolor: 'primary.main', color: 'white', width: 350}}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{opacity: 0.8}}>Suma środków</Typography>
                            <Typography variant="h5" fontWeight="bold" sx={{mt: 1}}>
                                ~ {totalBalance.amount} {totalBalance.currency}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* CHARTS */}
            <Box display={'flex'} gap={2} mb={4}>

                {/* LEWA STRONA: WYKRES KOŁOWY (Kategorie) */}
                <Grid item xs={12} md={5} sx={{flex: 1}}>
                    <Card flex={1} variant="outlined"
                          sx={{borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
                        <CardContent sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                            <Box mb={2}>
                                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                                    Wydatki według kategorii
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Rozkład wydatków w bieżącym miesiącu
                                </Typography>
                            </Box>

                            <Box sx={{
                                flex: 1,
                                minHeight: 250,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryAmounts}
                                            dataKey="amount"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            stroke="white"
                                            strokeWidth={2}
                                        >
                                            {categoryAmounts.map((entry, index) => {
                                                const catDef = allCategories.find(c => c.name === entry.category);
                                                return <Cell key={`cell-${index}`} fill={catDef?.color || '#cccccc'}/>;
                                            })}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => formatMoney(value)}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>

                            {/* Legenda pod wykresem */}
                            <Box mt={2}>
                                <Stack spacing={1}>
                                    {categoryAmounts.slice(0, 5).map((cat) => {
                                        const catDef = allCategories.find(c => c.name === cat.category);
                                        const color = catDef?.color || '#ccc';
                                        return (
                                            <Box key={cat.category} display="flex" justifyContent="space-between"
                                                 alignItems="center">
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                        bgcolor: color
                                                    }}/>
                                                    <Typography variant="body2"
                                                                color="text.secondary">{cat.category}</Typography>
                                                </Box>
                                                <Typography variant="body2"
                                                            fontWeight="bold">{formatMoney(cat.amount)}</Typography>
                                            </Box>
                                        )
                                    })}
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* PRAWA STRONA: WYKRES SŁUPKOWY (Tygodniowe) */}
                <Grid item xs={12} md={7} sx={{flex: 1}}>
                    <Card variant="outlined"
                          sx={{borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
                        <CardContent sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                            <Box mb={3}>
                                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                                    Wydatki tygodniowe
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Twoje wydatki w ostatnim tygodniu
                                </Typography>
                            </Box>

                            <Box sx={{flex: 1, width: '100%', minHeight: 250}}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyExpenses} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                        <defs>
                                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#A175BF" stopOpacity={0.9}/>
                                                <stop offset="95%" stopColor="#5C86D3" stopOpacity={0.8}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true}
                                                       stroke="#f0f0f0"/>
                                        <XAxis
                                            dataKey="day"
                                            tick={{fontSize: 12, fill: '#666'}}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tickFormatter={(val) => `${val} ${user?.currency.symbol}`}
                                            tick={{fontSize: 11, fill: '#aaa'}}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <RechartsTooltip
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{
                                                borderRadius: 8,
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                            formatter={(value: number) => [`${value} ${user?.currency.symbol}`, 'Suma']}
                                        />
                                        <Bar
                                            dataKey="amount"
                                            fill="url(#colorBar)"
                                            radius={[4, 4, 0, 0]}
                                            barSize={35}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>

                            <Divider sx={{my: 2}}/>

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Średnia dzienna</Typography>
                                    <Typography variant="body2"
                                                fontWeight="bold">{weeklyStats.avg} {user?.currency.symbol}</Typography>
                                </Box>
                                <Box textAlign="right">
                                    <Typography variant="caption" color="text.secondary">Najwyższy dzień</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {weeklyStats.maxDay} ({weeklyStats.maxAmount} {user?.currency.symbol})
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Box>

            {/* Last transactions */}
            <Card variant="outlined" sx={{borderRadius: 2}}>
                <CardContent>
                    <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <AttachMoneyIcon color="primary"/>
                        <Typography variant="h6" fontWeight="bold">Ostatnie transakcje</Typography>
                    </Stack>
                    <List disablePadding>
                        {recentExpenses.length === 0 && (
                            <Typography color="text.secondary" sx={{py: 2, textAlign: 'center'}}>
                                Brak ostatnich transakcji w tym miesiącu.
                            </Typography>
                        )}
                        {recentExpenses.map((expense, index) => {
                            const category = allCategories.find(c => c.name === expense.category);
                            const color = category?.color || '#ccc';
                            const bg = hexToRgba(color, 0.1);

                            return (
                                <React.Fragment key={expense.id}>
                                    <ListItem sx={{px: 1}}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: bg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2,
                                                color: color,
                                                fontWeight: 'bold',
                                                fontSize: 18
                                            }}
                                        >
                                            {expense.category.charAt(0).toUpperCase()}
                                        </Box>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    fontWeight="medium">{expense.description || 'Bez opisu'}</Typography>
                                            }
                                            secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    {dayjs(expense.createdAt).format('DD MMMM YYYY')} • {expense.category}
                                                </Typography>
                                            }
                                        />
                                        <Typography variant="body1" fontWeight="bold" color="error.main">
                                            {expense.price.toLocaleString('pl-PL', {minimumFractionDigits: 2})} {findTransactionCurrency(expense)}
                                        </Typography>
                                    </ListItem>
                                    {index < recentExpenses.length - 1 && <Divider component="li" variant="inset"/>}
                                </React.Fragment>
                            );
                        })}
                    </List>
                </CardContent>
            </Card>


            <Box display={'flex'} gap={2} mb={3} mt={3}>
                <Box flex={1}>
                    {auditorData && (
                        <HealthScoreWidget recommendationText={auditorData.recommendation} />
                    )}
                </Box>
                <Box flex={1}>
                    <AuditorWidget data={auditorData} />
                </Box>
            </Box>


            <Grid item xs={12} md={6}>
                <CashFlowWidget />
            </Grid>
        </Box>
    );
}

export default Dashboard;