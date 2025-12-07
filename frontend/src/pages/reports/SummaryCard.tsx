import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

type Props = {
    title: string;
    description?: string;
    amount: number;
    change?: number;
    currency?: string;
    accentColor?: string;
    icon?: React.ReactNode;
    sx?: SxProps<Theme>;
};

const ExpenseSummaryCard: React.FC<Props> = ({
                                                 title,
                                                 description,
                                                 amount,
                                                 currency,
                                                 accentColor,
                                                 icon,
                                                 sx,
                                             }) => {

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
                borderLeft: `6px solid ${accentColor}`,
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
                                color: accentColor,
                            }}
                        >
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