import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

type Props = {
    title: string;
    amount: number;
    currency?: string;
}

const IncomeSummaryCard: React.FC<Props> = ({title, amount, currency}) => {
    return (
        <Card elevation={0} sx={{borderRadius:2}}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight={'bold'}>{title}</Typography>
                <Typography variant="h5" fontWeight={600} color={'secondary'}>{amount} {currency}</Typography>
            </CardContent>
        </Card>
    )
}

export default IncomeSummaryCard;
