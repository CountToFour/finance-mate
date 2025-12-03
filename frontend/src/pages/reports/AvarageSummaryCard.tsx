import React from 'react';
import {Card, CardContent, Typography, Box, useTheme} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

type Props = {
    title: string;
    amount: number;
    period: string;
    currency?: string;
    startColor: string;
}

const IncomeSummaryCard: React.FC<Props> = ({
                                                title,
                                                amount,
                                                period,
                                                currency = 'zł',
                                                startColor = '#e3f2fd'
                                            }) => {
    const theme = useTheme();

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
                background: `linear-gradient(to bottom right, ${startColor}, #FFFFFF)`,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1 // Margines dolny
                    }}
                >
                    <TrendingUpIcon
                        sx={{
                            fontSize: 20,
                            mr: 1,
                            color: theme.palette.primary.main
                        }}
                    />
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
                        color: theme.palette.primary.main,
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