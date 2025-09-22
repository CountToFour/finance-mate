// ExpenseSummaryCard.tsx
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

type Props = {
    type: "totalExpenses" | "totalTransactions" | "Average";
    title: string;
    description?: string;
    amount: number;
    change?: number;     // np. 3 dla +3%, -2.5 dla -2.5%
    currency?: string;          // domyślnie "zł"
    accentColor?: string;       // kolor paska i akcentu, np. '#E53935' albo 'error.main'
    icon?: React.ReactNode;     // np. <AttachMoneyOutlined />
    sx?: SxProps<Theme>;        // opcjonalne dodatkowe style
};

const ExpenseSummaryCard: React.FC<Props> = ({
                                                 type,
                                                 title,
                                                 description,
                                                 amount,
                                                 change,
                                                 currency = 'zł',
                                                 accentColor = 'error.main',
                                                 icon,
                                                 sx,
                                             }) => {

    const changeIsPositive = typeof change === 'number' && change >= 0;

    const changeText = () => {
        if (type === 'totalExpenses') {
            return changeIsPositive ? `+${change}%` : `-${change}%`;
        } else if (type === 'totalTransactions') {
            return changeIsPositive ? `+${change}` : `-${change}`;
        } else if (type === 'Average') {
            return '';
        }
    }

    return (
        <Card
            elevation={0}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                ...sx,
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="subtitle1" fontWeight={"bold"}>
                        {title}
                    </Typography>
                    <Box sx={{color:accentColor}}>
                        {icon}
                    </Box>
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        marginTop: 4,
                        fontWeight: 600,
                        color: accentColor,
                    }}
                >
                    {amount} {currency}
                </Typography>

                    <Box display="flex">
                        <Typography
                            variant="body2"
                            sx={{
                                color: accentColor, // lub changeIsPositive ? 'success.main' : 'error.main'
                            }}
                        >
                            {changeText()}
                        </Typography >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {description}
                        </Typography>
                    </Box>

            </CardContent>
        </Card>
    );
};

export default ExpenseSummaryCard;