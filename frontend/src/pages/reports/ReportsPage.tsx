import React, {useEffect, useState} from 'react'
import {Box, Typography, Button, Paper, Tabs, Tab} from '@mui/material'
import {
    getAllCategoriesAmount,
    getCategories,
    getMonthlyOverview,
    getTopExpenses,
    getTransactionOverview
} from '../../lib/api'
import dayjs, {type Dayjs} from 'dayjs'
import SummaryCard from "./SummaryCard"
import type {Category, CategoryAmount, Expense, MonthlyOverview, TransactionOverview} from "../../lib/types.ts";
import {AttachMoneyOutlined, TrendingDown} from "@mui/icons-material"
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import AvarageSummaryCard from "./AvarageSummaryCard.tsx";
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Overview from "./tabs/Overview.tsx";

const TrendyView = () => <Typography>Zawartość: Trendy</Typography>;
const KategorieView = () => <Typography>Zawartość: Kategorie</Typography>;

const TABS = ['Przegląd', 'Trendy', 'Kategorie', 'Przepływy', 'Budżet', 'Eksporty'];

const ReportsPage: React.FC = () => {
    const [expenseOverview, setExpenseOverview] = useState<TransactionOverview>();
    const [incomeOverview, setIncomeOverview] = useState<TransactionOverview>();
    const [monthlyOverview, setMonthlyOverview] = useState<MonthlyOverview[]>([])
    const [topExpenses, setTopExpenses] = useState<Expense[]>([]);
    const [categoriesExpenses, setCategoriesExpenses] = useState<CategoryAmount[]>([])
    const [allExpenseCategories, setAllExpenseCategories] = useState<Category[]>([])
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const dateFrom = selectedDate.startOf("month").format("YYYY-MM-DD");
    const dateTo = selectedDate.endOf("month").format("YYYY-MM-DD");
    const [value, setValue] = useState(0);

    useEffect(() => {
        getTransactionOverview('EXPENSE', dateFrom, dateTo).then((res) => setExpenseOverview(res.data)).catch(console.error);
        getTransactionOverview('INCOME', dateFrom, dateTo).then((res) => setIncomeOverview(res.data)).catch(console.error);
        getAllCategoriesAmount('EXPENSE', dateFrom, dateTo).then((res) => setCategoriesExpenses(res.data));
        getCategories('EXPENSE').then((res) => setAllExpenseCategories(res.data))
        getMonthlyOverview("2025-03-31", "2025-12-31").then((res) => setMonthlyOverview(res.data))
        getTopExpenses("2025-03-31", "2025-12-31", 8, 'EXPENSE').then((res) => setTopExpenses(res.data))
    },[dateFrom, dateTo]);

    const totalExpenses = expenseOverview?.totalAmount ?? 0
    const averageExpenses = expenseOverview?.averageAmount ?? 0
    const totalIncome = incomeOverview?.totalAmount ?? 0
    const averageIncome = incomeOverview?.averageAmount ?? 0
    const balance = totalIncome + totalExpenses
    const savingsRate = totalExpenses !== 0 ? Number((((totalIncome - Math.abs(totalExpenses)) / totalIncome) * 100).toFixed(2)) : 0

    const handleViewChange = (event, newValue) => {
        setValue(newValue);
    };

    const renderContent = (index) => {
        switch (index) {
            case 0:
                return <Overview
                    categoriesOverview={categoriesExpenses}
                    allExpenseCategories={allExpenseCategories}
                    monthlyOverview={monthlyOverview}
                    topExpenses={topExpenses}
                />;
            case 1:
                return <TrendyView />;
            case 2:
                return <KategorieView />;
            default:
                return <Typography>Wybierz zakładkę</Typography>;
        }
    };

    return (
        <>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight={"bold"}
                                color={"secondary"}>Raporty i Analityka</Typography>
                    <Typography variant="body2" sx={{mt: 1}}>Kompleksowa analiza twoich finansów</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            views={["year","month"]}
                            label="Miesiąc"
                            value={selectedDate}
                            onChange={(newVal) => { if (newVal) setSelectedDate(newVal) }}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </LocalizationProvider>

                    <Button
                        variant={'contained'}
                        color={"secondary"}
                        onClick={() => {
                        }}
                    >
                        Button Akcji
                    </Button>
                </Box>
            </Box>

            <Box p={2} display="grid" gap={2}
                 sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)'}}}>
                <SummaryCard
                    title="Wydatki"
                    // description=" względem poprzedniego miesiąca"
                    amount={totalExpenses}
                    change={expenseOverview?.totalAmountChangePercentage ?? 0}
                    currency="zł"
                    accentColor="#E53935"
                    icon={<AttachMoneyOutlined fontSize="medium"/>}
                />
                <SummaryCard
                    title="Przychody"
                    // description=" transakcji w tym miesiącu"
                    amount={totalIncome}
                    change={incomeOverview?.totalAmountChangePercentage ?? 0}
                    currency="zł"
                    accentColor="#70B2B1"
                    icon={<ReceiptIcon fontSize="medium"/>}
                />
                <SummaryCard
                    title="Bilans"
                    // description="na podstawie 30 dni"
                    amount={balance}
                    currency="zł"
                    accentColor="#5C86D3"
                    icon={<TrendingUpIcon fontSize="medium"/>}
                />
                <SummaryCard
                    title="Stopa oszczędności"
                    // description="na podstawie 30 dni"
                    amount={savingsRate}
                    currency="%"
                    accentColor={'secondary.main'}
                    icon={<CrisisAlertIcon fontSize="medium"/>}
                />
            </Box>

            <Box p={2} display="grid" gap={2}
                 sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)'}}}>
                <AvarageSummaryCard
                    title="Średnie miesięczny przychód"
                    amount={averageIncome}
                    period="Ostatnie 30 dni"
                    startColor={"#5C86D3"}
                    icon={<TrendingUpIcon/>}
                />
                <AvarageSummaryCard
                    title="Średnie miesięczne wydatki"
                    amount={averageExpenses}
                    period="Ostatnie 30 dni"
                    startColor={"#A175BF"}
                    icon={<TrendingDown />}
                />
                <AvarageSummaryCard
                    title="Oszczędności"
                    amount={totalExpenses}
                    period="Ostatnie 30 dni"
                    startColor={"#cda25d"}
                    icon={<AccountBalanceWalletIcon />}
                />
            </Box>

            <Box p={2} sx={{ width: '100%' }}>
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: '#e3e3e3',
                        borderRadius: '50px',
                        p: '5px',
                    }}
                >
                    <Tabs
                        value={value}
                        onChange={handleViewChange}
                        variant="fullWidth"
                        TabIndicatorProps={{ style: { display: 'none' } }}
                        sx={{ minHeight: 'auto' }}
                    >
                        {TABS.map((label, index) => (
                            <Tab
                                key={index}
                                label={label}
                                sx={{
                                    minHeight: 'auto',
                                    py: 1,
                                    borderRadius: '40px',
                                    ...(value === index && {
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                    }),
                                    ...((value !== index) && {
                                        color: 'text.secondary',
                                        opacity: 1,
                                    }),
                                }}
                            />
                        ))}
                    </Tabs>
                </Paper>

                {/* 2. Kontener Treści */}
                <Box sx={{ mt: 3, p: 2 }}>
                    {renderContent(value)}
                </Box>
            </Box>

        </>
    )
}

export default ReportsPage
