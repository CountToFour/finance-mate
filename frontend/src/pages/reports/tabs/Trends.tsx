import type {Account, Category, CategoryAmount, Expense, MonthlyOverview} from "../../../lib/types.ts";
import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, Typography, Box, List} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import CategoryTrendItem from "./CategoryTrendItem.tsx";
import {getAccounts} from "../../../lib/api.ts";

type Props = {
    categoriesOverview: CategoryAmount[],
    allIncomeCategories: Category[]
    monthlyOverview: MonthlyOverview[],
    expenseCategoriesOverview: CategoryAmount[],
    previousExpenseCategoriesOverview: CategoryAmount[],
    currency?: string
}

const Trends: React.FC<Props> = ({
                                     categoriesOverview,
                                     allIncomeCategories,
                                     monthlyOverview,
                                     expenseCategoriesOverview,
                                     previousExpenseCategoriesOverview,
                                     currency
                                 }) => {

    const balanceData = useMemo(() => {
        console.log(allIncomeCategories)
        return monthlyOverview.map(item => ({
            month: item.month,
            monthlyBalance: item.totalIncome - item.totalExpense
        }));
    }, [monthlyOverview]);

    return (
        <>
            <Card sx={{boxShadow: 3, borderRadius: 2, height: 400}}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                        <TrendingUpIcon color="primary" sx={{mr: 1, fontSize: 20}}/>
                        <Typography variant="h6" component="div" fontWeight="medium">
                            Trend bilansu miesięcznego
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Śledzenie dodatniego bilansu w czasie
                    </Typography>

                    <Box sx={{width: '100%', height: 300}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={balanceData}
                                margin={{top: 10, right: 30, left: -10, bottom: 0}} // Lekkie przesunięcie osi Y
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.5}/>
                                <XAxis dataKey="month" tickLine={false} axisLine={true} stroke="#ccc"/>
                                <YAxis
                                    tickFormatter={(value) => `${value} ${currency}`}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                    }}
                                    formatter={(value) => [`${value.toLocaleString('pl-PL')} ${currency}`, 'Bilans miesięczny']}
                                    labelFormatter={(label) => label}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="monthlyBalance"
                                    stroke="#4B77C2"
                                    fill="#4B77C2"
                                    fillOpacity={0.2}
                                    dot={{stroke: '#4B77C2', strokeWidth: 2, r: 4, fill: '#fff'}}
                                    activeDot={{r: 8, stroke: '#4B77C2', fill: '#fff'}}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
            <Box display="flex" gap={2} alignItems="center" mt={4} height={500}>
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
                                                }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {categoriesOverview.map((entry, index) => {
                                            const color = allIncomeCategories.find(c => c.name === entry.category)?.color || '#CCCCCC';
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
                <Card sx={{flex: 1, height: 500}}>
                    <CardContent>
                        {/* Nagłówek Komponentu */}
                        <Box mb={2}>
                            <Box display="flex" alignItems="center" mb={0.5}>
                                <TimelineIcon color="primary" sx={{mr: 1, fontSize: 20}}/>
                                <Typography variant="h6" component="div" fontWeight="medium">
                                    Trendy kategorii
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Porównanie z poprzednim miesiącem
                            </Typography>
                        </Box>

                        <List disablePadding>
                            {expenseCategoriesOverview.map((trend, index) => {
                                const previousAmount = previousExpenseCategoriesOverview.find(
                                    c => c.category === trend.category
                                )?.amount || 0;

                                let changePercentage = 0;
                                let isIncrease = false;

                                if (previousAmount > 0) {
                                    const change = trend.amount - previousAmount;
                                    changePercentage = Number.parseFloat((change / previousAmount * 100).toFixed(2));
                                    isIncrease = change > 0;
                                } else if (trend.amount > 0 && previousAmount === 0) {
                                    changePercentage = 100;
                                    isIncrease = true;
                                }

                                return <CategoryTrendItem
                                    key={index}
                                    categoryName={trend.category}
                                    currentAmount={trend.amount}
                                    previousAmount={previousAmount}
                                    changePercent={Math.abs(changePercentage)}
                                    isIncrease={isIncrease}
                                    currency={currency}
                                />;
                            })}
                        </List>
                    </CardContent>
                </Card>
            </Box>
        </>
    )
}

export default Trends;
