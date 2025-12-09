import React, {useEffect, useState} from 'react';
import {Card, CardContent, Typography, Box, LinearProgress, Alert, Divider} from '@mui/material';
import {getSpendingAuditor} from '../../lib/api';
import type {SpendingStructure} from '../../lib/types';

const AuditorWidget: React.FC = () => {
    const [data, setData] = useState<SpendingStructure | null>(null);

    useEffect(() => {
        getSpendingAuditor().then(res => setData(res.data)).catch(console.error);
    }, []);

    if (!data) return null;

    const renderBar = (label: string, value: number, target: number, color: string) => {
        const isOver = value > target;
        const progress = Math.min((value / target) * 100, 100);
        return (
            <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="bold">{label}</Typography>
                    <Typography variant="body2"
                                color={isOver && label !== 'Oszczędności' ? 'error.main' : 'text.primary'}>
                        {value}% <Typography component="span" variant="caption"
                                             color="text.secondary">/ {target}%</Typography>
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {bgcolor: color}
                    }}
                />
            </Box>
        );
    };

    return (
        <Card variant="outlined" sx={{borderRadius: 2, height: '100%', mt: 3}}>
            <CardContent>
                <Box mb={2}>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        Audytor Struktury Wydatków
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Zasada budżetowa: 50% potrzeby, 30% zachcianki, 20% oszczędności
                    </Typography>
                </Box>
                <Divider sx={{mb: 2}} />

                {renderBar("Potrzeby (Needs)", data.needsPercent, 50, "#4caf50")}
                {renderBar("Zachcianki (Wants)", data.wantsPercent, 30, "#ff9800")}
                {renderBar("Oszczędności (Savings)", data.savingsPercent, 20, "#2196f3")}

                <Alert
                    severity={data.recommendation.includes("wzorowa") ? "success" : "warning"}
                    sx={{mt: 2, fontSize: '0.85rem'}}
                >
                    {data.recommendation}
                </Alert>
            </CardContent>
        </Card>
    );
};

export default AuditorWidget;