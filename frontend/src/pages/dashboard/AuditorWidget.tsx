import React, {useEffect, useState} from 'react';
import {Card, CardContent, Typography, Box, LinearProgress, Divider} from '@mui/material';
import {getSpendingAuditor} from '../../lib/api';
import type {SpendingStructure} from '../../lib/types';

interface Props {
    data?: SpendingStructure | null;
}

const AuditorWidget: React.FC<Props> = ({ data: externalData }) => {
    const [internalData, setInternalData] = useState<SpendingStructure | null>(null);

    useEffect(() => {
        if (!externalData) {
            getSpendingAuditor().then(res => setInternalData(res.data)).catch(console.error);
        }
    }, [externalData]);

    const data = externalData || internalData;

    if (!data) return null;

    const renderBar = (label: string, value: number, target: number, color: string) => {
        const progress = Math.min((value / target) * 100, 100);
        return (
            <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="bold">{label}</Typography>
                    <Typography variant="body2" color="text.primary">
                        {value}% <Typography component="span" variant="caption" color="text.secondary">/ {target}%</Typography>
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 8,
                        borderRadius: 5,
                        bgcolor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {bgcolor: color}
                    }}
                />
            </Box>
        );
    };

    return (
        <Card variant="outlined" sx={{borderRadius: 2, height: '100%'}}>
            <CardContent>
                <Box mb={2}>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        Struktura Wydatków
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Cel: 50% potrzeby, 30% zachcianki, 20% oszczędności
                    </Typography>
                </Box>
                <Divider sx={{mb: 2}} />

                {renderBar("Potrzeby (Needs)", data.needsPercent, 50, "#4caf50")}
                {renderBar("Zachcianki (Wants)", data.wantsPercent, 30, "#ff9800")}
                {renderBar("Oszczędności (Savings)", data.savingsPercent, 20, "#2196f3")}

            </CardContent>
        </Card>
    );
};

export default AuditorWidget;