import React from 'react';
import {Card, CardContent, Typography, Box, useTheme} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

type Props = {
    title: string;
    amount: number;
    period: string;
    currency?: string;
    startColor: string;
    icon?: React.ReactNode;
}

const IncomeSummaryCard: React.FC<Props> = ({
                                                title,
                                                amount,
                                                period,
                                                currency = 'zł',
                                                startColor = '#e3f2fd',
                                                icon
                                            }) => {

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const formattedAmount = amount.toLocaleString('pl-PL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                background: `linear-gradient(to bottom right, ${hexToRgba(startColor, 0.2)}, #FFFFFF)`,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1
                    }}
                >
                    <Box sx={{
                        color: startColor,
                        mr: 1,
                        fontSize: 20,
                    }}>
                        {icon}
                    </Box>
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight="medium"
                    >
                        {title}
                    </Typography>
                </Box>

                <Typography
                    variant="h4"
                    component="div"
                    sx={{
                        fontWeight: 'bold',
                        color: startColor,
                        mt: 2,
                        mb: 1,
                    }}
                >
                    {formattedAmount} {currency}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {period}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default IncomeSummaryCard;