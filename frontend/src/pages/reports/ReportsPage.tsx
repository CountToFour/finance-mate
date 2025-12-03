import React, {useEffect, useState} from 'react'
import { Box, Typography, Button } from '@mui/material'
import { getTransactionOverview } from '../../lib/api'
import dayjs, {type Dayjs} from 'dayjs'
import SummaryCard from "./SummaryCard"
import type {TransactionOverview} from "../../lib/types.ts";
import { AttachMoneyOutlined } from "@mui/icons-material"
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import AvarageSummaryCard from "./AvarageSummaryCard.tsx";

const ReportsPage: React.FC = () => {
    const [expenseOverview, setExpenseOverview] = useState<TransactionOverview>();
    const [incomeOverview, setIncomeOverview] = useState<TransactionOverview>();
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const dateFrom = selectedDate.startOf("month").format("YYYY-MM-DD");
    const dateTo = selectedDate.endOf("month").format("YYYY-MM-DD");

    useEffect(() => {
        getTransactionOverview('EXPENSE', dateFrom, dateTo).then((res) => setExpenseOverview(res.data)).catch(console.error);
        getTransactionOverview('INCOME', dateFrom, dateTo).then((res) => setIncomeOverview(res.data)).catch(console.error);
    },[dateFrom, dateTo]);

    const totalExpenses = expenseOverview?.totalAmount ?? 0
    const totalIncome = incomeOverview?.totalAmount ?? 0
    const balance = totalIncome + totalExpenses
    const savingsRate = totalExpenses !== 0 ? Number((((totalIncome - Math.abs(totalExpenses)) / totalIncome) * 100).toFixed(2)) : 0

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
                    icon={<TrendingUpIcon fontSize="medium"/>}
                />
            </Box>

            <Box p={2} display="grid" gap={2}
                 sx={{gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)'}}}>
                <AvarageSummaryCard
                    title="Średni miesięczny przychód"
                    amount={totalExpenses}
                    period="Ostatnie 30 dni"
                />
                <AvarageSummaryCard
                    title="Średni miesięczny przychód"
                    amount={totalExpenses}
                    period="Ostatnie 30 dni"
                />
                <AvarageSummaryCard
                    title="Średni miesięczny przychód"
                    amount={totalExpenses}
                    period="Ostatnie 30 dni"
                />
            </Box>
        </>
    )
}

export default ReportsPage
