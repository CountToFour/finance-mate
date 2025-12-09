import React, {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, Typography, Box, List} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, CartesianGrid, Area
} from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type {Account, Category, CategoryAmount, Expense, MonthlyOverview} from "../../../lib/types.ts";
import ExpenseListItem from "./ExpenseListItem.tsx";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {getAccounts} from "../../../lib/api.ts";
import SafetyNetWidget from "../SafetyNetWidget.tsx";

type Props = {
    categoriesOverview: CategoryAmount[],
    allExpenseCategories: Category[]
    monthlyOverview: MonthlyOverview[],
    topExpenses: Expense[],
    currency?: string,
}

const Overview: React.FC<Props> = ({
                                       categoriesOverview,
                                       allExpenseCategories,
                                       monthlyOverview,
                                       topExpenses,
                                       currency = ''
                                   }) => {

    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        getAccounts().then((res) => {
            setAccounts(res.data);
        });
    }, []);

    const comulativeData = useMemo(() => {
        let cumulativeSum = 0;
        return monthlyOverview.map(item => {
            const monthlySavings = item.totalIncome - item.totalExpense;
            cumulativeSum += monthlySavings;
            return {
                month: item.month,
                savingsCumulative: cumulativeSum,
            };
        });
    }, [monthlyOverview]);

    const findTransactionCurrency = (transaction: Expense) => {
        const account = accounts.find(a => a.name === transaction.accountName);
        const symbol = account?.currency?.symbol ?? '';
        return symbol
    }

    return (
        <>
            <Box display="flex" gap={2} alignItems="center">
                {/*Przychody vs Wydatki*/}
                <Card sx={{flex: 1}}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                            <AssessmentIcon color="primary" sx={{mr: 1}}/>
                            <Typography variant="h6" component="div" fontWeight="medium">
                                Przychody vs Wydatki
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Porównanie miesięczne (ostatnie 9 miesięcy)
                        </Typography>

                        <Box sx={{width: '100%', height: 380}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyOverview}
                                    margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                >
                                    {/* 1. Oś X: Używamy pola 'month' zamiast 'name' */}
                                    <XAxis dataKey="month" stroke="#555"/>
                                    <YAxis/>
                                    <Tooltip
                                        formatter={(value, name) => [`${value} ${currency}`, name]}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{paddingTop: '10px'}}/>
                                    <Bar
                                        dataKey="totalIncome"
                                        name="Przychody"
                                        fill="#4B77C2"
                                    />
                                    <Bar
                                        dataKey="totalExpense"
                                        name="Wydatki"
                                        fill="#A87AAB"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
                {/*Wykres kategorii*/}
                <Card sx={{flex: 1}}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                            <AccessTimeIcon color="primary" sx={{mr: 1}}/>
                            <Typography variant="h6" component="div" fontWeight="medium">
                                Struktura wydatków
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Rozkład według kategorii (wrzesień)
                        </Typography>

                        <Box sx={{width: '100%', height: 380}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoriesOverview}
                                        dataKey="amount"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={150}
                                        fill="#8884d8"
                                        paddingAngle={2}
                                        label={({
                                                    name,
                                                    percent
                                                }) => `${(percent * 100).toFixed(0)}%`} // Etykieta procentowa
                                    >
                                        {categoriesOverview.map((entry, index) => {
                                            // entry.category zakładam jako pole w CategoryAmount
                                            const color = allExpenseCategories.find(c => c.name === entry.category)?.color || '#CCCCCC';
                                            return <Cell key={`cell-${index}`} fill={color}/>;
                                        })}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [`${value} ${currency}`, 'Kwota']}
                                        labelFormatter={(label, payload) => payload[0]?.name || label}
                                    />
                                    <Legend
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        wrapperStyle={{
                                            paddingLeft: '20px',
                                            paddingRight: '20px',
                                            fontSize: '16px',
                                        }}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
            {/*Wzrost oszczędności*/}
            <Card sx={{mt: 4}}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                        <TrendingUpIcon sx={{mr: 1, color: '#DEB887'}}/>
                        <Typography variant="h6" component="div" fontWeight="medium">
                            Wzrost oszczędności
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Kumulatywne oszczędności w czasie
                    </Typography>
                    <Box sx={{width: '100%', height: 300}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={comulativeData}
                                margin={{top: 10, right: 30, left: 0, bottom: 0}}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.5}/>

                                <XAxis dataKey="month" tickLine={false} axisLine={false}/>

                                <YAxis
                                    tickFormatter={(value) => `${value} ${currency}`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                    }}
                                    formatter={(value) => [`Oszczędności: ${value.toLocaleString('pl-PL')} ${currency}`, '']}
                                    labelFormatter={(label) => label}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="savingsCumulative"
                                    stroke="#DEB887"
                                    fill="#DEB887"
                                    fillOpacity={0.5}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* Lista Transakcji */}
            <Card sx={{mt: 4}}>
                <CardContent>
                    <Box mb={2}>
                        <Box display="flex" alignItems="center" mb={0.5}>
                            <AssessmentIcon color="error" sx={{mr: 1, fontSize: 20}}/>
                            <Typography variant="h6" component="div" fontWeight="medium">
                                Największe wydatki
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Top 8 wydatków w tym miesiącu
                        </Typography>
                    </Box>

                    <List disablePadding>
                        {topExpenses.map((expense, index) => {
                            const color = allExpenseCategories.find(c => c.name === expense.category)?.color || '#CCCCCC';
                            return <ExpenseListItem
                                key={index}
                                item={expense}
                                color={color}
                                currency={findTransactionCurrency(expense)}
                            />;
                        })}
                    </List>
                </CardContent>
            </Card>
            <SafetyNetWidget />
        </>
    )
}

export default Overview